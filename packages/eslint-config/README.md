# eslint-config — shared ESLint flat config

One lint standard for every package. Consumed as:

```js
import sagecardsConfig from '@sagecards/eslint-config'
export default [...sagecardsConfig]
```

## What it enforces

- `@eslint/js` recommended + `typescript-eslint` recommended (type-checked)
- `@typescript-eslint/no-explicit-any: error`
- Tooling config files (eslint.config.mjs, vitest.config.ts, next.config.ts, postcss) ignored

## Conventions

- A rule change here applies to every app/package — edit once, lint everywhere.
- Lint is enforced by CI + pre-push (`turbo lint`), not by pre-commit.
