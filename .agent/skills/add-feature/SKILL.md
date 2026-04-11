---
name: add-feature
description: Add a new feature to the signature-kit monorepo. Guides through the full implementation across core, React, and Vue packages with proper type exports, tests, and documentation.
argument-hint: <feature description>
disable-model-invocation: true
---

# Skill: Add Feature

Add a new feature to the signature-kit monorepo across core, React, and Vue packages.

Arguments: `$ARGUMENTS` — description of the feature to add.

## Implementation Checklist

### 1. Core Package (`packages/core`)

All features start here.

**Files to modify:**
- `src/types.ts` — New option interfaces or type definitions
- `src/signature-kit.ts` — Core logic in `SignatureKit` class
- `src/watermark.ts` — Only if feature relates to watermarks
- `src/signature-kit.test.ts` — Comprehensive tests
- `src/index.ts` — Export new types

**Key patterns:**
- Constructor options → `SignatureKitOptions` (extends `signature_pad` Options)
- Kit-only options → handled in `_options` and `updateOptions()`
- SignaturePad-compatible options → `SIG_PAD_KEYS` set, forwarded via `Object.assign`
- New events → add to `SignatureKitEventType` union in `types.ts`, use `on`/`off`/`_emit`

### 2. React Package (`packages/react`)

**Files to modify:**
- `src/types.ts` — New props in `SignatureCanvasProps`, methods in `SignatureCanvasRef`
- `src/SignatureCanvas.tsx` — Wire up the feature
- `src/index.ts` — Re-export new types

**Key patterns:**
- Props → `buildOptions()` function
- Reactive props → in `buildOptions` dependencies array
- New event callbacks → register in `syncEvents()` closure, re-register on options change
- New ref methods → add to `useImperativeHandle`
- Null-safe: `kitRef.current?.method()`

### 3. Vue Package (`packages/vue`)

**Files to modify:**
- `src/types.ts` — New props in `SignatureCanvasProps`, events in `SignatureCanvasEmits`
- `src/SignatureCanvas.vue` — Wire up the feature
- `src/index.ts` — Re-export new types

**Key patterns:**
- Props → `withDefaults(defineProps<Props>(), { ... })`
- Reactive prop changes → `watch()` calling corresponding `kit` method
- Events → `emit()` declared in `SignatureCanvasEmits`
- Public methods → `defineExpose`

### 4. Tests

File: `packages/core/src/signature-kit.test.ts`

Cover: happy path, edge cases (empty canvas, null inputs), integration with existing features (undo/redo, watermark), event emission.

### 5. Documentation

Update `README.md` and `README_zh-CN.md` in appropriate sections.

### 6. Verification

```bash
pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint
```

## Rules

- No breaking changes without major version discussion
- Backward compatible defaults for all new options
- TypeScript strict — must pass `tsc --noEmit`
- If feature involves canvas redraws, ensure `_applyWatermark()` is called
