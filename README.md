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

1.  **Run the CLI**: `context-cli` (if installed globally) or `npx context-engineering-installer`.
2.  **Browse Assets**: Use the interactive TUI to explore available skills and agents.
3.  **Install**: Select an asset to install it into your current project.
4.  **Configure MCP**: Add servers like `Context7` or `GitHub` to your `.vscode/mcp.json`.

OpenCode MCP servers

- This repository includes an `opencode.json` listing local and remote MCP servers (mirrored from `.vscode/mcp.json`) so OpenCode can discover the same tools. You can enable/disable servers there and provide any required environment variables (for example `PERPLEXITY_API_KEY`).

VS Code Copilot

- For VS Code Copilot compatibility the project provides recommended settings in `.vscode/settings.json`.

## Images

<img width="541" height="405" alt="image" src="https://github.com/user-attachments/assets/48d6a72c-14c7-426a-a5da-2a85cf390646" />

<img width="558" height="537" alt="image" src="https://github.com/user-attachments/assets/2b17941d-8a7d-4d93-bf1c-e431986cc80f" />

<img width="696" height="717" alt="image" src="https://github.com/user-attachments/assets/127d6cd0-9f89-42df-9ed7-2816f5de0158" />


## ➕ Adding New Assets

Want to add your own Skills, Agents, or MCP Servers? See [EXTENDING.md](EXTENDING.md) for a complete guide.

## 📝 License

[MIT](LICENSE)
