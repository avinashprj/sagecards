# PHASE 1 — Foundation & Auth

Goal: sign-up/login works end to end across the API and web app, backed by MongoDB Atlas.

## Definition of done

A user can sign up, log in, and get an authenticated session persisted server-side; the web app reflects that session; everything is covered unit/e2e-tested and CI-green.

## Decisions (record in ADR on merge)

- Auth library: **Better-Auth** (ADR-000-004), runs server-side on the NestJS API.
- Session storage: MongoDB via Better-Auth adapter; uses the same Atlas connection as the app.
- Wire contract: auth DTOs (signup, login, session, OTP OTP) in `@sagecards/shared-types`.
- Cookie scope: web (Next.js App Router, `localhost:3000` dev) proxies auth calls to API; cookies scoped to a shared auth domain in prod.

## Checklist

### A. API — MongoDB

- [ ] `MongooseModule.forRootAsync` wired in `AppModule` using `DATABASE_URL` from `ConfigModule`
- [ ] `.env.example` documents `DATABASE_URL` (no real secrets); local `.env` ignored
- [ ] API boots and connects to Atlas; a reachability check fails loudly if DB is down (not silent)

### B. API — auth module

- [ ] `AuthModule` + `AuthController` + `AuthService`, generated per Better-Auth docs for NestJS
- [ ] Sign-up (email + password) endpoint
- [ ] Sign-in endpoint → issues session
- [ ] Sign-out endpoint
- [ ] Session / me endpoint (`GET /auth/me` guarded)
- [ ] Better-Auth Mongo adapter wired to the Mongoose connection
- [ ] Auth sez seeded: password hashed, never logged

### C. shared-types — auth contract

- [ ] Zod schemas: `SignupInput`, `LoginInput`, `SessionDto`, `UserDto` (in `packages/shared-types`)
- [ ] API validates request bodies against the schemas (no hand-written DTOs)

### D. Web — auth UI

- [ ] Better-Auth client configured in `apps/web`
- [ ] `/signup` page (email + password form)
- [ ] `/login` page
- [ ] session context/hook: hydrates user on load, redirects when unauthenticated
- [ ] Navigation responds to auth state (signed-in vs signed-out)
- [ ] Minimal but accessible forms (labels, focus, axe-core clean)

### E. Tests & guardrails

- [ ] API: Vitest + supertest — signup → login → me round-trip against a test DB (or mocked Mongo)
- [ ] Web: RTL on the auth forms (valid + invalid submit)
- [ ] E2E: Playwright smoke — sign up a fresh user, land in an authed state (WCAG? axe-core scan on auth pages)
- [ ] CI runs the new suites; all green

### F. Doc & ADR

- [ ] ADR: Better-Auth integration shape, DB-backed sessions, cookie/domain decision
- [ ] Update `docs/architecture.md` data-flow if it changed
- [ ] `docs/plans/PHASE-1-foundation-auth.md` checkboxes all ticked after merge

## Out of scope (deferred)

- OAuth (Google/etc.) providers — OTP to a later phase
- Password reset, email verification flow (verify with product)
- Cloudinary attachment (Phase 2 profiles)

## Definition of done

`turbo build` + `turbo test` green locally and on the PR; an auth round-trip is playable from the web UI; ADR updated; one commit per checklist item in PR order.
