---
name: review
description: Perform a focused code review on uncommitted changes, checking for watermark persistence, stale closures, type exports, and memory leaks.
---

Perform a thorough code review of uncommitted changes (`git diff` and untracked files).

Check specifically for:
1. Bugs, logic errors, edge cases
2. Watermark persistence across all redraw paths (undo/redo/resize/updateOptions)
3. React component stale closure issues in useEffect
4. Vue component watchers and defineExpose completeness
5. Type export consistency across core → react → vue
6. Test coverage for new/changed code
7. Memory leaks or missing cleanup in destroy()

Report findings as a structured list: issues found, suggestions, and approval status.
