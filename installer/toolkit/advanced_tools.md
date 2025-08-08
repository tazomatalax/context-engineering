# 🚀 Power-Ups for Your AI Assistant

This project is ready for advanced AI tooling. You can enable these features at any time by following the instructions below. This will give your AI assistant extra capabilities, like web search, live documentation access, database connections, and more.

---

### 🧠 Power-Up 1: Live Documentation (Context7)
**Use Case:** Ensures the AI is always using the latest, most accurate version of any library or framework's documentation. *Highly Recommended.*
**Setup:**
1.  This server is hosted and requires no API key.
2.  Run this command in your terminal once:
    ```bash
    claude mcp add --transport http context7 "https://mcp.context7.com/mcp"
    ```

---

### 🌐 Power-Up 2: Web Search (Brave Search)
**Use Case:** When you need the AI to research topics, read articles, or find information not present in the codebase.
**Setup:**
1.  Get a free API key from [Brave Search API](https://brave.com/search/api/).
2.  Add the key to your `.env` file: `BRAVE_API_KEY=your_key_here`
3.  Run this command once:
    ```bash
    env BRAVE_API_KEY="$BRAVE_API_KEY" claude mcp add brave-search npx "-y" "@modelcontextprotocol/server-brave-search"
    ```

---

### 🗄️ Power-Up 3: Database Access (SQLite)
**Use Case:** When your AI needs to interact with SQLite databases directly.
**Setup:**
1.  Run this command once:
    ```bash
    claude mcp add sqlite npx "-y" "@modelcontextprotocol/server-sqlite"
    ```

---

### 🐘 Power-Up 4: PostgreSQL Database Access
**Use Case:** When your AI needs to interact with PostgreSQL databases directly.
**Setup:**
1.  Set your database connection string in your `.env` file: `POSTGRESQL_CONNECTION_STRING=postgresql://username:password@host:port/database`
2.  Run this command once:
    ```bash
    env POSTGRESQL_CONNECTION_STRING="$POSTGRESQL_CONNECTION_STRING" claude mcp add postgres npx "-y" "@modelcontextprotocol/server-postgres"
    ```

---

### 🚀 Power-Up 5: Supabase Integration
**Use Case:** Complete Supabase integration for database operations, authentication, and real-time features.
**Setup:**
1.  Add your Supabase credentials to your `.env` file:
    ```
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
2.  Run this command once:
    ```bash
    env SUPABASE_URL="$SUPABASE_URL" SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" claude mcp add supabase npx "-y" "@supabase/mcp-server-supabase"
    ```

---

### 🐙 Power-Up 6: GitHub Integration
**Use Case:** Enhanced GitHub operations beyond basic git commands - manage issues, PRs, releases, and more.
**Setup:**
1.  Ensure your `GITHUB_TOKEN` is set in your `.env` file (already configured for Context Engineering)
2.  Run this command once:
    ```bash
    env GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" claude mcp add github npx "-y" "@modelcontextprotocol/server-github"
    ```

---

### 🌍 Power-Up 7: Web Fetching
**Use Case:** Fetch and analyze web content, APIs, and documentation from URLs.
**Setup:**
1.  Run this command once:
    ```bash
    claude mcp add fetch npx "-y" "@modelcontextprotocol/server-fetch"
    ```

---

### 📊 Power-Up 8: Google Drive Integration
**Use Case:** Access and manage Google Drive files and folders.
**Setup:**
1.  Follow the [Google Drive MCP setup guide](https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive) for OAuth credentials
2.  Run this command once:
    ```bash
    claude mcp add gdrive npx "-y" "@modelcontextprotocol/server-gdrive"
    ```

---

### 🔍 Power-Up 9: Everything Search (Windows)
**Use Case:** Lightning-fast file and folder search on Windows systems using Everything search engine.
**Setup:**
1.  Install [Everything](https://www.voidtools.com/) if not already installed
2.  Run this command once:
    ```bash
    claude mcp add everything npx "-y" "@modelcontextprotocol/server-everything"
    ```

---

### 📝 Power-Up 10: Sequential Thinking
**Use Case:** Enhanced reasoning capabilities for complex problem-solving tasks.
**Setup:**
1.  Run this command once:
    ```bash
    claude mcp add sequential-thinking npx "-y" "@modelcontextprotocol/server-sequential-thinking"
    ```

---

## 🎯 Quick Setup for All Recommended Tools
---

### 🧠 Power-Up 11: Neo4j Memory (Knowledge Graph Storage)
**Use Case:** Persistent knowledge graph storage and retrieval for AI memory.
**Setup:**
1. Add your Neo4j credentials to your `.env` file:
    ```
    NEO4J_URL=your_neo4j_database_url_here
    NEO4J_USERNAME=your_neo4j_username_here
    NEO4J_PASSWORD=your_neo4j_password_here
    ```
2. Run this command once:
    ```bash
    claude mcp add neo4j-memory uvx "mcp-neo4j-memory@0.2.0" -- --db-url "$NEO4J_URL" --username "$NEO4J_USERNAME" --password "$NEO4J_PASSWORD"
    ```

---

### 🤖 Power-Up 12: Serena IDE Assistant
**Use Case:** IDE assistant for enhanced development workflows and project context.
**Setup:**
1. Run this command once:
    ```bash
    claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
    ```

---

### 🛠️ MCP Server Verification & Bulk Configuration
- After installing servers, verify they are running:
    ```bash
    claude mcp list
    ```
- Advanced: You can bulk-add servers by editing your `~/.claude.json` file and adding them to the `mcpServers` section. See installer documentation for details.

For the most complete experience, run these commands to install the most useful MCP servers:

```bash
# Essential tools (no API keys required)
claude mcp add --transport http context7 "https://mcp.context7.com/mcp"
claude mcp add fetch npx "-y" "@modelcontextprotocol/server-fetch"
claude mcp add sequential-thinking npx "-y" "@modelcontextprotocol/server-sequential-thinking"

# GitHub integration (uses existing GITHUB_TOKEN from Context Engineering)
env GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" claude mcp add github npx "-y" "@modelcontextprotocol/server-github"

# Optional with API key
env BRAVE_API_KEY="$BRAVE_API_KEY" claude mcp add brave-search npx "-y" "@modelcontextprotocol/server-brave-search"
```