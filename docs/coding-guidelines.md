# Coding Guidelines

How we write code in this repo. Binding for agents and humans. Anything here
defers to `AGENTS.md` and `docs/review-policy.md` on conflict.

## Principles

Every design choice must trace to one of: **clarity, maintainability, iteration
speed, scalability**. If you can't name which one a choice serves, don't make it.

## Module anatomy

A NestJS feature module is a directory with small, single-purpose files. A file
gets a new home when it has a second consumer or a second reason to change —
not before.

| File              | Owns                                                        | Never contains                                 |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `*.module.ts`     | Wiring: providers, imports, DI factory                      | Business logic                                 |
| `*.controller.ts` | HTTP surface: routes, status codes, cookie relay            | Translation of library types, hashing, storage |
| `*.service.ts`    | Orchestration: call the engine, handle errors, return DTOs  | HTTP concerns (res, cookies, status codes)     |
| `*.mappers.ts`    | Pure shape translation (library payload → contract DTO)     | I/O, try/catch, HTTP                           |
| `*.types.ts`      | Descriptions of _external_ shapes we don't control          | Inferred DTOs, runtime code                    |
| `*.pipe.ts`       | Boundary validation (one reusable pipe per schema strategy) | Route logic                                    |

Rules:

- **Controllers are thin.** Parse → delegate → shape the response. If a method
  needs a comment block to explain what it does, part of it belongs in a service.
- **Mappers are pure functions.** No I/O, no throws (except programmer-error
  guards), fully unit-testable without mocks.
- **File splitting.** Pure helpers, constants and external-shape types live in
  sibling files (`*.mappers.ts`, `*.types.ts`, `*.constants.ts`), not inline in
  controllers/services. Extract duplicated logic on its second occurrence.
- **Types describing external/library payloads live in `*.types.ts`**, with a
  comment stating where the shape comes from and why it isn't inferred. One
  cast site per external type — the type is named once, imported everywhere.
- **One module owns one provider.** Cross-module access goes through exports +
  DI tokens, never deep imports into another module's internals.

## Types & contracts

- **The Zod schema is the type.** API request bodies validate against
  `@sagecards/shared-types` schemas; responses are mapped onto its DTO types.
  Hand-written duplicate DTOs are a bug, not a style choice.
- **Dates are ISO strings on the wire.** Convert at the mapper, once.
- **No `any`. No type assertions** (`as`, `!`, `as unknown as T`) — narrow with
  guards (`value is T` predicates), `satisfies`, or a runtime check that throws.
  If a third-party type is unresolvable, declare the runtime shape in
  `*.types.ts` and _verify_ it at the boundary; the guard fails loudly when the
  library changes.
- **`unknown` at boundaries, concrete after validation.** A Zod pipe's
  `transform` takes `unknown` and returns the parsed type — that's the pattern.

## Boundaries & trust

- Validate every request body at the boundary (pipe), never deep in a service.
- Map library/third-party errors to honest HTTP statuses at the service edge.
  Clients never see a naked 500 for a case the domain understands (bad
  credentials ⇒ 401, duplicate ⇒ 422).
- Response mapping is a whitelist. Never spread a library object into a
  response — name the fields that may leave.

## Config & secrets

- All config via `ConfigService.getOrThrow` — missing config fails at boot,
  never mid-request. Controllers and services read config through injection,
  not `process.env`.
- `.env.example` documents every variable with an empty placeholder. Real
  values never enter the repo.

## Testing

- **Every behavior change ships with a test** that would fail without it.
  Bug fixes ship a regression test named by _behavior_, not ticket ID
  ("rejects a wrong password on signin", not "fixes AUTH-123").
- Every seam gets one test that fails loudly when the seam breaks:
  integration (supertest + real dependencies) for HTTP+DB flows, unit tests for
  contracts (Zod schemas) and pure mappers.
- Tests assert behavior, not implementation: status codes, contract-shape
  parses, observable state changes.
- External services (Google, email) are stubbed at the network edge in tests.

## Naming

- Booleans prefixed `is` / `has` / `should`; functions verb-first
  (`toUserDto`, `createAuth`, `applyCookies`).
- `SCREAMING_SNAKE_CASE` for true constants; `TitleCase` for types/interfaces.
- Test `describe`/`it` read as sentences about behavior.

## Documentation

- Long-form rationale (architecture, product caveats, contracts) lives in
  `.md` — ADRs, `docs/`, and a `README.md` per module — not in block comments.
- Committed docs describe durable conventions; transient references (PR
  numbers, branch names, "this PR") never enter them.

## Style

- Comments explain _why_, never _what_. No phase/task labels in code.
- Early returns and guard clauses over nesting. Dead code is deleted, not
  commented out.
- One concern per commit; conventional commits (husky enforces).
- Prefer deleting code over abstracting it. A second occurrence may still be
  cheaper than an abstraction — abstract at the third, or when the variation
  is real.
