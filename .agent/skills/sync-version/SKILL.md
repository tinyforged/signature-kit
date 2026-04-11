---
name: sync-version
description: Synchronize version numbers across all 3 packages in the signature-kit monorepo. Updates package.json files and internal dependency references.
argument-hint: <version>
disable-model-invocation: true
allowed-tools:
  - Bash
  - Read
  - Edit
---

# Skill: Sync Version

Synchronize version numbers across all 3 packages in the signature-kit monorepo.

Arguments: `$ARGUMENTS` — target version, must follow semver (e.g. `1.1.0`, `2.0.0-beta.1`). Required.

## What Gets Updated

For each file, update the `"version"` field:
1. `packages/core/package.json` → `@tinyforged/signature-kit`
2. `packages/react/package.json` → `@tinyforged/signature-kit-react`
3. `packages/vue/package.json` → `@tinyforged/signature-kit-vue`

Additionally, update the internal dependency reference:
- `packages/react/package.json` → `dependencies["@tinyforged/signature-kit"]` → `"^<version>"`
- `packages/vue/package.json` → `dependencies["@tinyforged/signature-kit"]` → `"^<version>"`

Note: Core has no internal dependency (depends on `signature_pad` only).

## Process

1. Validate the version string follows semver
2. Read all 3 `package.json` files, display current versions
3. Update `"version"` in all 3 files
4. Update `dependencies["@tinyforged/signature-kit"]` in react and vue
5. Run `pnpm install --no-frozen-lockfile` to update `pnpm-lock.yaml`
6. Display a diff summary

## Important

- Do NOT commit or push. Let the user review.
- Root `package.json` version is workspace-only (private). Optionally update to match.
- After sync, remind user to run full verification before committing.
