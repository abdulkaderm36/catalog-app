# JWT Authentication Design

**Date:** 2026-03-31
**Status:** Approved

## Overview

Implement end-to-end JWT authentication for the catalog app. The backend issues a signed JWT on login/signup; the frontend stores it in `localStorage` and attaches it as a `Bearer` token on every API request. Protected routes return `401` when the token is missing or invalid.

## Goals

- Replace stub auth routes with real implementations
- Block unauthenticated access to protected frontend routes
- Store users in Postgres via Drizzle ORM
- Keep the implementation minimal (MVP-grade)

## Out of scope

- Refresh token rotation
- OAuth / social login
- Email verification
- Password reset flow

---

## Backend

### New files

| File | Purpose |
|---|---|
| `backend/src/db/schema.ts` | Drizzle schema — `users` table |
| `backend/src/db/index.ts` | Drizzle client instance connected to `DATABASE_URL` |
| `backend/src/lib/auth.ts` | `signToken(sub)` and `verifyToken(token)` using `jose` + `JWT_SECRET` |
| `backend/src/middleware/auth.ts` | Hono middleware — reads `Authorization: Bearer <token>`, verifies it, sets `c.var.userId`; returns `401` on failure |

### Modified files

| File | Change |
|---|---|
| `backend/src/routes/auth.ts` | Replace stubs with real signup, login, /me, logout handlers |
| `backend/src/routes/products.ts` | Apply auth middleware |
| `backend/src/routes/dashboard.ts` | Apply auth middleware |
| `backend/src/routes/settings.ts` | Apply auth middleware |

### Database schema

```ts
// users table
id           uuid, primary key, default gen_random_uuid()
name         text, not null
email        text, not null, unique
password     text, not null        // bcrypt hash
company_name text, not null
company_slug text, not null, unique
created_at   timestamp, default now()
```

### JWT

- Library: `jose` (already installed)
- Algorithm: `HS256`
- Expiry: 7 days
- Payload: `{ sub: "<user_id>" }` — minimal by design; all user data is fetched from DB at request time

### Auth endpoints

| Method | Path | Auth required | Behaviour |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | No | Validate body, check email uniqueness, hash password (`bcrypt`), insert user, return JWT |
| `POST` | `/api/v1/auth/login` | No | Find user by email, compare password hash, return JWT |
| `GET` | `/api/v1/auth/me` | Yes | Verify token, fetch user from DB by `sub`, return `{ id, name, email, companyName, companySlug }` |
| `POST` | `/api/v1/auth/logout` | No | No-op — client is responsible for dropping the token |

### Auth middleware

```
Authorization: Bearer <token>
  → missing/invalid → 401 { error: "Unauthorized" }
  → valid           → c.set("userId", payload.sub); next()
```

Applied to all routes under `/api/v1/products`, `/api/v1/dashboard`, `/api/v1/settings`, `/api/v1/analytics`.

### Dependencies to install

- `drizzle-orm` + `drizzle-kit`
- `postgres` (Postgres.js driver)
- `bcrypt` + `@types/bcrypt`

---

## Frontend

### Modified files

| File | Change |
|---|---|
| `frontend/src/lib/api.ts` (new) | Fetch wrapper — reads token from `localStorage`, attaches `Authorization: Bearer <token>` header |
| `frontend/src/context/auth-context.tsx` | On mount: read token from localStorage, call `/api/auth/me`. `login(token, user)` saves token. `logout()` removes token. |
| `frontend/src/views/login-page.tsx` | Wire form submit to `POST /api/auth/login`, save token, navigate to `/dashboard` |
| `frontend/src/views/signup-page.tsx` | Wire form submit to `POST /api/auth/signup`, save token, navigate to `/dashboard` |

### Token storage

- Key: `auth_token` in `localStorage`
- Written on successful login/signup
- Read on app mount to restore session
- Deleted on logout

### Auth context changes

```ts
// current
login: (user: User) => void

// new
login: (token: string, user: User) => void
// saves token to localStorage, sets user in state
```

`/me` is called on mount only to hydrate the user object from a stored token. After that, user data flows from API responses.

### AuthGuard behaviour (unchanged)

The guard is already correct — it redirects to `/login` when `user` is null after loading completes. No changes needed.

---

## Data flow

```
Signup/Login
  → POST /api/auth/signup|login
  ← { token: "eyJ..." }
  → store token in localStorage
  → fetch /api/auth/me (with Bearer token)
  ← { id, name, email, companyName, companySlug }
  → set user in AuthContext
  → AuthGuard allows access

Page refresh
  → read token from localStorage
  → fetch /api/auth/me (with Bearer token)
  ← 200 { user } → restore session
  ← 401           → clear token, redirect to /login

Logout
  → remove token from localStorage
  → set user = null in AuthContext
  → AuthGuard redirects to /login
```

---

## Error handling

| Scenario | Backend response | Frontend behaviour |
|---|---|---|
| Invalid credentials | `401 { error: "Invalid credentials" }` | Show error toast |
| Email already taken | `409 { error: "Email already in use" }` | Show field error |
| Missing/invalid token | `401 { error: "Unauthorized" }` | Clear token, redirect to /login |
| Token expired | `401 { error: "Unauthorized" }` | Clear token, redirect to /login |
