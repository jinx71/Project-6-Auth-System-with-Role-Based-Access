# Sentinel — Auth System with Role-Based Access Control

A production-pattern authentication system: JWT access tokens, rotating refresh tokens, Google OAuth2 (hand-rolled authorization-code flow), and three-tier RBAC (`ADMIN` / `USER` / `VIEWER`) enforced server-side and mirrored in the UI.

> Project 6 of a 12-project full-stack portfolio. Built to demonstrate the auth topics most commonly probed in full-stack interviews: token lifecycle, OAuth2 flow mechanics, and permission middleware.

**Live demo:** _coming soon_

![Screenshot placeholder](docs/screenshot.png)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access), opaque rotating refresh tokens (httpOnly cookie), bcrypt, Google OAuth2 |

## Key Security Decisions

- **Access token in memory only** — never localStorage, so an XSS payload can't lift a long-lived credential.
- **Refresh token is opaque + hashed** — random 384-bit string, stored as SHA-256 hash; a DB leak exposes nothing usable.
- **Rotation on every refresh** — old token is consumed, so a stolen refresh token dies on first reuse.
- **OAuth `state` parameter** — CSRF guard on the Google callback, verified via short-lived cookie.
- **RBAC enforced server-side** — `authorize('ADMIN')` middleware on routes; the React role guards are UX only.
- **Role changes revoke sessions** — demoting a user deletes their refresh tokens, forcing re-auth with the new role.
- **No account enumeration** — identical error for unknown email vs wrong password.

## API

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/refresh` | refresh cookie |
| POST | `/api/auth/logout` | refresh cookie |
| GET | `/api/auth/me` | any authenticated |
| GET | `/api/auth/google` → `/google/callback` | public (OAuth flow) |
| PATCH | `/api/users/me` | any authenticated |
| GET | `/api/users` | ADMIN, VIEWER |
| PATCH | `/api/users/:id/role` | ADMIN |
| DELETE | `/api/users/:id` | ADMIN |

All responses follow `{ success, data, message }`.

## Setup

### 1. Database
Local PostgreSQL or a free Railway/Render instance. Put the connection string in `server/.env`.

### 2. Google OAuth credentials
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth client ID (Web application)**:
- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

### 3. Server
```bash
cd server
cp .env.example .env   # fill in values
npm install
npx prisma migrate dev --name init
npm run seed           # creates the admin account from .env
npm run dev            # http://localhost:5000
```

### 4. Client
```bash
cd client
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

Sign in with the seeded admin to manage roles, or register/Google-sign-in as a regular user.

## Project Structure

```
server/
  prisma/schema.prisma      # User, RefreshToken, Role enum
  src/
    middleware/auth.js      # authenticate + authorize(...roles)
    services/googleOAuth.js # manual OAuth2 code flow
    utils/tokens.js         # JWT signing, refresh rotation
    controllers/  routes/
client/
  src/
    api/axios.ts            # in-memory token + silent-refresh interceptor
    context/AuthContext.tsx # session bootstrap from refresh cookie
    components/ProtectedRoute.tsx  # auth + role route guards
    pages/                  # Login, Register, Dashboard, AdminPanel, Profile
```

## License
MIT
