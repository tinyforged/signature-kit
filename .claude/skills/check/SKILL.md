---
name: check
description: Run the full verification pipeline for the signature-kit monorepo (test, typecheck, build, lint, format).
disable-model-invocation: true
allowed-tools:
  - Bash
---

Run the full verification pipeline in strict order. Stop and report immediately if any step fails — do not continue to the next step.

## Pipeline

### Step 1: Tests
```bash
pnpm test
```
- Environment: `jsdom` (vitest config at root `vitest.config.ts`)
- Test files: `packages/*/src/**/*.test.ts`
- Currently only `packages/core/src/signature-kit.test.ts` has tests
- Verify: all tests pass, report total count

### Step 2: Type Check
```bash
pnpm run typecheck
```
- Runs in parallel across all workspace packages:
  - `packages/core` → `tsc --noEmit`
  - `packages/react` → `tsc --noEmit`
  - `packages/vue` → `vue-tsc --noEmit`
- Important: React and Vue packages resolve `@tinyforged/signature-kit` types from `node_modules`. If core types changed, run `pnpm build:core` first to update the declarations.
- Common failure: TypeScript 6.0 deprecation warnings — these are suppressed via `ignoreDeprecations: "6.0"` in `tsconfig.base.json`

### Step 3: Build
```bash
pnpm run build
```
- Builds all 3 publishable packages (not playground apps):
  - `packages/core` → `tsup` (ESM + CJS + DTS)
  - `packages/react` → `tsup` (ESM + CJS + DTS)
  - `packages/vue` → `vite build` (ESM + UMD + DTS + CSS)
- Verify output files exist in each `dist/` directory

### Step 4: Lint
```bash
pnpm run lint
```
- Scope: `packages/*/src`
- Config: ESLint flat config with `@eslint/js`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-vue`, `eslint-config-prettier`

## Output Format

```
✅ Tests: 48 passed (0 failed)
✅ TypeCheck: all packages
✅ Build: core + react + vue
✅ Lint: no errors
```

If any step fails:
```
❌ Tests: 2 failed
   - watermark persistence > should keep watermark after undo
   - Expected null, received { text: 'WATERMARK' }
   → Suggestion: check _applyWatermark() call in undo()
```
