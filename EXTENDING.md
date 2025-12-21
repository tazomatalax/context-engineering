# Extending Context Engineering

This guide explains how to add new Skills, Agents, Commands, and MCP Servers to the Context Engineering toolkit.

## 📂 Directory Structure

The CLI aggregates assets from the following locations in the repository:

- **Skills**: `.github/skills/`
- **Agents**: `.github/agents/`
- **Commands**: `.github/commands/`
- **MCP Servers**: `.vscode/mcp.json`

## 🧠 Adding a Skill

Skills are reusable prompts for specific tasks (e.g., "Generate Unit Tests", "Refactor Code").

1.  Create a new folder: `.github/skills/<skill-name>/`
2.  Add a `SKILL.md` file with YAML frontmatter (`name`, `description`) and markdown instructions.
3.  (Optional) Add `scripts/`, `references/`, or `assets/` subfolders for bundled resources.

**Example:** `.github/skills/svg/SKILL.md`

## 🕵️ Adding an Agent

Agents are autonomous personas with specific instructions and capabilities.

1.  Create a new folder: `.github/agents/<agent-name>/`
2.  Add an `instructions.md` file defining the agent's behavior.
3.  (Optional) Add a `README.md` with usage instructions.

**Example:** `.github/agents/code-reviewer/instructions.md`

## ⚡ Adding a Command

Commands are quick actions or slash commands.

1.  Create a new folder: `.github/commands/<command-name>/`
2.  Add a `command.md` file describing the command.

**Example:** `.github/commands/explain/command.md`

## 🔌 Adding an MCP Server

Model Context Protocol (MCP) servers provide tools and context to AI assistants.

1.  Open `.vscode/mcp.json`.
2.  Add a new entry to the `servers` object.

**Example:**

```json
{
  "servers": {
    "my-new-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server-package"]
    }
  }
}
```

## 📦 Releasing Changes

After adding new assets:

1.  Commit your changes.
2.  The CI/CD pipeline will automatically bundle the new assets into the CLI.
3.  Users can update the CLI to see the new assets.
