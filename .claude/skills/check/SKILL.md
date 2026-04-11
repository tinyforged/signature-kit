---
name: check
description: Run the full verification pipeline (test, typecheck, build, lint) for the signature-kit monorepo.
disable-model-invocation: true
---

Run the full verification pipeline for this project in order:

1. `pnpm test` — all tests must pass (vitest)
2. `pnpm run typecheck` — TypeScript type check across all packages
3. `pnpm run build` — build core, react, and vue packages
4. `pnpm run lint` — no lint errors

Report each step's result clearly. If any step fails, analyze the error and suggest a fix.
