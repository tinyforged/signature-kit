# Release Guide

## How to Publish a New Version

1. Open **Actions → Release** workflow: https://github.com/TinyForged/signature-kit/actions/workflows/release.yml
2. Click **Run workflow**
3. Enter the version number (e.g. `1.1.0`), follow [semver](https://semver.org/) conventions:
   - `MAJOR.MINOR.PATCH` (e.g. `2.0.0`)
   - Pre-release: `1.0.0-beta.1`
4. Click **Run workflow**

The workflow will execute the following steps in order:

```
install → build → test → bump versions → npm publish → commit → tag → create release
```

> **Note**: GitHub Release and git tag are only created after a successful npm publish. If any step fails, nothing is committed or tagged.

## What Gets Published

All three packages are always published together with the same version:

| Package | Registry |
|---|---|
| `@tinyforged/signature-kit` | [npm](https://www.npmjs.com/package/@tinyforged/signature-kit) |
| `@tinyforged/signature-kit-react` | [npm](https://www.npmjs.com/package/@tinyforged/signature-kit-react) |
| `@tinyforged/signature-kit-vue` | [npm](https://www.npmjs.com/package/@tinyforged/signature-kit-vue) |

## Version Bumping Rules

The workflow automatically bumps all three `package.json` files to the specified version and updates internal dependency references. After publishing, the version bump is committed to `main` with a `v*` tag.

## Troubleshooting

### Publish failed, no release/tag created

This is by design. Fix the issue (e.g. build error, test failure) and re-run the workflow with the same version.

### Need to re-publish the same version

npm does not allow re-publishing the same version. You'll need to bump to a new version (e.g. `1.0.1` if `1.0.0` failed).
