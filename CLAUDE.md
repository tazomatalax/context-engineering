### 🔄 Project Awareness & Context

- **Always start by reading the entire PRP file** provided for the current task (e.g., `PRPs/active/123-feature.md`). This file contains the full plan, including the original GitHub issue and all related comments, and is your **single source of truth** for the task at hand.
- **Use the `examples/` directory** to understand the project's architectural patterns and coding style. Your implementation must match these patterns.
- **Use consistent naming conventions, file structure, and architecture patterns** as demonstrated in the codebase and examples.
- **Use venv_linux** (the virtual environment) whenever executing Python commands, including for unit tests.


**Workflow for toolkit improvements:**
1. Make changes to source files in `installer/toolkit/`
2. Test by creating a release and reinstalling the package
3. Never edit the deployed copies at project root (they're gitignored)



### 🧪 Testing & Reliability

- **Always create Pytest unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case
- **CRITICAL: All feature implementations must conclude by successfully running the `./validate.sh` script. The task is not complete until this script passes with exit code 0.**

### ✅ Task Completion

- **The PRP file is your task definition.** Work through all acceptance criteria and requirements specified in the PRP.

### 📚 Documentation & Explainability

- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.

### 🧠 AI Behavior Rules

- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of the current PRP task.**
