---
name: test
description: Run tests for the signature-kit monorepo. Supports filtering by test name pattern, watching mode, or coverage.
argument-hint: [pattern | --watch | --coverage]
disable-model-invocation: true
allowed-tools:
  - Bash
---

Run tests for the signature-kit monorepo using vitest.

Arguments: `$ARGUMENTS`
- A test name pattern (e.g. `watermark`, `undo`) → runs `pnpm test -- -t "pattern"`
- `--watch` → runs `pnpm test:watch`
- `--coverage` → runs `pnpm test -- --coverage`
- Empty → runs `pnpm test` (single run, all tests)

## Test Infrastructure

- **Runner**: vitest 4.x
- **Environment**: `jsdom` (configured in root `vitest.config.ts`)
- **Test files**: `packages/*/src/**/*.test.ts`
- **Globals**: enabled (no need to import `describe`, `it`, `expect`, `vi`)
- **Setup**: `./test-setup.ts` at root

## Current Test Coverage

Tests live in `packages/core/src/signature-kit.test.ts` and cover:

| Area | Test Cases |
|------|-----------|
| Construction | Instance creation, initial state, disabled init |
| Clear | Event emission, empty state |
| Undo/Redo | Stack behavior, events, empty stack guards, multi-cycle |
| fromData/toData | Stroke data import/export |
| toDataURL | PNG and JPEG format |
| toBlob | Blob creation |
| toFile | File creation with name/type |
| toSVG | SVG string output |
| Trim | Empty canvas, content trimming, padding option |
| Watermark | Get/set/clear, empty text handling |
| Disabled | Toggle state |
| updateOptions | Pen color, disabled toggle |
| Event System | Register, remove, multiple handlers |
| offAll | Remove all handlers at once |
| Watermark Persistence | After undo, redo, updateOptions, clearWatermark cycle |

## Writing New Tests

When adding tests, follow these conventions:

1. **Helper functions**: Use the existing `createCanvas(width, height)` and `createKit(width, height, options)` helpers
2. **Cleanup**: Each test gets a fresh kit via `beforeEach` — no manual cleanup needed (but call `kit.destroy()` for kits created outside `beforeEach`)
3. **Canvas sizing**: Default canvas is 300x150. Canvas is appended to `document.body` via `createCanvas()`
4. **Stroke data**: Use `kit.fromData()` with `{ points: [{ x, y, time, pressure }] }` format
5. **Time values**: Use `Date.now()` or `Date.now() + offset` for point timestamps
6. **Assertions**: Use vitest matchers (`toBe`, `toEqual`, `toHaveBeenCalledOnce`, `toHaveLength`, etc.)
7. **Spies**: Use `vi.fn()` for mock handlers

## Output Format

Report results as:
```
Tests: 48 passed | 0 failed | Duration: 2.5s
```

If tests fail, show the failing test names and error messages.
