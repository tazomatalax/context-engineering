# Context Engineering Toolkit Changelog

All notable changes to the Context Engineering Toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Toolkit-centric GitHub releases tied to Context Engineering improvements
- Enhanced changelog generation focusing on user-facing toolkit changes
- Manual release workflow with toolkit-focused descriptions
- Agent definition files in `.claude/agents/` for task lifecycle (create/refine/start/submit/validate)

### Changed
- Release strategy now focuses on toolkit improvements rather than installer changes
- Releases triggered by changes to commands, scripts, and templates
- Release notes emphasize Context Engineering capabilities and workflow enhancements

---

## 🎯 Release Philosophy

Releases represent **Context Engineering Toolkit improvements** that enhance your AI-assisted development workflow.

### Version Types

- **Major** (X.0.0): Breaking workflow changes, command interface changes
- **Minor** (X.Y.0): New commands, workflow enhancements, significant template updates  
- **Patch** (X.Y.Z): Bug fixes, small improvements, documentation updates

### What Triggers Releases

✅ **Toolkit Improvements (Should Release):**
- New or updated commands in `.claude/commands/`
- Workflow enhancements in `scripts/`
- Template improvements in `PRPs/templates/`
- Major documentation/guide updates
- New capabilities like `advanced_tools.md` features

❌ **Infrastructure Changes (Don't Need Releases):**
- npm packaging updates
- Installation logic changes
- Minor installer documentation
- CI/CD improvements

## 🚀 How to Release

### Simple Manual Process
1. Go to **GitHub Releases** → **"Create a new release"**
2. Choose a tag version (e.g., `v1.5.0`)
3. Add release title: "Context Engineering Toolkit v1.5.0"
4. Write release notes focusing on toolkit improvements:
   - New commands or workflow enhancements
   - Template improvements
   - User-facing changes
5. Click **"Publish release"**

**That's it!** The npm package will automatically publish with the same version.

## 📝 Commit Message Guidelines

For better automatic changelog generation:

**Toolkit-focused prefixes:**
- `feat(commands):` - New or enhanced commands
- `feat(workflow):` - Workflow improvements  
- `feat(templates):` - Template enhancements
- `fix(commands):` - Command bug fixes
- `docs(toolkit):` - Toolkit documentation updates

**Infrastructure prefixes (don't drive releases):**
- `chore(installer):` - Installation logic updates
- `ci:` - CI/CD improvements
- `build:` - Build system changes

## 📦 Distribution

Each toolkit release includes:
- **GitHub Release**: Full changelog and installation instructions
- **NPM Package**: Updated `context-engineering-installer` for easy distribution
- **Universal Installer**: Direct download via curl/wget

Users get toolkit improvements through:
```bash
# Latest version via universal installer
curl -fsSL https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.sh | bash

# Or specific version via NPX
npx context-engineering-installer@1.5.0
```