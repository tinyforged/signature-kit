# Changesets

Changesets are used to manage versioning and changelogs for this monorepo.

## Adding a Changeset

When you make a change that should be included in the next release, run:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages are affected
2. Choose the semver bump type (patch / minor / major)
3. Write a summary of the changes

The changeset file will be committed alongside your code changes.

## How It Works

1. **Development**: Developers add changeset files with their PRs
2. **Version PR**: When changesets are detected on `main`, a "Version Packages" PR is automatically created
3. **Release**: Merging the Version PR triggers the publish workflow, which builds and publishes to npm
