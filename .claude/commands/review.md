Code review for this project.

Perform a thorough review of uncommitted changes (`git diff` and untracked files):

1. Check for bugs, logic errors, edge cases
2. Verify watermark persistence across all redraw paths (undo/redo/resize/updateOptions)
3. Check React component for stale closure issues in useEffect
4. Check Vue component for proper watchers and defineExpose completeness
5. Verify type exports are consistent across core → react → vue
6. Check test coverage for new/changed code
7. Look for potential memory leaks or missing cleanup in destroy()

Report findings as a structured list: issues found, suggestions, and approval status.
