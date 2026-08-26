# SageCard Architecture

## System overview
- Next.js web app (dashboard + public profiles via SSR/ISR)
- NestJS API (modular monolith, Mongoose/MongoDB Atlas)
- Better-Auth for sessions/OAuth/OTP
- Cloudinary for media
- Razorpay for payments (Phase 5)

## Monorepo
```
sagecards/
  apps/web        Next.js
  apps/api        NestJS
  packages/shared-types   Zod contracts
  packages/eslint, tailwind, tsconfig
  docs/adr, docs/plans
turbo.json
```

## Data flow
Browser -> Next.js (Server Components fetch) -> NestJS REST -> MongoDB

## See also
- docs/adr/  : every decision recorded
- docs/plans/: phase-by-phase delivery
