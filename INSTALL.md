# Context Engineering Installation Guide

## Quick Install (Recommended)

### Modern Package Manager Installation

**Python Runtime (Recommended - No Node.js required):**
```bash
# Using uvx (fastest, no installation needed)
uvx context-engineering-installer

# Or with uv tool
uv tool run context-engineering-installer
```

**Node.js Runtime:**
```bash
# Using npx (comes with Node.js)
npx context-engineering-installer
```

Both methods:
- Work from any directory (must be in a git repo)
- Prompt for runtime selection
- Install in seconds
- Always get the latest version

**Environment variable override:**
```bash
# Force a specific runtime without prompting
RUNTIME=python uvx context-engineering-installer
RUNTIME=node npx context-engineering-installer
```

### Legacy Bash Installer (Deprecated)

**⚠️ Deprecated - Will be removed in future versions**

**Linux/macOS/WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.sh | bash
```

**Windows:**
```cmd
powershell -Command "iwr -Uri https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.bat -OutFile install.bat && .\install.bat"
```

**Manual Clone Method:**
```bash
git clone https://github.com/tazomatalax/context-engineering.git
cd context-engineering

# Linux/macOS/WSL
./install.sh

# Windows
install.bat
```

## What Gets Installed

- `.claude/commands/` - AI workflow commands
- `.github/` - Issue and PR templates  
- `scripts/` - GitHub automation (Python or Node.js based on runtime choice)
- `PRPs/` - Plan templates
- `validate.sh/.bat` - Quality gate script
- `.env.example` - Configuration template

## Runtime Selection

The installer supports two runtime options. You'll be prompted during installation:

### Python Runtime (Recommended)
- **Pros**: Minimal dependencies, faster execution, no Node.js required
- **Cons**: Requires `uv` package manager
- **Use if**: You don't have Node.js, or prefer Python tooling

### Node.js Runtime
- **Pros**: Familiar to JavaScript developers, existing Node.js installations work
- **Cons**: Requires Node.js/npm, heavier dependencies
- **Use if**: You already use Node.js in your project

**Override automatic detection:**
```bash
RUNTIME=python uvx context-engineering-installer  # Force Python
RUNTIME=node npx context-engineering-installer     # Force Node.js
```

## Post-Installation Setup

1. **Configure GitHub access:**
   ```bash
   cp .env.example .env
   # Edit .env with your GITHUB_TOKEN and GITHUB_REPO
   ```

2. **Install runtime dependencies:**
   
   **Python runtime:**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   uv pip install requests
   ```
   
   **Node.js runtime:**
   ```bash
   npm install @octokit/rest dotenv
   ```

3. **Customize validation script:**
   - Edit `validate.sh` (Linux/macOS) or `validate.bat` (Windows)
   - Add your project's specific linting and testing commands

## Why Modern Package Managers?

| Modern (NPX/UVX) | Legacy (Bash) |
| --- | --- |
| ✅ One command | ❌ Multi-step process |
| ✅ Cross-platform | ⚠️ Platform-specific issues |
| ✅ Secure (package managers) | ⚠️ Curl piping concerns |
| ✅ Version control | ⚠️ Git tag dependent |
| ✅ No cloning needed | ❌ Must clone repo |
| ✅ Auto-updates | ⚠️ Manual updates |

## Troubleshooting

**Permission denied:**
```bash
chmod +x install.sh  # Linux/macOS
```

**Script not found (Windows):**
```cmd
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**No curl/wget:**
- Use the manual clone method instead
- Or install: `apt install curl` (Ubuntu) / `brew install curl` (macOS)

## Getting Started

After installation, use these commands in Claude Code:

1. `/create-task "Add dark mode toggle"`
2. Post the task (runtime auto-detected by Claude commands):
   - Python: `uv run scripts/post_issue.py temp/task-draft-*.md`
   - Node.js: `node scripts/post-issue.cjs temp/task-draft-*.md`
3. `/start-task --issue=123`
4. `/execute-prp PRPs/active/123-*.md`
5. `/submit-pr --issue=123`

**Note**: The Claude commands automatically detect which runtime you're using.

## Uninstallation

**NPX method:**
```bash
npx context-engineering-installer --uninstall
```

**Universal method:**
```bash
# Remove Context Engineering files
rm -rf .claude PRPs scripts/generation scripts/submission temp
rm -f validate.sh validate.bat AI_RULES.md advanced_tools.md
rm -f .github/ISSUE_TEMPLATE/feature-request.yml .github/PULL_REQUEST_TEMPLATE.md
```