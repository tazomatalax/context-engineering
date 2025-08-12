# Context Engineering Installation Guide

## Quick Install (Recommended)

### Universal Installer - No Node.js Required ✅

**Linux/macOS/WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.sh | bash
```

**Windows:**
```cmd
powershell -Command "iwr -Uri https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.bat -OutFile install.bat && .\install.bat"
```

**Manual Clone Method (Works Everywhere):**
```bash
git clone https://github.com/tazomatalax/context-engineering.git
cd context-engineering

# Linux/macOS/WSL
./install.sh

# Windows
install.bat
```

### Traditional NPX Method (Requires Node.js)

```bash
npx context-engineering-installer
```

## What Gets Installed

- `.claude/commands/` - AI workflow commands
- `.github/` - Issue and PR templates  
- `scripts/` - GitHub automation
- `PRPs/` - Plan templates
- `validate.sh/.bat` - Quality gate script
- `.env.example` - Configuration template

## Post-Installation Setup

1. **Configure GitHub access:**
   ```bash
   cp .env.example .env
   # Edit .env with your GITHUB_TOKEN and GITHUB_REPO
   ```

2. **Customize validation script:**
   - Edit `validate.sh` (Linux/macOS) or `validate.bat` (Windows)
   - Add your project's specific linting and testing commands

3. **For NPX users only - install script dependencies:**
   ```bash
   npm install @octokit/rest@19.0.13 dotenv
   ```

## Why Universal Installer?

| Universal Installer | NPX Installer |
| --- | --- |
| ✅ No Node.js required | ❌ Requires Node.js/npm |
| ✅ Works on any platform | ⚠️ npm compatibility issues |
| ✅ Shell scripts (universal) | ⚠️ Node.js dependencies |
| ✅ Clear error messages | ❌ Complex dependency errors |
| ✅ Fast and lightweight | ⚠️ Heavy node_modules |

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
2. `node scripts/post-issue.cjs temp/task-draft-*.md` 
3. `/start-task --issue=123`
4. `/execute-prp PRPs/active/123-*.md`
5. `/submit-pr --issue=123`

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