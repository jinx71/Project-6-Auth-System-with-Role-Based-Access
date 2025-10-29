const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');

const REFRESH_COOKIE = 'refresh_token';
const refreshTtlMs = () =>
  Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;

const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || '15m'
  });

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Refresh tokens are opaque random strings, stored only as SHA-256 hashes
const issueRefreshToken = async (userId) => {
  const token = crypto.randomBytes(48).toString('hex');
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + refreshTtlMs())
    }
  });
  return token;
};

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: refreshTtlMs()
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
};

module.exports = {
  REFRESH_COOKIE,
  signAccessToken,
  hashToken,
  issueRefreshToken,
  setRefreshCookie,
  clearRefreshCookie
};
