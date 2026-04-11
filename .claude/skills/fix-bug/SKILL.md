---
name: fix-bug
description: Investigate and fix a bug in the signature-kit monorepo. Provides structured debugging with project-aware context about the SignatureKit architecture.
argument-hint: <bug description>
disable-model-invocation: true
---

Investigate and fix a bug in the signature-kit monorepo.

Arguments: `$ARGUMENTS` — description of the bug (e.g. "watermark disappears after undo", "canvas blurry on retina displays", "React onEnd callback not firing")

## Investigation Process

### 1. Understand the Bug

Clarify:
- Which package is affected? (core / react / vue / all)
- Which component/method is involved?
- What is the expected vs actual behavior?
- Is it reproducible in the playground? (`pnpm dev:vue` / `pnpm dev:react`)

### 2. Read Relevant Source

The codebase is small — read the relevant files before theorizing:

| Symptom | Likely Files |
|---------|-------------|
| Drawing issues | `packages/core/src/signature-kit.ts` (constructor, `_resizeCanvas`) |
| Watermark issues | `packages/core/src/signature-kit.ts` (`_applyWatermark`, `addWatermark`, `clearWatermark`), `packages/core/src/watermark.ts` |
| Undo/redo issues | `packages/core/src/signature-kit.ts` (`undo`, `redo`, `_saveUndoState`, stack management) |
| Resize issues | `packages/core/src/signature-kit.ts` (`_handleResize`, `_resizeCanvas`, `_setupResizeObserver`) |
| React callback not firing | `packages/react/src/SignatureCanvas.tsx` (stale closure — check `syncEvents` pattern) |
| Vue prop not reacting | `packages/vue/src/SignatureCanvas.vue` (missing `watch` for the prop) |
| TypeScript errors | Check type consistency across core → react/vue `index.ts` re-exports |
| Build failures | Check `tsconfig.base.json`, `tsup.config.ts`, `vite.config.ts` |

### 3. Check for Existing Tests

Before fixing, check if there are existing tests for the affected area:
```bash
pnpm test -- -t "<keyword>"
```

### 4. Fix the Bug

Follow the project's patterns:
- Core changes: modify `SignatureKit` class methods
- React changes: update `SignatureCanvas.tsx`, ensure event re-registration
- Vue changes: update `SignatureCanvas.vue`, add `watch` if prop is reactive
- Type changes: update `types.ts` and re-export from `index.ts`

### 5. Write a Regression Test

Add a test in `packages/core/src/signature-kit.test.ts` that:
- Reproduces the bug (would fail before the fix)
- Verifies the fix (passes after the fix)
- Covers edge cases related to the bug

Use the existing `createCanvas()` and `createKit()` helpers.

### 6. Verify No Regressions

Run the full pipeline:
```bash
pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint
```

## Common Bug Patterns in This Codebase

### Watermark Lost After Operation
**Cause**: A code path calls `_sigPad.clear()` + `_sigPad.fromData()` but forgets `_applyWatermark()`.
**Fix**: Add `this._applyWatermark()` after stroke restoration.

### React Stale Closure
**Cause**: Event handlers registered on kit instance capture props at mount time. When props change, old handlers still reference old values.
**Fix**: Re-register handlers using `kit.offAll()` + reregister pattern when props change.

### Vue Prop Not Reactive
**Cause**: Missing `watch()` for a prop that needs to call a kit method.
**Fix**: Add a `watch(() => props.xxx, ...)` that calls the appropriate kit method.

### Canvas Blurry on Retina
**Cause**: Canvas internal resolution doesn't match display pixels. `_resizeCanvas()` handles this via `devicePixelRatio` scaling.
**Fix**: Ensure `_resizeCanvas()` is called and context is scaled by ratio.

### Undo Stack Inconsistency
**Cause**: `undo()` directly pops from `toData()` instead of using a separate undo stack. This means undo behavior depends on current canvas state.
**Note**: This is the current design — `canUndo` checks `toData().length > 0`. Don't redesign the stack without discussion.

## Output Format

```markdown
## Bug Fix: <summary>

### Root Cause
<explanation>

### Fix
- `file:line` — <what changed>

### Regression Test
- Test name: `<description>`
- Location: `packages/core/src/signature-kit.test.ts`

### Verification
✅ All 48 tests pass
✅ TypeCheck: clean
✅ Build: success
✅ Lint: clean
```
