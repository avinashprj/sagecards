# SageCards

Digital business cards, reimagined. One tap — share who you are.

## Stack

- **Web**: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (+ shadcn/ui planned)
- **App**: NestJS 11, Mongoose, MongoDB Atlas
- **Auth**: Better-Auth (Phase 1)
- **Monorepo**: Bun workspaces + Turborepo

## Repo layout

| Path                     | Role                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| `apps/web`               | Next.js 16 frontend ([README](apps/web/README.md))                               |
| `apps/api`               | NestJS 11 backend, owns data ([README](apps/api/README.md))                      |
| `packages/shared-types`  | Zod contract, single source of truth ([README](packages/shared-types/README.md)) |
| `packages/tsconfig`      | Strict TS presets ([README](packages/tsconfig/README.md))                        |
| `packages/eslint-config` | Shared ESLint flat config ([README](packages/eslint-config/README.md))           |
| `docs/`                  | Architecture, ADRs, phase plans                                                  |

## Commands (repo root)

```sh
bun run dev         # turbo dev
bun run build       # turbo build
bun run test        # turbo test (Vitest)
bun run lint        # turbo lint (ESLint flat)
bun run typecheck   # turbo typecheck
```

## Workflow

Every change ships as a PR against protected `main`: plan vetted by a human
before implementation, CI green, human review + approval, then merge. See
`docs/review-policy.md`.

See `docs/architecture.md` and `docs/plans/PHASE-0-project-initialization.md` to start.
