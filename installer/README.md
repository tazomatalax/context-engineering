# Context Engineering Installer

Automated installer for adding Context Engineering workflow to existing projects.

## 🚀 Quick Install

```bash
# Install in any existing project directory
npx @tazomatalax/context-engineering-installer

# Or install globally
npm install -g @tazomatalax/context-engineering-installer
context-install
```

## ✨ What It Does

The installer analyzes your existing project and automatically:

1. **Detects Project Type**: Analyzes package.json, file extensions, frameworks
2. **Selects Best Template**: Chooses optimized Context Engineering setup
3. **Installs Core Files**: CLAUDE.md, validate.sh, GitHub templates
4. **Configures Commands**: `/create-issue`, `/generate-prp`, `/execute-prp`
5. **Sets Up Scripts**: GitHub integration, issue posting, PR creation
6. **Customizes Everything**: Project-specific validation, examples, docs

## 🎯 Supported Project Types

- **Node.js/TypeScript** - Frontend, backend, full-stack apps
- **Python** - Django, FastAPI, Flask, general Python projects
- **React** - Create React App, Next.js, Vite projects
- **Pydantic AI** - AI agent development projects
- **MCP Server** - Model Context Protocol servers
- **General** - Any project type with universal patterns

## 🛠️ Installation Options

### Interactive Mode (Recommended)

```bash
npx @tazomatalax/context-engineering-installer
```

Guides you through project analysis and feature selection.

### Quick Mode

```bash
npx @tazomatalax/context-engineering-installer --yes
```

Uses smart defaults based on project detection.

### Custom Template

```bash
npx @tazomatalax/context-engineering-installer --template python
```

Force specific template instead of auto-detection.

### Dry Run

```bash
npx @tazomatalax/context-engineering-installer --dry-run
```

See what would be installed without making changes.

## 📁 What Gets Installed

### Core Files

- `CLAUDE.md` - Project-specific AI assistant rules
- `validate.sh` - Validation script for your project type
- `.env.example` - Environment variables template
- `temp/` - Directory for issue drafts

### GitHub Integration

- `.github/ISSUE_TEMPLATE/feature-request.yml` - Structured issue template
- `.github/PULL_REQUEST_TEMPLATE.md` - PR template with validation checklist
- `scripts/post-issue.js` - Script to post issues to GitHub

### Claude Commands

- `.claude/commands/create-issue.md` - `/create-issue` command
- `.claude/commands/generate-prp.md` - `/generate-prp` command
- `.claude/commands/execute-prp.md` - `/execute-prp` command
- `.claude/commands/submit-pr.md` - `/submit-pr` command

### Project Structure

- `PRPs/active/` - Generated PRPs for development
- `PRPs/templates/` - PRP templates
- `examples/` - Code examples and patterns (project-specific)

## 🔧 Configuration

After installation, configure your environment:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Add GitHub token
GITHUB_TOKEN=your_token_here
GITHUB_REPO_OWNER=your_username
GITHUB_REPO_NAME=your_repo

# 3. Install dependencies (if package.json was updated)
npm install
```

## 🚀 Your New Workflow

Once installed, use the streamlined Context Engineering workflow:

```bash
# 1. Create issue from minimal prompt
/create-issue "Add dark mode toggle"

# 2. Edit the generated draft
# Edit temp/issue-draft-{timestamp}.md

# 3. Post to GitHub
node scripts/post-issue.js temp/issue-draft-{timestamp}.md

# 4. Generate PRP
/generate-prp --issue=123

# 5. Execute PRP
/execute-prp PRPs/active/123-add-dark-mode.md

# 6. Validate & Submit
./validate.sh
/submit-pr --issue=123
```

## 🎨 Customization

The installer creates project-specific configurations:

### Language-Specific Validation

- **Python**: Ruff, MyPy, Pytest
- **Node.js**: ESLint, TypeScript, Jest/Vitest
- **Auto-detects**: Test commands, linting tools, build processes

### Framework Patterns

- **React**: Component patterns, testing strategies
- **Python**: Module structure, testing conventions
- **API**: Request/response patterns, error handling

### Project Structure

- Respects existing conventions
- Integrates with current tooling
- Preserves your project's patterns

## 🔄 Updates

To update Context Engineering in your project:

```bash
# Re-run installer with backup
npx @tazomatalax/context-engineering-installer --backup
```

Existing customizations are preserved, new features added.

## 🆘 Troubleshooting

### Permission Issues

```bash
chmod +x validate.sh
```

### Missing Dependencies

```bash
npm install @octokit/rest dotenv js-yaml
```

### GitHub Integration

1. Create Personal Access Token with `repo` scope
2. Add to `.env` file
3. Test with `node scripts/post-issue.js --help`

## 📊 Project Analysis

The installer analyzes these indicators:

- **Package files**: package.json, requirements.txt, Cargo.toml
- **Config files**: tsconfig.json, .eslintrc, pytest.ini
- **File extensions**: .py, .ts, .js, .rs
- **Framework signatures**: React, Flask, Django, etc.
- **Build tools**: Webpack, Vite, Rollup

Score-based selection chooses the best template for your project.

## 🤝 Contributing

Found a bug or want to add support for a new project type?

1. Fork the repository
2. Add your project type to `lib/project-analyzer.js`
3. Create template in `templates/`
4. Submit pull request

## 📄 License

MIT - Feel free to use in any project!
