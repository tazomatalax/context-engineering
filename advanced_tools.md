# 🚀 Power-Ups for Your AI Assistant

This project is ready for advanced AI tooling. You can enable these features at any time by following the instructions below. This will give your AI assistant extra capabilities, like web search and live documentation access.

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