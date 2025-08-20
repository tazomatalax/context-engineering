# Context Engineering - Phase 1: Planning

## 🎯 Create Comprehensive Task Plan

### Description
Create a detailed, implementable task plan using Context Engineering principles in Warp Agent Mode.

### Warp Agent Command
```
Create a comprehensive task plan for [FEATURE_DESCRIPTION] following our Context Engineering methodology:

1. Read the Warp-optimized PRP template 
2. Expand the brief description into detailed acceptance criteria
3. Identify specific files that need changes
4. List validation requirements and test scenarios
5. Create terminal-verifiable success criteria
6. Save as PRPs/active/[ISSUE_NUMBER]-[SLUG].md

Requirements:
- All acceptance criteria must be testable via terminal commands
- Include specific file paths and patterns to follow
- Specify validation loops with ./validate.sh
- Format for Warp Agent Mode execution
```

### Context Files to Attach
- `warp-prp-template.md` (the template)
- `examples/` directory (for patterns)
- `CLAUDE.md` or `AI_RULES.md` (for conventions)

### Parameters
- `FEATURE_DESCRIPTION`: Brief description of what to build
- `ISSUE_NUMBER`: GitHub issue number (if known)

---

## 📝 Post GitHub Issue

### Description
Convert a task draft into a GitHub issue for team visibility and tracking.

### Command
```bash
node scripts/post-issue.cjs temp/task-draft-{timestamp}.md
```

### Warp Agent Command
```
Post the task draft I just created to GitHub as a new issue:

1. Review the temp/task-draft-*.md file
2. Execute the post-issue script
3. Capture the returned issue number
4. Provide me with the next steps for implementation

Use: node scripts/post-issue.cjs temp/task-draft-[TIMESTAMP].md
```

### Prerequisites
- `.env` file configured with GITHUB_TOKEN and GITHUB_REPO
- Task draft file exists in temp/ directory

---

## 🔄 Start Task Implementation

### Description
Fetch complete GitHub issue context and prepare for local execution.

### Warp Agent Command
```
Start implementation for GitHub issue #[ISSUE_NUMBER]:

1. Fetch the complete issue data including all comments
2. Create a comprehensive PRP file in PRPs/active/
3. Include all acceptance criteria and discussion context
4. Format for Warp Agent Mode execution
5. Confirm the PRP file is ready for implementation

Execute: node scripts/generation/generate-from-issue.cjs [ISSUE_NUMBER]
```

### Parameters
- `ISSUE_NUMBER`: GitHub issue number to fetch

### Expected Output
- PRP file created in `PRPs/active/[NUMBER]-[SLUG].md`
- Ready-to-execute command provided
