// Manual OAuth2 authorization-code flow — no Passport, so every step is visible.
// Docs: https://developers.google.com/identity/protocols/oauth2/web-server

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

// Step 1: build the consent-screen URL the browser is redirected to
const getGoogleAuthUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state
  });
  return `${AUTH_URL}?${params.toString()}`;
};

// Step 2: exchange the one-time code for Google tokens
const exchangeCodeForTokens = async (code) => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed: ${body}`);
  }
  return res.json();
};

// Step 3: fetch the user's verified profile with the Google access token
const fetchGoogleProfile = async (accessToken) => {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error('Failed to fetch Google profile');
  return res.json(); // { sub, email, email_verified, name, picture }
};

module.exports = { getGoogleAuthUrl, exchangeCodeForTokens, fetchGoogleProfile };
