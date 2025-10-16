const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const {
  REFRESH_COOKIE,
  signAccessToken,
  hashToken,
  issueRefreshToken,
  setRefreshCookie,
  clearRefreshCookie
} = require('../utils/tokens');
const {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  fetchGoogleProfile
} = require('../services/googleOAuth');

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  avatarUrl: u.avatarUrl,
  hasPassword: Boolean(u.password),
  createdAt: u.createdAt
});

const issueSession = async (res, user) => {
  const refreshToken = await issueRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  return signAccessToken(user);
};

const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) {
      return res.status(400).json({ success: false, data: null, message: 'email, name and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, data: null, message: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, data: null, message: 'An account with this email already exists' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), name, password: hashed }
    });

    const accessToken = await issueSession(res, user);
    res.status(201).json({
      success: true,
      data: { user: publicUser(user), accessToken },
      message: 'Account created'
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, data: null, message: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Same message for unknown email and wrong password — avoids account enumeration
    if (!user || !user.password) {
      return res.status(401).json({ success: false, data: null, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, data: null, message: 'Invalid email or password' });
    }

    const accessToken = await issueSession(res, user);
    res.json({
      success: true,
      data: { user: publicUser(user), accessToken },
      message: 'Signed in'
    });
  } catch (err) {
    next(err);
  }
};

// Rotation: every refresh consumes the old token and issues a new one,
// so a stolen refresh token only works until its first use.
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ success: false, data: null, message: 'No refresh token' });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true }
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, data: null, message: 'Session expired, sign in again' });
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const accessToken = await issueSession(res, stored.user);

    res.json({
      success: true,
      data: { user: publicUser(stored.user), accessToken },
      message: 'Token refreshed'
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    clearRefreshCookie(res);
    res.json({ success: true, data: null, message: 'Signed out' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, data: null, message: 'User not found' });
    }
    res.json({ success: true, data: { user: publicUser(user) }, message: 'OK' });
  } catch (err) {
    next(err);
  }
};

// --- Google OAuth2 ---

const googleRedirect = (req, res) => {
  // state guards the callback against CSRF — verified via a short-lived cookie
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000
  });
  res.redirect(getGoogleAuthUrl(state));
};

const googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const expectedState = req.cookies?.oauth_state;
    res.clearCookie('oauth_state');

    if (!code || !state || state !== expectedState) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleProfile(tokens.access_token);

    if (!profile.email_verified) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=email_unverified`);
    }

    // Link by googleId first, then by email (existing password account), else create
    let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });
    if (!user) {
      user = await prisma.user.upsert({
        where: { email: profile.email.toLowerCase() },
        update: { googleId: profile.sub, avatarUrl: profile.picture },
        create: {
          email: profile.email.toLowerCase(),
          name: profile.name || profile.email,
          googleId: profile.sub,
          avatarUrl: profile.picture
        }
      });
    }

    const refreshToken = await issueRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);
    // No tokens in the URL — the client calls /refresh to pick up the session
    res.redirect(`${process.env.CLIENT_URL}/oauth/callback`);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, me, googleRedirect, googleCallback };
