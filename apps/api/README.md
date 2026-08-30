# API — SageCards backend

NestJS 11 modular monolith. Owns all data access (apps/web never imports mongoose).

## Run

```sh
bun run dev        # build + watch (tsc then node --watch dist/main.js), port 3000 (PORT env override)
bun run build      # compile to dist/
bun run start      # run compiled output
```

## Test / check

```sh
bun run test       # Vitest (node env, *.spec.ts)
bun run typecheck  # tsc --noEmit
bun run lint       # ESLint flat config (shared)
```

## Conventions

- ESM (`"type": "module"`), imports use `.js` extensions.
- Data access lives here — never in the web app.
- API contract types come from `@sagecards/shared-types` (Zod), not hand-written DTOs.
- MongoDB wiring (Phase 1): `DATABASE_URL` required at boot — missing or unreachable DB fails loudly (bounded retries), no silent fallback.
