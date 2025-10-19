# Context Engineering Toolkit - Runtime Support

This directory contains runtime-specific implementations of the Context Engineering workflow scripts.

## Structure

```
runtimes/
├── node/           # Node.js/npm runtime (requires @octokit/rest, dotenv)
│   └── scripts/
│       ├── post-issue.cjs
│       ├── generation/
│       │   └── generate-from-issue.cjs
│       └── submission/
│           └── submit-pr.cjs
│
└── python/         # Python/uv runtime (requires requests)
    └── scripts/
        ├── post_issue.py
        ├── generation/
        │   └── generate_from_issue.py
        └── submission/
            └── submit_pr.py
```

## Runtime Selection

The Context Engineering installer can deploy either runtime based on your project environment:

### Node.js Runtime
- **Dependencies**: `npm install @octokit/rest dotenv`
- **Usage**: `node scripts/post-issue.cjs temp/draft.md`
- **Best For**: Projects already using Node.js/npm

### Python Runtime  
- **Dependencies**: `uv pip install requests` (or `pip install requests`)
- **Usage**: `uv run scripts/post_issue.py temp/draft.md`
- **Best For**: Python projects, universal environments, avoiding Node.js

## Installation

The installer script (`install.sh`) will:
1. Detect available runtimes in your environment
2. Prompt you to select Node or Python
3. Deploy the appropriate scripts to your project root
4. Configure the `.claude/commands/*.md` files with the correct runtime invocation

## Migration

To switch runtimes after installation:
1. Run the uninstaller: `rm -rf scripts .claude/commands`
2. Re-run the installer: `./install.sh`
3. Select the new runtime when prompted

## Development

When adding new workflow scripts:
1. Implement in both `node/` and `python/` subdirectories
2. Maintain feature parity between runtimes
3. Update this README with any new scripts
4. Test both implementations before committing
