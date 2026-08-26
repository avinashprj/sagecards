# PHASE 0 — Project initialization

Goal: empty, type-safe, tested monorepo that builds.

## Checklist
- [ ] Turborepo + Bun workspaces (`apps/*`, `packages/*`)
- [ ] Strict TS base `tsconfig` (strict, noUncheckedIndexedAccess, verbatimModuleSyntax)
- [ ] ESLint flat + Prettier (+ tailwind class sorter)
- [ ] husky + lint-staged + commitlint
- [ ] Vitest + Playwright harness wired
- [ ] Package scaffolds: `apps/web`, `apps/api`, `packages/shared-types`
- [ ] CI (GitHub Actions): typecheck -> lint -> test -> build
- [ ] .env.example + docs

## Definition of done
`turbo build` passes at the root; CI green; one commit per checklist item.
