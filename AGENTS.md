# Agent Guidelines

- TypeScript strict everywhere. No `any` without justification.
- **Never add a dependency without stating why** in the commit/PR.
- Module boundaries: `apps/web` never imports mongoose; `apps/api` owns all data access.
- API contract types come from `packages/shared-types` (Zod). Do not hand-write duplicated DTOs.
- Tests: unit (Vitest), component (React Testing Library), E2E (Playwright incl. axe-core WCAG scan).
- Follow `docs/plans/PHASE-*.md` checklists. Commit per step, one concern per commit.
- Keep the docs/ADR up to date when a decision changes.
- **Never net to `main` directly, never push to production** — read `docs/review-policy.md`. `main` is protected: every change ships as a PR, gets human review + approval, and merges before it can ever deploy. Production ships only off merged `main`. You end at a green PR awaiting review; you do not self-approve or self-merge.
- **Plan before code, vet before merge** — the human vets the plan before any PR merges, for any PR, any commit. No plan-first commit, no reviewing a change you already made: the plan/design is reviewed and approved _before_ implementation begins.
- **Shared logic lives in `packages/`, never duplicated across apps** — a module imported by two apps belongs in a package, not copied.
- **Prefer Server Components + Suspense** (Next 16) — separate server/client/shared components by intended usage.
- **Code smell hygiene**: early returns and guard clauses over deep nesting; remove dead or commented-out code immediately; comment _why_, not the obvious.
- **Every module ships a README**; keep `docs/architecture.md` and type contracts current as the code evolves.
- **Every decision is traceable to clarity, maintainability, iteration speed, or scalability** — say which one a choice serves.

## Agent skills

### Issue tracker

No external tracker; issues/specs are tracked in `docs/plans/PHASE-*.md` checklists and GitHub PRs. (The `.scratch/` local tracker was removed — solo repo.)

### Domain docs

Single-context layout today: one root `CONTEXT.md` (created lazily by `/domain-modeling`) plus `docs/adr/` for decisions. See `docs/agents/domain.md`.
