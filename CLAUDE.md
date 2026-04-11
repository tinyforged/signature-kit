# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cross-tool AI instructions and skills live in `.agent/`. See `.agent/instructions.md` for the universal version (used by Gemini, etc.). This file is the Claude-specific entry point.

## Commands

```bash
pnpm build              # Build all 3 publishable packages
pnpm build:core         # Build core only (needed before typecheck if core types changed)
pnpm test               # Run tests (vitest, jsdom)
pnpm test -- -t "name"  # Run a single test by name
pnpm test:watch         # Watch mode
pnpm typecheck          # TypeScript check all packages in parallel
pnpm lint               # ESLint (packages/*/src)
pnpm lint:fix           # ESLint + auto-fix
pnpm format             # Prettier
pnpm dev:vue            # Start Vue playground
pnpm dev:react          # Start React playground
```

Pre-commit verification: `pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint`

## Architecture

Monorepo with pnpm workspaces. Three packages always share the same version number:

- **`packages/core`** — `@tinyforged/signature-kit`: Framework-agnostic `SignatureKit` class wrapping `signature_pad`. Adds undo/redo (50-state stack), watermark rendering, ResizeObserver-based responsive resize, DPI-aware canvas, and a custom event system (`on`/`off`/`offAll`/`_emit`).
- **`packages/react`** — `@tinyforged/signature-kit-react`: `forwardRef` + `useImperativeHandle`. Single `SignatureKit` instance created in mount `useEffect([], [])`. Event handlers re-registered via `offAll()` + reregister on every options change to prevent stale closures.
- **`packages/vue`** — `@tinyforged/signature-kit-vue`: `defineProps` + `defineEmits` + `defineExpose`. `watch()` for reactive prop changes. All public methods exposed via template ref.

Build: tsup (core, react), vite (vue). Tests: vitest 4.x + jsdom in `packages/core/src/signature-kit.test.ts`.

## Critical Invariants

1. **Watermark persistence**: Any code path calling `_sigPad.clear()` + `_sigPad.fromData()` MUST also call `_applyWatermark()` — applies to `undo()`, `redo()`, `_handleResize()`, `updateOptions()` backgroundColor branch
2. **React closure freshness**: Event handlers must be re-registered when props change (`offAll()` + reregister pattern)
3. **Vue reactivity**: Every reactive prop needs a corresponding `watch()`
4. **Type export consistency**: React and Vue `index.ts` must re-export all core types: `WatermarkOptions`, `SignatureKitOptions`, `SignatureKitEventType`, `SignatureKitEventDetail`, `TrimOptions`, `TrimResult`, `PointGroup`
5. **Memory cleanup**: `destroy()` must disconnect observer, call `sigPad.off()`, and clear undo/redo stacks, listeners, colorCache, and watermark options

## Code Style

TypeScript 6.0 strict mode. Semicolons, single quotes, 2-space indent, trailing commas, 80 char width. `noUnusedLocals`/`noUnusedParameters` enabled. Use `interface` over `type` for object shapes.

## Custom Skills

Available via `.agent/skills/` (referenced from `.claude/skills`): `/check`, `/release`, `/test`, `/sync-version`, `/review`, `/add-feature`, `/fix-bug`.
