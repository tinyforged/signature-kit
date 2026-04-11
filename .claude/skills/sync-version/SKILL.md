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

Synchronize version numbers across all 3 packages.

Arguments: `$ARGUMENTS` — target version, must follow semver (e.g. `1.1.0`, `2.0.0-beta.1`). Required.

## What Gets Updated

For each of these files, update the `"version"` field:
1. `packages/core/package.json` → `@tinyforged/signature-kit`
2. `packages/react/package.json` → `@tinyforged/signature-kit-react`
3. `packages/vue/package.json` → `@tinyforged/signature-kit-vue`

Additionally, update the internal dependency reference in:
- `packages/react/package.json` → `dependencies["@tinyforged/signature-kit"]` → `"^<version>"`
- `packages/vue/package.json` → `dependencies["@tinyforged/signature-kit"]` → `"^<version>"`

Note: `packages/core/package.json` has no internal dependency (it depends on `signature_pad` only).

## Process

1. Validate the version string follows semver (`MAJOR.MINOR.PATCH` or with prerelease suffix)
2. Read all 3 `package.json` files and display current versions
3. Update `"version"` in all 3 files
4. Update `dependencies["@tinyforged/signature-kit"]` in react and vue packages
5. Run `pnpm install --no-frozen-lockfile` to update `pnpm-lock.yaml`
6. Display a diff summary of all changes

## Important

- Do NOT commit or push. Let the user review the changes.
- The root `package.json` version is for the monorepo workspace only (private, not published). You may optionally update it to match, but it's not required.
- After version sync, remind the user to run `/check` before committing.
