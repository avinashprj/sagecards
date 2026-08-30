# PHASE 1 — Foundation & Auth

Goal: sign-up/login works end to end across the API and web app, backed by MongoDB Atlas.

## Definition of done

A user can sign up with Google or email+password, log in, and hold an authenticated
httpOnly session; the web app reflects that session through server-side session
reads (server components) with a thin BFF for auth writes.
Covered by Vitest/supertest + Playwright, CI-green, ADR + CONTEXT.md updated.

## Decisions (LOCKED — record in ADR-000-008 on merge)

- **Auth library**: Better-Auth (ADR-000-004), runs server-side on the NestJS API.
- **Login matrix**: **Google OAuth (primary)** + **email + password (fallback)**.
  - Both resolve to one `User` keyed by email. Google links to an existing password
    user when the email matches.
  - OTP / magic-link / email verification: **deferred** (needs an email-provider
    decision). Google login is the password-recovery path for now.
- **User identity**: `User` = email + name + image + (optional password). Google
  login imports name + photo + verified email automatically onto `User.image`.
- **Session storage**: MongoDB via Better-Auth adapter; same Atlas connection as app.
- **Cookie scope**: single httpOnly session cookie on the Next.js origin.
- **Web→API path (Phase 1)**: **thin BFF + server-component reads** (Next 16).
  - **Auth writes** (login, signup, Google callback): Next **route handlers**
    (`app/api/auth/[...]/route.ts`) call Nest with an auth header, relay Set-Cookie;
    backend tokens never reach browser JS.
  - **Auth reads** (session state, who am I): **server components** call
    `auth.api.getSession({ headers })` directly in the Next server — no proxy hop.
  - **`proxy.ts`** (Next 16 middleware): optimistic redirects only (cookie present?);
    never the authorization boundary. Real auth lives in server components +
    route handlers + every server action.
  - Dev: handlers + components target `localhost:3001`. Prod: deployed Nest URL.
    **No raw `next.config` rewrite.**
- **Wire contract**: auth DTOs in `@sagecards/shared-types` (Zod single source).

## Locked schemas (shared-types)

```ts
SignupInput  = { email: Email,        name: String(1..50),   password: Password(8..72) }
LoginInput   = { email: Email,        password: String }
UserDto      = { id, name, email, emailVerified: boolean, image: string|null, createdAt, updatedAt }
SessionDto   = { sessionId: string, expiresAt: string(ISO), user: UserDto }
// Google = client redirect to /api/auth/sign-in/google; no input schema.
```

## Checklist

### A. API — MongoDB

- [x] `MongooseModule.forRootAsync` wired in `AppModule` using `DATABASE_URL` from `ConfigModule`
- [x] `.env.example` documents `DATABASE_URL` + Better-Auth vars (no real secrets)
- [x] API boots and connects to Atlas; fails loudly if DB is down (not silent)

### B. API — auth module

- [ ] `AuthModule` + `AuthController` + `AuthService` per Better-Auth NestJS docs
- [ ] Google OAuth: clientId/secret from env, callback `/api/auth/callback/google`
- [ ] Email+password signup endpoint
- [ ] Email+password signin endpoint → issues session
- [ ] Signout endpoint
- [ ] Session / me endpoint (`GET /auth/me` guarded or session-validated)
- [ ] Better-Auth Mongo adapter wired to the Mongoose connection
- [ ] Password hashed; never logged or returned

### C. shared-types — auth contract

- [ ] Zod schemas: `SignupInput`, `LoginInput`, `UserDto`, `SessionDto`
- [ ] API validates request bodies against the schemas (no hand-written DTOs)

### D. Web — auth UI + thin BFF + server components

- [ ] Route handlers under `app/api/auth/[...]` for **writes** (login/signup/Google callback → Nest)
- [ ] Server components read session via `getSession({ headers })`; gated pages render from it
- [ ] `proxy.ts`: optimistic redirect only (cookie present?), never the auth boundary
- [ ] Better-Auth client configured in `apps/web` (against the BFF origin)
- [ ] `/signup` page (email+password form)
- [ ] `/login` page (email+password + "Continue with Google")
- [ ] session hook/context for client-side auth state where needed
- [ ] Navigation responds to auth state (signed-in vs signed-out)
- [ ] Accessible forms (labels, focus, axe-core clean)

### E. Tests & guardrails

- [ ] API: Vitest + supertest — signup → login → me round-trip (mongodb-memory-server)
- [ ] Google path: controller/service test (mocked OAuth callback)
- [ ] Web: RTL on auth forms (valid + invalid submit)
- [ ] E2E: Playwright smoke — email+password signup → authed state (axe scan)
- [ ] CI runs the new suites; all green

### F. Doc & ADR

- [ ] ADR-000-008: login matrix, thin BFF + server-component reads, user identity, image import, forgot-password deferral
- [ ] `CONTEXT.md` glossary: user, session, account, BFF, server components
- [ ] `docs/architecture.md` data-flow updated (writes → BFF route handler → Nest → Mongo; reads → server components)
- [ ] `docs/plans/PHASE-1-foundation-auth.md` checkboxes all ticked after merge

## Out of scope (deferred)

- OTP, magic-link, email verification, forgot-password (needs email-provider decision; Google is recovery path)
- Cloudinary upload (Phase 2 profiles; Google photo URL stays on `User.image` until then)
- Phone login, anonymous sessions, refresh-token rotation tuning

## Definition of done

`turbo build` + `turbo test` green locally and on the PR; an auth round-trip
(Google or email+password) playable from the web UI; ADR + CONTEXT.md updated;
one commit per checklist item in PR order.
