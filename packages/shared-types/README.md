# shared-types — API contract (single source of truth)

Zod schemas + inferred types for everything that crosses the wire between web and API.

## Why it exists

Prevents hand-written duplicate DTOs. The API validates against a schema; clients
type against its inferred type. One definition, both sides.

## Add a contract

1. Create/extend a file in `src/` (e.g. `src/health.ts`), export a `z.object` schema + `z.infer` type.
2. Re-export from `src/index.ts`.
3. Add a Vitest spec next to it (`*.spec.ts`): parse-valid + reject-invalid.

## Build

```sh
bun run build       # tsc → dist/ (single ESM build; no CJS twin — nothing is published externally)
bun run test        # Vitest (node env)
bun run typecheck   # tsc --noEmit
```

## Conventions

- Pick a schema name that matches the wire contract (e.g. `SignupInput`, `UserDto`).
- Never hand-write a DTO in apps — import from here.
