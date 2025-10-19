# Node.js Runtime - Context Engineering Scripts

Node.js implementation of Context Engineering workflow automation using `@octokit/rest`.

## Prerequisites

```bash
npm install @octokit/rest dotenv
```

## Scripts

### 1. Post Issue (`post-issue.cjs`)
Posts a task draft to GitHub as an issue.

**Usage:**
```bash
node scripts/post-issue.cjs temp/task-draft-20250108.md
```

**Requirements:**
- `.env` file with `GITHUB_TOKEN` and `GITHUB_REPO`
- Markdown task draft file with `# Title` heading

### 2. Generate from Issue (`generation/generate-from-issue.cjs`)
Fetches a GitHub issue and creates a PRP document.

**Usage:**
```bash
node scripts/generation/generate-from-issue.cjs 123
```

### 3. Submit PR (`submission/submit-pr.cjs`)
Creates a pull request from your current work.

**Usage:**
```bash
# Basic PR creation
node scripts/submission/submit-pr.cjs --issue=123

# With developer notes
node scripts/submission/submit-pr.cjs --issue=123 --notes-file=temp/notes.md

# Collapse PRP notes in PR body
node scripts/submission/submit-pr.cjs --issue=123 --collapse-prp-notes

# Skip PRP notes entirely
node scripts/submission/submit-pr.cjs --issue=123 --no-prp-notes

# Dry run (preview without pushing)
node scripts/submission/submit-pr.cjs --issue=123 --dry-run
```

## Environment Configuration

Create a `.env` file in your project root:

```env
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_REPO=owner/repo-name
```

The scripts will automatically search up the directory tree to find your `.env` file.

## Features

- ✅ Works in any project type (uses `.cjs` extension)
- ✅ Automatic `.env` file discovery
- ✅ Rich GitHub API integration via Octokit
- ✅ Comprehensive error handling
- ✅ Works with Node 14+

## Comparison with Python Runtime

| Feature | Node | Python |
|---------|------|--------|
| External Dependencies | `@octokit/rest`, `dotenv` | `requests` |
| Package Manager | npm | uv/pip |
| Execution | `node scripts/...` | `uv run scripts/...` |
| Environment Loading | dotenv | Manual parsing |
| Type Safety | JavaScript | Python 3.9+ type hints |

Both runtimes provide identical functionality - choose based on your project's existing toolchain.
