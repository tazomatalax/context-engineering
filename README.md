# Context Engineering Toolkit

An interactive CLI and framework for setting up AI-ready projects with pre-configured MCP servers, Skills, and Agents.

## 🚀 Installation

### Global Install (Recommended)
```bash
npm install -g context-engineering-installer
```

### Run via NPX
```bash
npx context-engineering-installer
```

## 🛠️ Features

- **Interactive CLI**: Browse and install AI assets (Skills, Agents, Commands) directly into your project.
- **MCP Management**: Easily add and configure Model Context Protocol servers.
- **Pre-configured Assets**: A collection of "gold-standard" prompts and agents for common development tasks.
- **Project Context**: Tools to help AI assistants understand your project's unique patterns and rules.

## 📂 Structure

```
.github/
  skills/       # Reusable AI skill prompts
  agents/       # Autonomous AI agent definitions
  commands/     # Slash commands for quick actions
.vscode/
  mcp.json      # MCP Server configuration
cli/            # The interactive TUI application
AGENTS.md       # Core rules for AI assistants
EXTENDING.md    # Guide for adding new assets
README.md       # This file
```

## 🤖 Usage

1.  **Run the CLI**: `context-cli` (if installed globally) or `npx @context-engineering/cli`.
2.  **Browse Assets**: Use the interactive TUI to explore available skills and agents.
3.  **Install**: Select an asset to install it into your current project.
4.  **Configure MCP**: Add servers like `Context7` or `GitHub` to your `.vscode/mcp.json`.

## ➕ Adding New Assets

Want to add your own Skills, Agents, or MCP Servers? See [EXTENDING.md](EXTENDING.md) for a complete guide.

## 📝 License

[MIT](LICENSE)
