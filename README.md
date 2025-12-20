# AI Project Template

A minimal, lightweight template for setting up AI-ready projects with pre-configured MCP servers and GitHub Skills.

## 🚀 Features

- **MCP Configuration**: Pre-configured `.vscode/mcp.json` for Model Context Protocol servers (Context7, Chrome DevTools, GitHub, Perplexity).
- **GitHub Skills**: A collection of skills in `.github/skills` to enhance AI capabilities.
- **AI Rules**: `AI_RULES.md` to guide AI assistants in maintaining code quality and consistency.
- **Claude Ready**: `CLAUDE.md` configuration for optimal interaction with Claude.

## 📂 Structure

```
.github/
  skills/       # AI Skills and prompts
.vscode/
  mcp.json      # MCP Server configuration
  settings.json # VS Code settings
AI_RULES.md     # Rules for AI assistants
CLAUDE.md       # Claude-specific configuration
README.md       # This file
```

## 🛠️ Usage

1.  **Clone this repository** to start a new project.
2.  **Update `.vscode/mcp.json`**:
    *   Add your `GITHUB_PERSONAL_ACCESS_TOKEN` to the `github` server configuration.
    *   Add or remove servers as needed.
3.  **Explore `.github/skills`**:
    *   Review the available skills and customize them for your project.
4.  **Start coding!**

## 🤖 MCP Servers

This template includes configuration for:

*   **Context7**: Up-to-date library documentation.
*   **Chrome DevTools**: Browser automation and inspection.
*   **GitHub**: Interact with GitHub repositories, issues, and PRs.
*   **Perplexity**: Web search and research.

## 📝 License

[MIT](LICENSE)
