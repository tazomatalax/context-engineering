# Start Task Command

Fetches a GitHub issue (with all comments) and prepares it for local execution.

## Usage
`/start-task --issue=<issue-number>`

## Instructions for AI

When the user runs this command:

1. **Fetch the complete GitHub issue** including:
   - Original issue body
   - All comments and discussion
   - Any refinements or clarifications
2. **Combine into a single document** that captures the full context
3. **Save to** `PRPs/active/{issue-number}-{slug}.md`
4. **Confirm** the local context file is ready for execution

The GitHub issue (including its comment thread) is the source of truth. This command creates a local working copy with the complete context.

## Implementation Details

### Step 1: Fetch Complete Issue Context
Use the GitHub API or run the generation script:
```bash
node scripts/generation/generate-from-issue.js <issue-number>
```

This should fetch:
- Issue title, body, and metadata
- All comments from the issue thread
- Any implementation plans posted by `/refine-task`
- Discussion and clarifications

### Step 2: Create Comprehensive Context Document
Combine all the fetched information into a single, cohesive PRP file:

```markdown
# {Issue Title}

**GitHub Issue:** #{issue-number} - {issue-url}
**Created:** {date} by {author}
**Status:** {status}

## 🎯 Original Request

{Original issue body}

## 💬 Discussion & Refinements

{All comments and discussion from the issue thread, organized chronologically}

## 🛠️ Implementation Plan

{Any technical implementation details from comments, especially from /refine-task}

## ✅ Final Acceptance Criteria

{Consolidated acceptance criteria from original issue and comments}

## 📝 Additional Context

{Any other relevant information from the issue thread}

---

*Generated from GitHub Issue #{number} on {date}*
*Ready for execution with /execute-prp*
```

### Step 3: Save to Local PRP Directory
- Save the file to `PRPs/active/{issue-number}-{slugified-title}.md`
- Use a URL-safe slug format for the filename
- Ensure the directory exists

### Step 4: Confirmation & Next Steps
Inform the user:
- Where the PRP file was saved
- That it contains the complete issue context
- Next command to run: `/execute-prp PRPs/active/{filename}.md`

## Prerequisites

1. **Environment Setup**: Ensure `.env` file exists with required GitHub credentials:
   ```
   GITHUB_TOKEN=your_personal_access_token_here
   GITHUB_REPO=owner/repo-name
   ```

2. **Node.js Dependencies**: Run `npm install` to install required packages

## Expected Output

- A new file created in `PRPs/active/` with filename format: `{issue-number}-{feature-title}.md`
- The file contains the complete issue context including all comments
- Ready for execution with `/execute-prp`

## Example Usage

```
User: /start-task --issue=42
AI: 🔍 Fetching complete context for issue #42...
    📄 Retrieved issue: "Add user authentication system"
    💬 Found 3 comments with implementation details
    ✅ Complete context saved!
    📁 File: PRPs/active/42-add-user-authentication-system.md
    🚀 Ready to execute: /execute-prp PRPs/active/42-add-user-authentication-system.md
```

## Error Handling

The command will fail gracefully with clear error messages if:
- GitHub token is missing or invalid  
- Issue number doesn't exist
- Repository credentials are incorrect
- Network connectivity issues occur