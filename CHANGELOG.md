# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions workflows for automated NPM publishing and releases
- Automatic changelog generation from commit messages
- Manual release workflow with version bump options

### Changed
- Updated release workflow to use modern GitHub CLI instead of deprecated actions

### Deprecated

### Removed

### Fixed

### Security

---

## Release Types

- **Major** (X.0.0): Breaking changes that require user action
- **Minor** (X.Y.0): New features that are backward compatible  
- **Patch** (X.Y.Z): Bug fixes and small improvements

## How to Release

### Automatic Release (Recommended)
1. Go to the "Actions" tab in GitHub
2. Select "Manual Release" workflow
3. Click "Run workflow"
4. Choose version bump type (patch/minor/major)
5. Optionally mark as prerelease
6. Click "Run workflow"

### Manual Release
```bash
# In the installer directory
npm run release:patch   # For bug fixes
npm run release:minor   # For new features
npm run release:major   # For breaking changes
```

## Commit Message Guidelines

To generate better changelogs, follow these commit message prefixes:

- `feat:` - New features
- `fix:` - Bug fixes  
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test additions/updates
- `style:` - Code style changes