---
name: test
description: Run tests for the signature-kit monorepo. Supports filtering by test name pattern, watching mode, or coverage.
argument-hint: [pattern | --watch | --coverage]
disable-model-invocation: true
allowed-tools:
  - Bash
---

# Skill: Test

Run tests for the signature-kit monorepo. Supports filtering by test name pattern, watching mode, or coverage.

Arguments: `$ARGUMENTS`
- A test name pattern (e.g. `watermark`, `undo`) → `pnpm test -- -t "pattern"`
- `--watch` → `pnpm test:watch`
- `--coverage` → `pnpm test -- --coverage`
- Empty → `pnpm test` (single run, all tests)

## Test Infrastructure

- **Runner**: vitest 4.x
- **Environment**: `jsdom` (root `vitest.config.ts`)
- **Test files**: `packages/*/src/**/*.test.ts`
- **Globals**: enabled (no need to import `describe`, `it`, `expect`, `vi`)
- **Setup**: `./test-setup.ts` at root

## Current Test Coverage

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

Conventions:
1. Use `createCanvas(width, height)` and `createKit(width, height, options)` helpers
2. Fresh kit per test via `beforeEach` — call `destroy()` for kits created outside it
3. Default canvas: 300×150, appended to `document.body`
4. Stroke data: `kit.fromData()` with `{ points: [{ x, y, time, pressure }] }`
5. Time values: `Date.now()` or `Date.now() + offset`
6. Assertions: vitest matchers (`toBe`, `toEqual`, `toHaveBeenCalledOnce`, `toHaveLength`)
7. Spies: `vi.fn()` for mock handlers
