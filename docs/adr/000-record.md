# ADR-000: Why we record decisions

Every material decision has an ADR. Context, decision, consequences.

## 000-001 package manager: Bun

Bun workspaces + Turborepo. Fast install & task graph. Accepted trade-off: minor edge tooling issues vs pnpm.

## 000-002 web: Next.js App Router

SSR/ISR for SEO on public profiles. React 19 + Tailwind v4 + shadcn/ui.

## 000-003 api: NestJS

Modular monolith, DI, guards, strong testing conventions. Mongoose + MongoDB Atlas.

## 000-004 auth: Better-Auth

Library-managed sessions/OAuth/OTP running server-side. No hand-rolled JWT.

## 000-005 storage: Cloudinary

Image-only workload; transforms + CDN. Wrapped in a single port for later S3 swap.

## 000-006 realtime: polling (v1)

TanStack Query polling at launch; WebSocket/SSE layer may be added later without redesign.

## 000-007 release gate: human review on protected main

Production safety is structural, not trust-based. `main` is protected by a GitHub ruleset: no direct pushes, no self-merge. Every change ships as a PR, passes CI (typecheck → lint → test → build), and requires at least one distinct human approval. Production deploys only off the merged `main` ref — the deployed bits are exactly the reviewed bits. See `docs/review-policy.md` (binding).
