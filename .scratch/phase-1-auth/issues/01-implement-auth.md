# Phase 1 implementation

Scope: build the expanded `docs/plans/PHASE-1-foundation-auth.md` checklist, in order.

Type: task
Status: open

## Spec

See `docs/plans/PHASE-1-foundation-auth.md`. Key deliverables:

- A. MongoDB Atlas connection in the NestJS API
- B. Auth module (Better-Auth): signup / login / signout / me
- C. Auth Zod contract in `@sagecards/shared-types`
- D. Web auth UI (signup, login, session context)
- E. Vitest + supertest + Playwright coverage
- F. ADR for the auth integration

## Doing

- Implement against the checklist A → F, one checklist item per commit, PR-gated.
- Cannot start writes until every A–F item is ticked and merged.
