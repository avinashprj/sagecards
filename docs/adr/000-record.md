# ADR-000: Why we record decisions

Every material decision has an ADR. Context, decision, consequences.

## 000-001 package manager: Bun

Bun workspaces + Turborepo. Fast install & task graph. Accepted trade-off: minor edge tooling issues vs pnpm.

## 000-002 web: Next.js App Router

SSR/ISR for SEO on public profiles. React 19 + Tailwind v4 + shadcn/ui.

## 000-003 api: NestJS

Modular monolith, DI, guards, strong testing conventions. Mongoose + MongoDB Atlas.

## 000-004 auth: Better-Auth

Library-managed sessions/OAuth/OTP running server-side. No hand-rolled JWT.

## 000-005 storage: Cloudinary

Image-only workload; transforms + CDN. Wrapped in a single port for later S3 swap.

## 000-006 realtime: polling (v1)

TanStack Query polling at launch; WebSocket/SSE layer may be added later without redesign.

## 000-007 release gate: human review on protected main

Production safety is structural, not trust-based. `main` is protected by a GitHub ruleset: no direct pushes, no self-merge. Every change ships as a PR, passes CI (typecheck → lint → test → build), and requires at least one distinct human approval. Production deploys only off the merged `main` ref — the deployed bits are exactly the reviewed bits. See `docs/review-policy.md` (binding).

## 000-008 auth: Google + email/password, thin BFF + server-component reads

**Context**: Phase 1 ships sign-up/login. A consumer identity product (digital business card) expects Google as the primary login; email+password is the fallback for users without it. Next.js 16 runs serverless; NestJS is a separate backend. Cross-origin auth cookies are painful.

**Decision**:

- Login matrix: **Google OAuth (primary)** + **email + password (fallback)**, both resolving to one `User` keyed by email. Google links to an existing password user on email match. OTP/magic-link/verification/forgot-password deferred (needs an email-provider decision); Google is the password-recovery path meanwhile.
- **Thin BFF + server component reads** over a raw rewrite or a whole-auth BFF: auth _writes_ (login/signup/Google callback) flow through Next route handlers to the Nest backend — backend tokens never reach browser JS. Auth _reads_ (session state) happen in **server components** via `auth.api.getSession({ headers })`, directly in the Next server, no proxy hop. `proxy.ts` does optimistic redirects only and is never the authorization boundary; real auth lives in server components, route handlers, and every server action. Dev targets `localhost:3001`.
- User identity: email + name + image + optional password. Google imports name + photo + verified email onto the user.

**Consequences**: same-origin httpOnly cookies, no CORS; session reads served by the Next server itself (fewer hops/latency); backend independently secured; the authorization boundary sits where Next 16 recommends (server components/route handlers/server actions). Slightly more Next code than a raw proxy, but the correct secure shape for a separate backend with no rework later.

## 000-009 api: Better-Auth integration shape — thin bridge, not the community NestJS package

**Context**: Better-Auth's official NestJS doc recommends `@thallesp/nestjs-better-auth`: disable Nest's body parser globally, import the package's `AuthModule`, and let its global `AuthGuard` + `@Session()` decorator own route protection. Our locked plan instead requires a typed JSON contract (shared Zod schemas at the boundary) and Phase 1-D needs explicit control of `Set-Cookie` relay for the BFF.

**Decision**: Run one `betterAuth` instance as a DI provider on the shared Mongoose connection, and expose it through two doors: (1) a thin typed `AuthController` (`/auth/*`) — Zod-validated bodies, DTO whitelisting, library-error→HTTP-status mapping; (2) a dumb catch-all (`/api/auth/*`) that rebuilds a fetch `Request` (with `rawBody: true` instead of disabling the body parser globally) and delegates byte-for-byte to `auth.handler`, where the OAuth round-trip lives.

**Consequences**: ~30 lines of bridge code instead of a third-party dependency; body parsing stays on for every non-auth endpoint; the cookie/header relay is explicit code we control for Phase 1-D; deviation from the official doc is deliberate and recorded here. Cost: we own the Express↔fetch translation, guarded by the supertest suite.
