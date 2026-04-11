---
name: test
description: Run tests with optional filter pattern for the signature-kit monorepo.
argument-hint: [test-name-pattern]
disable-model-invocation: true
---

Run tests for this project.

Arguments: $ARGUMENTS — optional test name pattern (e.g. "watermark")

If a filter pattern is provided, run: `pnpm test -- -t "pattern"`
Otherwise run: `pnpm test`

Report pass/fail counts and any failures with details.
