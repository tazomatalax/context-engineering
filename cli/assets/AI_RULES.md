# AI Project Template Rules

### 🔄 Project Awareness & Context

- **Read the README.md** to understand the project structure and purpose.
- **Use consistent naming conventions, file structure, and architecture patterns** as demonstrated in the codebase.
- **Respect the `.vscode/mcp.json` configuration** for tool usage.

### 🧱 Code Structure & Modularity

- **Keep files focused and small.** If a file approaches 500 lines, refactor.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports.**

### 🧪 Testing & Reliability

- **Create tests for new features.**
- **Ensure tests pass before considering a task complete.**

### 📚 Documentation & Explainability

- **Update `README.md`** when new features are added.
- **Comment non-obvious code.**

### 🧠 AI Behavior Rules

- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions.**
- **Always confirm file paths and module names** exist before referencing them.


## Visual Development

### Design Principles
- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing