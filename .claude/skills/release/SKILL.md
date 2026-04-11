---
name: release
description: Prepare a new release for signature-kit. Check versions, npm status, and run verification.
argument-hint: [version]
disable-model-invocation: true
---

Help prepare a new release for signature-kit.

Arguments: $ARGUMENTS — optional target version (e.g. "1.1.0")

Steps:
1. Read current versions from all `packages/*/package.json` — they should be in sync
2. Check `git status` to ensure the working tree is clean
3. Check if there are unpushed commits
4. Verify the latest published version on npm for all 3 packages:
   - `@tinyforged/signature-kit`
   - `@tinyforged/signature-kit-react`
   - `@tinyforged/signature-kit-vue`
5. Run the full verification pipeline: `pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint`
6. Summarize what changed since the last release using `git log`

If a version argument was provided, use `/sync-version` to bump all packages to that version.

If all checks pass, remind the user to go to GitHub Actions → Release workflow to trigger the publish.
