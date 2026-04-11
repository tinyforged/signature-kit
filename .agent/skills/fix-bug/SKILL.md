---
name: fix-bug
description: Investigate and fix a bug in the signature-kit monorepo. Provides structured debugging with project-aware context about the SignatureKit architecture.
argument-hint: <bug description>
disable-model-invocation: true
---

# Skill: Fix Bug

Investigate and fix a bug in the signature-kit monorepo.

Arguments: `$ARGUMENTS` — what's wrong (e.g. "watermark disappears after undo").

## Investigation Process

### 1. Understand the Bug

- Which package? (core / react / vue / all)
- Which component/method?
- Expected vs actual behavior?
- Reproducible in playground? (`pnpm dev:vue` / `pnpm dev:react`)

### 2. Read Relevant Source

| Symptom | Likely Files |
|---------|-------------|
| Drawing issues | `packages/core/src/signature-kit.ts` (constructor, `_resizeCanvas`) |
| Watermark issues | `packages/core/src/signature-kit.ts` (`_applyWatermark`, `addWatermark`, `clearWatermark`), `packages/core/src/watermark.ts` |
| Undo/redo issues | `packages/core/src/signature-kit.ts` (`undo`, `redo`, `_saveUndoState`) |
| Resize issues | `packages/core/src/signature-kit.ts` (`_handleResize`, `_resizeCanvas`, `_setupResizeObserver`) |
| React callback not firing | `packages/react/src/SignatureCanvas.tsx` (stale closure) |
| Vue prop not reacting | `packages/vue/src/SignatureCanvas.vue` (missing `watch`) |
| TypeScript errors | Check type consistency in core → react/vue `index.ts` |
| Build failures | `tsconfig.base.json`, `tsup.config.ts`, `vite.config.ts` |

### 3. Check Existing Tests

```bash
pnpm test -- -t "<keyword>"
```

### 4. Fix the Bug

- Core: modify `SignatureKit` class
- React: update `SignatureCanvas.tsx`, ensure event re-registration
- Vue: update `SignatureCanvas.vue`, add `watch` if needed
- Types: update `types.ts` and re-export from `index.ts`

### 5. Write Regression Test

Add test in `packages/core/src/signature-kit.test.ts` that reproduces the bug and verifies the fix.

### 6. Verify No Regressions

```bash
pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint
```

## Common Bug Patterns

### Watermark Lost After Operation
**Cause**: Code path calls `_sigPad.clear()` + `_sigPad.fromData()` but forgets `_applyWatermark()`.
**Fix**: Add `this._applyWatermark()` after stroke restoration.

### React Stale Closure
**Cause**: Event handlers capture props at mount time. Props change but handlers don't update.
**Fix**: Re-register handlers via `kit.offAll()` + reregister when props change.

### Vue Prop Not Reactive
**Cause**: Missing `watch()` for a prop.
**Fix**: Add `watch(() => props.xxx, ...)`.

### Canvas Blurry on Retina
**Cause**: Canvas resolution doesn't match display pixels.
**Fix**: Ensure `_resizeCanvas()` is called and context is scaled by `devicePixelRatio`.

### Undo Stack Inconsistency
**Note**: Current design has `undo()` pop directly from `toData()`. `canUndo` = `toData().length > 0`. Don't redesign without discussion.

## Output Format

```markdown
## Bug Fix: <summary>

### Root Cause
<explanation>

### Fix
- `file:line` — <what changed>

### Regression Test
- Test: `<description>`
- Location: `packages/core/src/signature-kit.test.ts`

### Verification
✅ All tests pass | ✅ TypeCheck | ✅ Build | ✅ Lint
```
