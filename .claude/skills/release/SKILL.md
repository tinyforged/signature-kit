---
name: release
description: Prepare and verify a new release for the signature-kit monorepo. Handles version checks, npm status, changelog generation, and release workflow guidance.
argument-hint: [version]
disable-model-invocation: true
allowed-tools:
  - Bash
  - WebSearch
---

Prepare a new release for signature-kit. This skill performs all pre-release verification and guides the user through the GitHub Actions publish workflow.

Arguments: `$ARGUMENTS` — optional target version (e.g. `1.1.0`, `2.0.0-beta.1`). If not provided, suggest the next version based on conventional commits since last release.

## Step-by-step Process

### 1. Current State Audit

Check current versions in all 3 `package.json` files:
- `packages/core/package.json` → `@tinyforged/signature-kit`
- `packages/react/package.json` → `@tinyforged/signature-kit-react`
- `packages/vue/package.json` → `@tinyforged/signature-kit-vue`

All 3 must be in sync. If they differ, report the mismatch.

### 2. Working Tree Check

```bash
git status
```
Working tree must be clean. If there are uncommitted changes:
- List them
- Ask the user to commit or stash before proceeding

Check for unpushed commits:
```bash
git log origin/main..HEAD --oneline
```

### 3. Published Version Check

Query npm registry for the latest published version of all 3 packages:
```bash
npm view @tinyforged/signature-kit version
npm view @tinyforged/signature-kit-react version
npm view @tinyforged/signature-kit-vue version
```

All 3 should be the same. If they differ, flag the inconsistency.

### 4. Version Suggestion (if no argument provided)

Analyze commits since the last git tag to suggest the appropriate version bump:
```bash
git log v<CURRENT_VERSION>..HEAD --oneline
```

Rules:
- `feat:` commits → minor bump
- `fix:` commits → patch bump
- `BREAKING CHANGE:` or major feature overhaul → major bump
- `chore:`, `docs:`, `style:` only → patch bump (or skip)

### 5. Full Verification

Run the complete verification pipeline:
```bash
pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint
```

If any step fails, stop and report. Do not proceed with release if verification fails.

### 6. Changelog Generation

Generate a changelog based on commits since the last release tag. Group by category:
- **Features** (`feat:`)
- **Bug Fixes** (`fix:`)
- **Breaking Changes** (`BREAKING CHANGE:`)
- **Other** (`chore:`, `docs:`, etc.)

### 7. Publish Instructions

If all checks pass, provide clear instructions:

> All checks passed. To publish v<VERSION>:
>
> 1. Go to https://github.com/TinyForged/signature-kit/actions/workflows/release.yml
> 2. Click **Run workflow**
> 3. Enter version: `<VERSION>`
> 4. Click **Run workflow**
>
> The workflow will: install → build → test → bump versions → npm publish → commit → tag → create release

Important notes:
- The workflow uses `NPM_TOKEN` secret (org-level) for npm publish
- npm does not allow re-publishing the same version — if it fails, bump to the next version
- Git tag and GitHub Release are only created after successful npm publish
- The bump script (`.github/scripts/bump-versions.mjs`) updates all 3 `package.json` files and runs `pnpm install`
