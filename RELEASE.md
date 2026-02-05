# Release Process

This repository uses GitHub Releases to trigger automated npm publishing.

## Steps to Release

1. **Merge the PR** containing the changes you want to release
2. **Create a GitHub Release**:
   - Go to https://github.com/tazomatalax/context-engineering/releases/new
   - Create a new tag matching the version in `cli/package.json` (e.g., `v2.1.1`)
   - Set the release title (e.g., "v2.1.1: Fix agent installation for nested directories")
   - Add release notes describing the changes
   - Publish the release

3. **Automated Publishing**:
   - The `.github/workflows/publish.yml` workflow will automatically trigger
   - It will build the CLI package and publish it to npm
   - You can monitor the workflow progress in the Actions tab

## Version Bumping

- Before merging a PR, ensure the version in both `package.json` and `cli/package.json` is bumped appropriately:
  - **Patch** (2.1.0 → 2.1.1): Bug fixes
  - **Minor** (2.1.0 → 2.2.0): New features (backward compatible)
  - **Major** (2.1.0 → 3.0.0): Breaking changes

## Current Version

The current version is defined in:
- `cli/package.json` - The published package version
- `package.json` - Should match the CLI version

Both are currently set to: **v2.1.1**
