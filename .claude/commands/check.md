Run the full verification pipeline for this project:

1. `pnpm test` — all tests must pass
2. `pnpm run typecheck` — TypeScript type check across all packages
3. `pnpm run build` — build core, react, and vue packages
4. `pnpm run lint` — no lint errors

Report each step's result clearly. If any step fails, analyze the error and suggest a fix.
