# Python Runtime - Context Engineering Scripts

Python implementation of Context Engineering workflow automation using `uv` and the `requests` library.

## Prerequisites

### Option 1: Using uv (Recommended)
```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv pip install requests
```

### Option 2: Using standard pip
```bash
pip install requests
```

## Scripts

### 1. Post Issue (`post_issue.py`)
Posts a task draft to GitHub as an issue.

**Usage:**
```bash
uv run scripts/post_issue.py temp/task-draft-20250108.md
```

**Requirements:**
- `.env` file with `GITHUB_TOKEN` and `GITHUB_REPO`
- Markdown task draft file with `# Title` heading

### 2. Generate from Issue (`generation/generate_from_issue.py`)
Fetches a GitHub issue and creates a PRP document.

**Usage:**
```bash
uv run scripts/generation/generate_from_issue.py 123
```

### 3. Submit PR (`submission/submit_pr.py`)
Creates a pull request from your current work.

**Usage:**
```bash
# Basic PR creation
uv run scripts/submission/submit_pr.py --issue=123

# With developer notes
uv run scripts/submission/submit_pr.py --issue=123 --notes-file=temp/notes.md

# Collapse PRP notes in PR body
uv run scripts/submission/submit_pr.py --issue=123 --collapse-prp-notes

# Skip PRP notes entirely
uv run scripts/submission/submit_pr.py --issue=123 --no-prp-notes

# Dry run (preview without pushing)
uv run scripts/submission/submit_pr.py --issue=123 --dry-run
```

## Environment Configuration

Create a `.env` file in your project root:

```env
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_REPO=owner/repo-name
```

The scripts will automatically search up the directory tree to find your `.env` file.

## Features

- ✅ Zero Node.js dependency
- ✅ Minimal external dependencies (only `requests`)
- ✅ Works with `uv` for isolated environments
- ✅ Compatible with Python 3.9+
- ✅ Full feature parity with Node.js scripts
- ✅ Automatic `.env` file discovery
- ✅ Comprehensive error messages

## Comparison with Node Runtime

| Feature | Node | Python |
|---------|------|--------|
| External Dependencies | `@octokit/rest`, `dotenv` | `requests` |
| Package Manager | npm | uv/pip |
| Execution | `node scripts/...` | `uv run scripts/...` |
| Environment Loading | dotenv | Manual parsing |
| Type Safety | JavaScript | Python 3.9+ type hints |

Both runtimes provide identical functionality - choose based on your project's existing toolchain.
