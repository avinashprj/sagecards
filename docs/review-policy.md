# Review & Release Policy

The deploy pipeline is the enforcement mechanism. `main` is **protected**: nothing reaches it by direct-push. Every change ships as a PR, gets a **human review and approval**, then merges. Production deploys only off the merged `main`. An agent can never push to `main` or to production by itself.

## The gate (in order)

0. **Plan first, vet before merge.** The human vets the **plan/design** before any implementation begins — any PR, any commit. No code is written against an unvetted plan; a plan-first commit (design and implementation in one change) never gets merged.

1. **Branch, never `main`.** All work happens on a feature branch. `main` is read-only to both human and agent.
2. **PR with CI green.** Push the branch, open a PR. `typecheck → lint → test → build` status checks must pass.
3. **Human review + approval.** At least one human approves the PR. A merging agent is not its own reviewer. Stale approvals are dismissed when a new commit lands.
4. **Merge to `main`.** Merge (squash) the PR into `main`. The review already happened — nothing rebuilds "post-merge" that skips review.
5. **Deploy off merged `main`.** Production deploys from the merged `main` ref or a Git tag cut from it — never from a feature branch.

## Why production is safe

The deployment step reads from the already-reviewed branch. There is no "then I'll push it to prod myself" exit: the bits that reach prod are exactly the bits a human approved. If a change is on `main`, it was reviewed; if it isn't on `main`, it cannot be deployed.

## Conventions

- **Approve, don't self-review.** The author (human or agent) opens the PR; a distinct reviewer approves.
- **One concern per commit** — a small, reviewable change every time.
- **Protected `main`** is enforced by a GitHub ruleset (see `docs/adr/000-record.md`), not by good intentions.

This policy is binding on every human and every agent operating in this repo.
