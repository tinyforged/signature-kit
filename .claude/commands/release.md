Help prepare a new release for signature-kit.

Steps:
1. Check current version in all `packages/*/package.json` files — they should be in sync
2. Check `git status` to ensure the working tree is clean (no uncommitted changes)
3. Check if there are unpushed commits
4. Verify the latest published version on npm for all 3 packages:
   - `@tinyforged/signature-kit`
   - `@tinyforged/signature-kit-react`
   - `@tinyforged/signature-kit-vue`
5. Run the full verification pipeline (`pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint`)
6. Summarize what changed since the last release using `git log`

If all checks pass, remind the user to go to Actions → Release workflow on GitHub to trigger the publish, or ask what version to bump to.

Arguments: $ARGUMENTS — optional version number to prepare (e.g. "1.1.0")
