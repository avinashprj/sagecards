# auth module

Owns identity and sessions for the API: email+password and Google OAuth,
built on one Better-Auth instance over the shared Mongoose connection
(ADR-000-008, ADR-000-009).

## Owns

- `auth.factory.ts` — the Better-Auth instance (mongo adapter, scrypt, Google provider, account-linking policy)
- `auth.controller.ts` — the typed JSON surface: `POST /auth/signup`, `POST /auth/signin`, `POST /auth/signout`, `GET /auth/me`, `GET /auth/google` (302 to Google's authorize URL)
- `better-auth.handler.controller.ts` — the dumb pipe under `/api/auth/*` that delegates to `auth.handler` (OAuth callback lives here)
- `auth.service.ts` — orchestration + error→HTTP-status mapping
- `auth.mappers.ts` / `auth.types.ts` — contract mapping + declared external shapes

## Does not own

- The Mongoose connection (provided by `AppModule`; injected here)
- Session reads for web pages (Phase 1-D reads via `auth.api.getSession` in Next server components)
- Web UI, cookies on the Next origin, BFF route handlers

## Working rules

- Every request body is validated against `@sagecards/shared-types` Zod schemas — never a local duplicate.
- Response payloads are whitelisted through `auth.mappers.ts`; the password hash never crosses the wire.
- Library errors are mapped to honest HTTP statuses in `AuthService.rethrow` (401 bad credentials, 422 duplicate signup).
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` are read via `ConfigService.getOrThrow` in `auth.module.ts` — missing config fails at boot.
- The Google flow relies on the `better-auth.state` cookie reaching the browser; do not drop `setCookie` in `googleRedirectUrl()`.

## Tests

`auth.spec.ts` — supertest round-trips against mongodb-memory-server (no real Google credentials needed; the callback test stubs the token endpoint with a fake id_token JWT). Run: `bun run test` in `apps/api`.
