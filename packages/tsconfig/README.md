# tsconfig — shared TypeScript configs

Strict TS presets consumed by all packages via `extends`.

## Variants

- `base.json` — strict everywhere: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`, `isolatedModules`, `noEmit`.
- `nest.json` — backend: `NodeNext` module/resolution (ESM), decorators
  (`emitDecoratorMetadata` + `experimentalDecorators`), `ES2022`.
- `nextjs.json` — frontend: `react-jsx`, DOM libs, `@/*` path alias, `next` plugin.

## Use

```json
{ "extends": "@sagecards/tsconfig/nest.json" }
```

## Conventions

- One flavor per runtime. If a package's needs diverge from a flavor, extend it
  and override, don't copy — keep the strict base as the shared denominator.
