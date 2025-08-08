# Create Task Command

Creates a structured GitHub issue draft from a minimal prompt, following Context Engineering patterns.

## Usage

```
/create-task <brief description>
```

## Examples

- `/create-task Add dark mode to settings`
- `/create-task Implement user authentication with OAuth`
- `/create-task Create automated backup system`

## What it does

1. Takes your brief description and expands it into a structured issue template
2. Creates a temporary `.md` file in `temp/` directory for you to edit
3. Provides guidance on how to post it to GitHub when ready

## Implementation

You are Context Engineering assistant helping create structured GitHub issues for optimal AI implementation.

When user runs `/create-task <description>`, follow these steps:

### Step 1: Create Structured Issue Draft

Create a temporary markdown file at `temp/task-draft-{timestamp}.md` with this structure:

```markdown
# 🚀 Feature Request: {TITLE}

## 🎯 Objective

{Expand the user's brief description into a comprehensive problem statement. Explain what problem this solves and why it's valuable.}

## ✅ Acceptance Criteria

{Generate specific, testable requirements as markdown checklists. Think about edge cases, error handling, and user experience.}

## 📚 Examples

{List and explain relevant examples from the `examples/` folder that should be referenced during implementation. Include patterns to follow and how they apply to this feature.}

## 📖 Documentation

{List all external documentation, APIs, libraries, and resources that will need to be referenced during development. Include URLs and specific sections.}

## 🛠️ Technical Context & Gotchas

{Based on the project structure, suggest:

- Relevant files that might need changes
- Patterns to follow from existing code
- Potential technical challenges
- Integration points
- Testing requirements}

## ⚠️ Other Considerations

{Include any additional requirements, gotchas, setup instructions, environment considerations, or specific patterns that AI assistants commonly miss in this codebase.}

## ⚡ Priority Level

{Suggest a priority: Critical/High/Medium/Low with brief reasoning}

## 🧩 Estimated Complexity

{Estimate: Simple/Medium/Complex/Very Complex with reasoning}

## 📎 Additional Context

{Leave space for user to add screenshots, mockups, related issues, etc.}

---

## Next Steps

1. Edit this file to refine requirements
2. Run: `node scripts/post-issue.js temp/task-draft-{timestamp}.md`
3. Use the returned issue number with: `/start-task --issue=<number>`
```

### Step 2: Provide Instructions

After creating the file, tell the user:

1. Where the draft file is located
2. How to edit it before posting
3. **EXACTLY** this command to post to GitHub: `node scripts/post-issue.js temp/task-draft-{timestamp}.md`

**IMPORTANT**: Always tell users to run `scripts/post-issue.js`, NOT `scripts/generation/generate-from-issue.js`. The generate-from-issue.js script fetches FROM GitHub, while post-issue.js posts TO GitHub.

### Context Engineering Principles:

- **Be comprehensive**: Don't just repeat their prompt, expand it
- **Think systematically**: Consider the full implementation lifecycle
- **Use project patterns**: Reference existing files and conventions
- **Include gotchas**: Anticipate potential issues
- **Make it testable**: Ensure acceptance criteria are measurable

### Project-Specific Context:

- Look at existing code patterns in the project
- Consider the validation requirements (validate.sh)
- Follow the modular structure principles from CLAUDE.md
- Suggest appropriate testing strategies
- Reference relevant examples/ directory patterns

Remember: The goal is to create issues so comprehensive that the `/start-task` and AI implementation will be highly successful.