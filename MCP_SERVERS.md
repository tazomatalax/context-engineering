# MCP Server Installation Quick Reference

This document contains all the commands to install and configure the MCP servers used in this project.

## Installation Commands

### 1. Context7 (HTTP MCP Server)

```bash
claude mcp add --transport http context7 "https://mcp.context7.com/mcp"
```

### 2. Neo4j Memory (Python/uvx)

```bash
claude mcp add neo4j-memory uvx "mcp-neo4j-memory@0.2.0" -- --db-url "$NEO4J_URL" --username "$NEO4J_USERNAME" --password "$NEO4J_PASSWORD"
```

### 3. Sequential Thinking (NPX)

```bash
claude mcp add sequential-thinking npx "-y" "@modelcontextprotocol/server-sequential-thinking"
```

### 4. Brave Search (NPX with API Key)

```bash
env BRAVE_API_KEY="$BRAVE_API_KEY" claude mcp add brave-search npx "-y" "@modelcontextprotocol/server-brave-search"
```

### 5. Serena IDE Assistant (Git + uvx)

```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
```

## Alternative Installation Method

You can also add all servers at once by editing your `~/.claude.json` file and adding this configuration to the `mcpServers` section:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp"
    },
    "neo4j-memory": {
      "command": "uvx",
      "args": [
        "mcp-neo4j-memory@0.2.0",
        "--db-url",
        "$NEO4J_URL",
        "--username",
        "$NEO4J_USERNAME",
        "--password",
        "$NEO4J_PASSWORD"
      ]
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    },
    "brave-search": {
      "type": "stdio",
      "command": "env",
      "args": [
        "BRAVE_API_KEY=$BRAVE_API_KEY",
        "npx",
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {}
    }
  }
}
```

## Server Descriptions

- **Context7**: Provides access to up-to-date documentation for libraries and frameworks
- **Neo4j Memory**: Enables persistent knowledge graph storage and retrieval for AI memory
- **Sequential Thinking**: Adds structured thinking capabilities for complex problem-solving
- **Brave Search**: Provides web search functionality through the Brave Search API
- **Serena**: IDE assistant for enhanced development workflows and project context

## Verification

After installation, verify all servers are running with:

```bash
claude mcp list
```

## Environment Variables

Before using the servers that require credentials, make sure you have the required environment variables set:

```bash
# Neo4j Memory Server
export NEO4J_URL=your_neo4j_database_url_here
export NEO4J_USERNAME=your_neo4j_username_here
export NEO4J_PASSWORD=your_neo4j_password_here

# Brave Search Server
export BRAVE_API_KEY=your_brave_api_key_here
```

You can add these to your shell profile (`.bashrc`, `.zshrc`, etc.) or to a `.env` file that you source before running the MCP commands.

## Notes

- Replace database credentials and API keys with your own values
- The Neo4j connection requires a valid Neo4j Aura or self-hosted instance
- All NPX-based servers will download dependencies automatically on first run
