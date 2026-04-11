# Signature Kit — Project Instructions

Monorepo for electronic signature components (Vue 3 + React), built on `signature_pad`.

## Structure

```
signature-kit/
├── packages/
│   ├── core/          # @tinyforged/signature-kit (SignatureKit class)
│   ├── react/         # @tinyforged/signature-kit-react (SignatureCanvas component)
│   └── vue/           # @tinyforged/signature-kit-vue (SignatureCanvas component)
├── apps/
│   ├── playground-react/   # React dev playground
│   └── playground-vue/     # Vue dev playground
├── .agent/            # Universal AI instructions and skills
├── .claude/           # Claude Code specific config
└── .github/           # CI/CD workflows
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all 3 packages (core + react + vue) |
| `pnpm build:core` | Build core only |
| `pnpm test` | Run tests (vitest, jsdom env) |
| `pnpm test:watch` | Watch mode |
| `pnpm typecheck` | TypeScript check all packages |
| `pnpm lint` | ESLint (`packages/*/src`) |
| `pnpm lint:fix` | ESLint + auto-fix |
| `pnpm format` | Prettier formatting |
| `pnpm dev:vue` / `pnpm dev:react` | Start playground |

## Tech Stack

- **Language**: TypeScript 6.0 (strict mode, `ignoreDeprecations: "6.0"`)
- **Build**: tsup (core, react), vite (vue)
- **Test**: vitest 4.x + jsdom
- **Lint**: ESLint 10 + typescript-eslint + Prettier 3
- **Runtime**: Node.js >= 18, pnpm >= 8
- **Core Dependency**: `signature_pad` ^4.0.0 || ^5.0.0

## Architecture

### Core (`packages/core`)

`SignatureKit` class wraps `signature_pad` with:

- **Undo/Redo**: 50-state stack, directly manipulates `_sigPad.toData()`
- **Watermark**: Text rendering with multi-line, rotation, opacity, alignment support. `_applyWatermark()` draws on canvas context.
- **Resize**: `ResizeObserver` watches parent element, rescales canvas DPI, optionally scales strokes
- **Events**: Custom event system (`on`/`off`/`offAll`/`_emit`) wrapping signature_pad native events
- **DPI**: Canvas resolution = CSS size × `devicePixelRatio`, context scaled by ratio

### React (`packages/react`)

`forwardRef` + `useImperativeHandle` pattern. Single `SignatureKit` instance created in mount `useEffect`. Event handlers re-registered on every options change via `offAll()` + reregister to prevent stale closures.

### Vue (`packages/vue`)

`defineProps` + `defineEmits` + `defineExpose`. `watch()` for reactive prop changes (watermark, disabled, drawing options). All public methods exposed via template ref.

## Critical Invariants

1. **Watermark persistence**: Every code path that calls `_sigPad.clear()` + `_sigPad.fromData()` MUST also call `_applyWatermark()` afterward
2. **React closure freshness**: Event handlers must be re-registered when props change (use `offAll()` pattern)
3. **Vue reactivity**: Every reactive prop needs a corresponding `watch()`
4. **Type export consistency**: React and Vue must re-export all core types (WatermarkOptions, SignatureKitOptions, SignatureKitEventType, SignatureKitEventDetail, TrimOptions, TrimResult, PointGroup)
5. **Version sync**: All 3 packages share the same version number
6. **Memory cleanup**: `destroy()` must clear observer, listeners, stacks, cache, and watermark

## Code Style

- Semicolons, single quotes, 2-space indent, trailing commas, 80 char print width
- `noUnusedLocals` and `noUnusedParameters` enabled
- Use `interface` over `type` for object shapes

## Pre-commit Checklist

```bash
pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint
```
