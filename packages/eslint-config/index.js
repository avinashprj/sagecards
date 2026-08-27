import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'build',
      '.next',
      'coverage',
      'node_modules',
      'eslint.config.mjs',
      'vitest.config.ts',
      'vitest.setup.ts',
      'next.config.ts',
      'next.config.mjs',
      'postcss.config.mjs',
      'postcss.config.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: process.cwd() } },
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
)
