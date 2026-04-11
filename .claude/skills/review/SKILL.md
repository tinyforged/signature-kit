---
name: review
description: Perform a focused code review on uncommitted changes in the signature-kit monorepo, with project-specific checks for watermark persistence, React closures, Vue reactivity, type exports, and memory safety.
---

Perform a comprehensive code review of all uncommitted changes in this repository.

## What to Review

Run `git diff` and check `git status` for untracked files. Review every changed file.

## Project-Specific Review Checklist

This is a signature drawing library built on `signature_pad`. The architecture has specific failure modes that generic code reviews miss. Check each of these:

### 1. Watermark Persistence (Critical)

The watermark must survive every redraw path. After ANY operation that clears and redraws the canvas (`_sigPad.clear()` + `_sigPad.fromData()`), `_applyWatermark()` must be called.

**Redraw paths that MUST call `_applyWatermark()` after restoring strokes:**
- `undo()` — after `fromData(data, { clear: false })`
- `redo()` — after `fromData(state, { clear: false })`
- `_handleResize()` — after restoring scaled/unscaled data
- `updateOptions()` backgroundColor branch — after `fromData(data, { clear: false })`
- `clearWatermark()` — intentionally does NOT call it (that's the point)

**File**: `packages/core/src/signature-kit.ts`

### 2. React Stale Closure Prevention

The React component (`packages/react/src/SignatureCanvas.tsx`) creates a single `SignatureKit` instance in `useEffect([], [])` that lives for the component's lifetime. Event handlers registered on the kit instance capture `props` values via closure at registration time.

**Rule**: When props change, old event handlers still reference stale prop values. The solution is to call `kit.offAll()` then re-register handlers with current props values.

**Check**: Every `useEffect` that depends on props should re-register event handlers.

### 3. Vue Reactivity Completeness

The Vue component (`packages/vue/src/SignatureCanvas.vue`) uses `watch()` to react to prop changes.

**Check**:
- All reactive props that affect `SignatureKit` behavior have corresponding `watch()` calls
- `props.watermark` → `watch` that calls `addWatermark()` or `clearWatermark()`
- Drawing options (penColor, etc.) → `watch` that calls `kit.updateOptions()`
- `props.disabled` → `watch` that sets `kit.disabled`
- All public methods are included in `defineExpose`

### 4. Type Export Consistency

Types flow: `core` → `react` / `vue`. Consumers of react/vue packages need access to core types.

**Check**: `packages/react/src/index.ts` and `packages/vue/src/index.ts` must re-export:
- `WatermarkOptions`, `SignatureKitOptions`, `SignatureKitEventType`, `SignatureKitEventDetail`
- `TrimOptions`, `TrimResult`
- `PointGroup` (from `signature_pad`)

### 5. Memory / Resource Cleanup

`destroy()` must clean up everything:
- `_resizeObserver.disconnect()`
- `_sigPad.off()`
- `_undoStack` and `_redoStack` cleared
- `_watermarkOptions` set to null
- `_listeners` cleared
- `_colorCache` cleared

### 6. Undo/Redo Stack Integrity

- `undo()`: saves current state to `_redoStack`, pops from `_sigPad.toData()`
- `redo()`: saves current state to `_undoStack`, pops from `_redoStack`
- New stroke (endStroke event): clears `_redoStack` (new strokes invalidate redo history)
- Stack size capped at `MAX_UNDO_STACK` (50) — oldest entries are shifted out
- `canUndo`: `toData().length > 0`
- `canRedo`: `_redoStack.length > 0`

### 7. Canvas DPI Handling

`_resizeCanvas()` sets canvas resolution to `offsetWidth * devicePixelRatio` × `offsetHeight * devicePixelRatio`, then scales the 2D context by the ratio. This ensures crisp rendering on HiDPI displays.

**Check**: Any new canvas manipulation must account for this scaling.

## Output Format

```markdown
## Code Review

### Files Changed
- `path/to/file.ts` (lines X-Y)

### Issues Found
1. **[Severity]** Description
   - Location: `file:line`
   - Problem: ...
   - Fix: ...

### Suggestions
1. Optional improvement description

### Verdict
✅ Approved / ❌ Changes needed / ⚠️ Approved with suggestions
```
