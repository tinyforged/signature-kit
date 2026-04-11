---
name: release
description: Prepare and verify a new release for the signature-kit monorepo. Handles version checks, npm status, changelog generation, and release workflow guidance.
argument-hint: [version]
disable-model-invocation: true
allowed-tools:
  - Bash
  - WebSearch
---

# Skill: Release

Prepare and verify a new release for the signature-kit monorepo. Handles version checks, npm status, changelog generation, and release workflow guidance.

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
Working tree must be clean. If there are uncommitted changes, list them and ask to commit or stash.

Check for unpushed commits:
```bash
git log origin/main..HEAD --oneline
```

### 3. Published Version Check

```bash
npm view @tinyforged/signature-kit version
npm view @tinyforged/signature-kit-react version
npm view @tinyforged/signature-kit-vue version
```

All 3 should be the same. If they differ, flag the inconsistency.

### 4. Version Suggestion (if no argument provided)

Analyze commits since the last git tag:
```bash
git log v<CURRENT_VERSION>..HEAD --oneline
```

Rules:
- `feat:` commits → minor bump
- `fix:` commits → patch bump
- `BREAKING CHANGE:` or major overhaul → major bump
- `chore:`, `docs:`, `style:` only → patch bump

### 5. Full Verification

```bash
pnpm test && pnpm run typecheck && pnpm run build && pnpm run lint
```

If any step fails, stop and report. Do not proceed.

### 6. Changelog Generation

Generate a changelog from commits since the last release tag. Group by:
- **Features** (`feat:`)
- **Bug Fixes** (`fix:`)
- **Breaking Changes** (`BREAKING CHANGE:`)
- **Other** (`chore:`, `docs:`, etc.)

### 7. Publish Instructions

> All checks passed. To publish v<VERSION>:
>
> 1. Go to https://github.com/TinyForged/signature-kit/actions/workflows/release.yml
> 2. Click **Run workflow**
> 3. Enter version: `<VERSION>`
> 4. Click **Run workflow**

Notes:
- npm does not allow re-publishing the same version — if it fails, bump to next version
- Git tag and GitHub Release only created after successful npm publish
- Bump script (`.github/scripts/bump-versions.mjs`) updates all 3 `package.json` + lockfile
