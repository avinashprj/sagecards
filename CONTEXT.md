# SageCards — Glossary & Context

One-liner: digital business cards, reimagined. One tap — share who you are.

## Terms

- **User** — a person with an account on SageCards. Identity = email + display name + image + (optional) password. A Google-login-only user has no password. Keyed and linked by email.
- **Session** — an authenticated, server-side, httpOnly-cookie browser session managed by Better-Auth. The web app reads it in server components.
- **Account** — the provider link table (Better-Auth): holds the Google OAuth link for a user. One user may have multiple accounts (providers).
- **BFF (thin)** — Next.js route handlers that carry auth _writes_ (login/signup/Google callback) to the Nest backend; backend tokens never reach browser JS.
- **Server components** — Next 16 server-side reads: session state resolved via `getSession({ headers })` with no proxy hop.
- **`proxy.ts`** — Next 16 middleware; optimistic redirects only, never the authorization boundary.
- **Auth writes / auth reads** — writes: mutations that must reach Nest (signup, login, callback). Reads: session/user state resolved in the Next server.

## Architecture (Phase 1)

Browser → (writes) BFF route handler → NestJS (Better-Auth) → MongoDB
Browser → (reads) server component `getSession` → (if needed) Nest server-to-server
