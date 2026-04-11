---
name: review
description: Perform a focused code review on uncommitted changes in the signature-kit monorepo, with project-specific checks for watermark persistence, React closures, Vue reactivity, type exports, and memory safety.
---

# Skill: Code Review

Perform a comprehensive code review of uncommitted changes in the signature-kit monorepo, with project-specific checks.

Run `git diff` and check `git status` for untracked files. Review every changed file.

## Project-Specific Review Checklist

### 1. Watermark Persistence (Critical)

Watermark must survive every redraw path. After ANY operation that calls `_sigPad.clear()` + `_sigPad.fromData()`, `_applyWatermark()` MUST be called.

**Required paths:**
- `undo()` — after `fromData(data, { clear: false })`
- `redo()` — after `fromData(state, { clear: false })`
- `_handleResize()` — after restoring scaled/unscaled data
- `updateOptions()` backgroundColor branch — after `fromData(data, { clear: false })`
- `clearWatermark()` — intentionally does NOT call it

**File**: `packages/core/src/signature-kit.ts`

### 2. React Stale Closure Prevention

`SignatureCanvas.tsx` creates a single `SignatureKit` instance in mount `useEffect([], [])`. Event handlers capture `props` via closure at registration time.

**Rule**: When props change, old handlers still reference stale values. Solution: call `kit.offAll()` then re-register with current props.

**Check**: Every `useEffect` depending on props should re-register event handlers.

### 3. Vue Reactivity Completeness

`SignatureCanvas.vue` uses `watch()` for reactive prop changes.

**Check**:
- `props.watermark` → `watch` calling `addWatermark()` or `clearWatermark()`
- Drawing options → `watch` calling `kit.updateOptions()`
- `props.disabled` → `watch` setting `kit.disabled`
- All public methods in `defineExpose`

### 4. Type Export Consistency

Types flow: `core` → `react` / `vue`. Both wrapper packages must re-export:
- `WatermarkOptions`, `SignatureKitOptions`, `SignatureKitEventType`, `SignatureKitEventDetail`
- `TrimOptions`, `TrimResult`
- `PointGroup` (from `signature_pad`)

### 5. Memory / Resource Cleanup

`destroy()` must clear:
- `_resizeObserver.disconnect()`
- `_sigPad.off()`
- `_undoStack` and `_redoStack`
- `_watermarkOptions`
- `_listeners`
- `_colorCache`

### 6. Undo/Redo Stack Integrity

- `undo()`: saves current to `_redoStack`, pops from `toData()`
- `redo()`: saves current to `_undoStack`, pops from `_redoStack`
- New stroke (`endStroke`): clears `_redoStack`
- Stack capped at `MAX_UNDO_STACK` (50)
- `canUndo`: `toData().length > 0`
- `canRedo`: `_redoStack.length > 0`

### 7. Canvas DPI Handling

`_resizeCanvas()` sets resolution to `offsetWidth * devicePixelRatio` × `offsetHeight * devicePixelRatio`, then scales context by ratio.

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
1. Optional improvement

### Verdict
✅ Approved / ❌ Changes needed / ⚠️ Approved with suggestions
```
