# Signature Kit

Monorepo for electronic signature components (Vue 3 + React), built on top of `signature_pad`.

## Structure

- `packages/core` — `@tinyforged/signature-kit`: Framework-agnostic core (`SignatureKit` class)
- `packages/react` — `@tinyforged/signature-kit-react`: React wrapper (`SignatureCanvas`)
- `packages/vue` — `@tinyforged/signature-kit-vue`: Vue 3 wrapper (`SignatureCanvas`)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all 3 packages |
| `pnpm build:core` | Build core only |
| `pnpm test` | Run tests (vitest) |
| `pnpm test:watch` | Watch mode tests |
| `pnpm typecheck` | Type check all packages |
| `pnpm lint` | Lint |
| `pnpm lint:fix` | Lint + auto-fix |
| `pnpm dev:vue` / `pnpm dev:react` | Start playground |

## Conventions

- TypeScript strict mode, ESLint + Prettier
- Core uses `tsup` for build; Vue uses `vite build`; React uses `tsup`
- Tests use `vitest` with `happy-dom` environment
- Always run `pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint` before committing
- All 3 packages share the same version number
- Watermark must persist across all redraw paths (undo/redo/resize/updateOptions)

## Key Architecture

- `SignatureKit` wraps `signature_pad` with undo/redo stacks, watermark, resize handling, and event system
- React uses `forwardRef` + `useImperativeHandle` to expose methods via ref
- Vue uses `defineExpose` to expose methods via template ref
- Event handlers in React are re-registered on every options change via `offAll()` + reregister pattern
