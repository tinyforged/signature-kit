---
name: sync-version
description: Synchronize version numbers across all 3 packages (core, react, vue).
argument-hint: <version>
disable-model-invocation: true
---

Synchronize version numbers across all 3 packages.

Arguments: $ARGUMENTS — target version (e.g. "1.2.0")

1. Read current versions from all `packages/*/package.json`
2. Update all 3 `package.json` files to the specified version
3. Verify internal dependency references are consistent
4. Show a summary of what was changed

Do NOT commit or push — just make the changes and let the user review.
