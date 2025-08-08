# Context Engineering Installer

Simple installer for adding Context Engineering workflow to any existing project.

## 🚀 Quick Install

```bash
# Install in any existing project directory
npx context-engineering-installer

# To uninstall later
npx context-engineering-uninstaller
```

## ✨ What It Does

The installer is a **simple delivery service** that copies toolkit files to your project:

1. **No Analysis**: No project detection or smart configuration - just reliable file deployment
2. **Safe Copying**: Uses `overwrite: false` to never replace your existing files
3. **Complete Toolkit**: All commands, templates, and scripts in one package
4. **Clean Uninstall**: Easy removal when you want to experiment or clean up

## 📁 What Gets Installed

### Core AI Commands
- `.claude/commands/` - All 6 Context Engineering commands:
  - `create-task.md` - Create comprehensive issue drafts
  - `refine-task.md` - Enrich simple manual issues  
  - `start-task.md` - Fetch complete context for execution
  - `execute-prp.md` - Implement features from plans
  - `validate-execution.md` - AI code review (optional)
  - `submit-pr.md` - Submit PRs with developer notes

### GitHub Integration
- `.github/ISSUE_TEMPLATE/feature-request.yml` - Structured issue template
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template with validation checklist

### Automation Scripts
- `scripts/generation/generate-from-issue.js` - Fetch GitHub issues → PRPs
- `scripts/submission/submit-pr.js` - Create PRs with developer notes

### Configuration & Templates
- `PRPs/templates/prp_base.md` - Base PRP template
- `PRPs/active/` - Directory for active development plans
- `temp/` - Directory for issue drafts
- `.env.example` - Environment variables template
- `validate.sh` - Quality gate script (requires customization)
- `AI_RULES.md` - Project-specific AI assistant rules
- `advanced_tools.md` - Optional AI power-ups guide

## 🔧 After Installation

### 1. Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env

# Add your GitHub credentials:
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_REPO=owner/repo-name
```

### 2. Configure Validation Script
The installer creates a generic `validate.sh` template. **You must customize it** for your project:

```bash
# For Node.js projects:
# echo "Running linter..."
# npx eslint .
# echo "Running tests..." 
# npm test

# For Python projects:
# echo "Running linter..."
# ruff check .
# echo "Running tests..."
# pytest
```

**💡 Pro tip:** Ask your AI assistant to help configure this script for your specific project type.

## 🚀 Your New Workflow

Once configured, use the streamlined Context Engineering workflow:

```bash
# 1. Create comprehensive issue from brief idea
/create-task "Add dark mode toggle to settings"

# 2. Edit the generated draft, then post to GitHub  
node scripts/post-issue.js temp/task-draft-{timestamp}.md

# 3. Start implementation (fetches full context)
/start-task --issue=123

# 4. Execute the plan (AI implements with validation)
/execute-prp PRPs/active/123-add-dark-mode-toggle.md

# 5. Submit with AI-generated developer notes
/submit-pr --issue=123
```

## 🧹 Clean Uninstall

When you want to remove the toolkit:

```bash
npx context-engineering-uninstaller
```

The uninstaller will:
- Show exactly what files will be removed
- Ask for confirmation before deleting anything
- Remove all toolkit files and empty directories
- Leave your project files completely untouched

Perfect for experimentation or trying Context Engineering on multiple projects.

## 🎯 Design Philosophy

This installer follows the **"Delivery Service" approach**:

- ✅ **Reliable**: Simple file copying with no complex logic to break
- ✅ **Safe**: Never overwrites existing files
- ✅ **Predictable**: Same files installed every time
- ✅ **Reversible**: Clean uninstall removes everything
- ✅ **Transparent**: You can see exactly what's being installed

**No more:**
- ❌ Project analysis that might guess wrong  
- ❌ Smart configuration that breaks on edge cases
- ❌ Complex logic that fails in unexpected ways
- ❌ Permanent installation that's hard to remove

## 🔄 Updates

To update to a newer version:

```bash
# Uninstall current version
npx context-engineering-uninstaller

# Install latest version  
npx context-engineering-installer@latest
```

Your customizations in `validate.sh` and `.env` will be preserved since the installer never overwrites existing files.

## 🆘 Troubleshooting

### Installation Issues
- **Permission denied**: Ensure you have write permissions in the directory
- **Files already exist**: Installer skips existing files (this is normal)
- **Wrong directory**: Make sure you're in your project root

### After Installation
- **Commands not found**: Restart Claude Code to pick up new `.claude/commands/`
- **GitHub errors**: Check your `GITHUB_TOKEN` and `GITHUB_REPO` in `.env`
- **Validation fails**: Customize `validate.sh` with your project's commands

### Uninstall Issues
- **Files not removed**: Some files may have been customized (this is intentional)
- **Directories remain**: Empty parent directories are automatically cleaned up

## 📄 License

MIT - Feel free to use in any project!