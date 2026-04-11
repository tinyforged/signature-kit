---
name: add-feature
description: Add a new feature to the signature-kit monorepo. Guides through the full implementation across core, React, and Vue packages with proper type exports, tests, and documentation.
argument-hint: <feature description>
disable-model-invocation: true
---

Add a new feature to the signature-kit monorepo. This skill guides the implementation across all 3 packages.

Arguments: `$ARGUMENTS` — description of the feature to add (e.g. "add pressure sensitivity toggle", "add signature image export with custom DPI")

## Implementation Checklist

Follow this order to implement a feature that spans the full monorepo:

### 1. Core Package (`packages/core`)

This is the foundation. All features start here.

**Files to consider modifying:**
- `src/types.ts` — Add new option interfaces or type definitions
- `src/signature-kit.ts` — Add the core logic to `SignatureKit` class
- `src/watermark.ts` — Only if the feature relates to watermarks
- `src/signature-kit.test.ts` — Add comprehensive tests

**Key patterns:**
- Constructor options go into `SignatureKitOptions` (extends `signature_pad` Options)
- Options that only affect `SignatureKit` (not `signature_pad`) are handled in `_options` and `updateOptions()`
- Options that `signature_pad` understands are in `SIG_PAD_KEYS` set and forwarded via `Object.assign`
- Public methods are added directly to the class
- Events use the custom event system (`on`/`off`/`offAll`/`_emit`)
- New event types must be added to `SignatureKitEventType` union in `types.ts`

**Type exports:** New types must be exported from `src/index.ts`

### 2. React Package (`packages/react`)

**Files to consider modifying:**
- `src/types.ts` — Add new props to `SignatureCanvasProps` and methods to `SignatureCanvasRef`
- `src/SignatureCanvas.tsx` — Wire up the new feature
- `src/index.ts` — Re-export any new types

**Key patterns:**
- Props are passed to `SignatureKit` via `buildOptions()`
- Props that need reactive updates must be in the `buildOptions` dependencies array
- New event callback props (like `onBegin`, `onEnd`) must be registered in the `syncEvents()` closure and re-registered on options change
- New ref methods go into `useImperativeHandle`
- Use `kitRef.current?.method()` with null-safe chaining in ref methods

### 3. Vue Package (`packages/vue`)

**Files to consider modifying:**
- `src/types.ts` — Add new props to `SignatureCanvasProps` and events to `SignatureCanvasEmits`
- `src/SignatureCanvas.vue` — Wire up the new feature
- `src/index.ts` — Re-export any new types

**Key patterns:**
- Props use `withDefaults(defineProps<Props>(), { ... })` with defaults matching core defaults
- Reactive prop changes need a `watch()` that calls the corresponding `kit` method
- Events are emitted via `emit()` and must be declared in `SignatureCanvasEmits`
- New public methods must be added to `defineExpose`

### 4. Tests

**File:** `packages/core/src/signature-kit.test.ts`

Write tests that cover:
- Basic functionality (happy path)
- Edge cases (empty canvas, null inputs, invalid values)
- Integration with existing features (undo/redo after new feature, watermark + new feature)
- Event emission

**Use existing helpers:**
- `createCanvas(width, height)` — creates a canvas element
- `createKit(width, height, options)` — creates a `SignatureKit` instance
- `beforeEach` — fresh kit per test

### 5. Documentation

**Files to update:**
- `README.md` — Add to the appropriate section (Core API, Vue, React)
- `README_zh-CN.md` — Chinese translation
- Package-specific READMEs if the feature is significant

### 6. Verification

After implementation, run the full pipeline:
```bash
pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint
```

## Important Rules

- **No breaking changes** without major version bump discussion
- **Backward compatible** defaults for all new options
- **TypeScript strict** — all new code must pass `tsc --noEmit`
- **Watermark persistence** — if the feature involves canvas redraws, ensure `_applyWatermark()` is called
- **Don't touch playground apps** unless the feature needs visual demonstration
