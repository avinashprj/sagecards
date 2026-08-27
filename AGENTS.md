# Agent Guidelines

- TypeScript strict everywhere. No `any` without justification.
- **Never add a dependency without stating why** in the commit/PR.
- Module boundaries: `apps/web` never imports mongoose; `apps/api` owns all data access.
- API contract types come from `packages/shared-types` (Zod). Do not hand-write duplicated DTOs.
- Tests: unit (Vitest), component (React Testing Library), E2E (Playwright incl. axe-core WCAG scan).
- Follow `docs/plans/PHASE-*.md` checklists. Commit per step, one concern per commit.
- Keep the docs/ADR up to date when a decision changes.
- **Never net to `main` directly, never push to production** — read `docs/review-policy.md`. `main` is protected: every change ships as a PR, gets human review + approval, and merges before it can ever deploy. Production ships only off merged `main`. You end at a green PR awaiting review; you do not self-approve or self-merge.
