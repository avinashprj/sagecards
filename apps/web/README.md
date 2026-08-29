# Web — SageCards frontend

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4.

## Run

```sh
bun run dev        # next dev, port 3000
bun run build      # next build
bun run start      # next start
```

## Test / check

```sh
bun run test       # Vitest (jsdom) + React Testing Library (*.test.tsx)
bun run typecheck  # tsc --noEmit
bun run lint       # ESLint flat config (shared)
```

## Auth shape (Planned in Phase 1 — not yet implemented)

Thin BFF + server-component reads:

- **Writes** (login/signup/Google callback) → route handlers under `app/api/auth/[...]` → Nest
- **Reads** (session state) → server components via `getSession({ headers })`
- `proxy.ts` = optimistic redirects only, never the authorization boundary

## Conventions

- Server/client/shared components separated; prefer Server Components + Suspense.
- Path alias `@/*` → `./src/*`.
- Never imports mongoose; call the API only.
