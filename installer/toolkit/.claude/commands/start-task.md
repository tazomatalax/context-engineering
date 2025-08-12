# Start Task Implementation

Fetch complete GitHub issue context and prepare for local execution.

## Command: `/start-task --issue=<issue-number>`

## MANDATORY EXECUTION SEQUENCE

### PHASE 1: ENVIRONMENT VALIDATION (Required)

1. **Validate Prerequisites**
   ```bash
   # Check these files exist:
   ✅ .env file exists
   ✅ GITHUB_TOKEN is set in .env  
   ✅ GITHUB_REPO is set in .env
   ✅ scripts/generation/generate-from-issue.cjs exists
   ✅ PRPs/active/ directory exists
   ```

2. **Test GitHub Connection**
   ```bash
   # Validate credentials work
   node scripts/generation/generate-from-issue.cjs --test-connection
   ```
   ```
   ❌ IF CONNECTION FAILS: Stop and show exact error
   ✅ IF CONNECTION WORKS: Continue to Phase 2
   ```

### PHASE 2: ISSUE FETCHING (Required)

3. **Fetch Complete Issue Data**
   ```bash
   # Execute the generation script
   node scripts/generation/generate-from-issue.cjs <issue-number>
   ```

4. **Validate Issue Data Retrieved**
   ```
   REQUIRED ISSUE COMPONENTS:
   ✅ Issue title is not empty
   ✅ Issue body contains content  
   ✅ Issue state is "open" (warn if closed)
   ✅ At least 1 comment exists OR detailed original description
   ```

### PHASE 3: PRP FILE CREATION (Required)

5. **Generate File Name Using Exact Format**
   ```
   FILENAME GENERATION RULES:
   ├── Format: {issue-number}-{slugified-title}.md
   ├── Slug Rules: lowercase, replace spaces with hyphens, remove special chars
   ├── Max Length: 50 characters total
   └── Examples:
       ├── Issue #42 "Add User Login System" → "42-add-user-login-system.md"
       ├── Issue #123 "Fix API Error Handling" → "123-fix-api-error-handling.md"
       └── Issue #5 "Implement OAuth2 Authentication Flow" → "5-implement-oauth2-authentication.md"
   ```

6. **Create Comprehensive PRP File**
   Save to: `PRPs/active/{generated-filename}`

   **Use this EXACT template:**
   ```markdown
   # {Issue Title}

   **GitHub Issue:** #{issue-number}  
   **URL:** {direct-github-url}
   **Created:** {date} by @{author}
   **Status:** {open/closed}

   ## 🎯 Original Request

   {Complete original issue body - preserve formatting}

   ## 💬 Discussion Timeline

   {All comments in chronological order:}

   ### Comment by @{author} on {date}
   {comment body}

   ### Comment by @{author} on {date}  
   {comment body}

   ## ✅ Final Acceptance Criteria

   {Extract all acceptance criteria from issue + comments into consolidated checklist}

   ## 🛠️ Implementation Requirements

   {Extract all technical requirements, file mentions, dependency requirements}

   ## 📝 Additional Context

   {Any clarifications, edge cases, or special requirements from comments}

   ---
   *Context fetched from GitHub Issue #{number} on {date}*
   *Ready for execution with: `/execute-prp PRPs/active/{filename}`*
   ```

### PHASE 4: VALIDATION & CONFIRMATION (Required)

7. **Validate PRP File Quality**
   ```
   PRP QUALITY CHECKLIST:
   ✅ File saved to correct location
   ✅ Filename follows exact naming convention
   ✅ Original issue content is complete
   ✅ All comments are included chronologically
   ✅ Acceptance criteria are clearly listed
   ✅ File ends with execution command
   ```

8. **Provide User Confirmation**
   ```
   EXACT OUTPUT FORMAT:
   🔍 Fetching GitHub issue #{number}...
   📄 Retrieved: "{issue-title}"
   💬 Found {X} comments with additional context
   ✅ Complete context saved to: PRPs/active/{filename}
   
   🚀 Ready to execute: /execute-prp PRPs/active/{filename}
   ```

## ERROR HANDLING MATRIX

```
ERROR SCENARIOS & ACTIONS:

ENVIRONMENT ERRORS:
├── .env missing → "Create .env file with GITHUB_TOKEN and GITHUB_REPO"
├── GITHUB_TOKEN empty → "Add your GitHub personal access token to .env"
├── GITHUB_REPO wrong format → "Use format: owner/repo-name in .env"
└── Scripts missing → "Run installer to set up missing files"

GITHUB API ERRORS:
├── 401 Unauthorized → "Check GITHUB_TOKEN has repo access permissions"
├── 404 Not Found → "Issue #{number} does not exist in {repo}"
├── 403 Rate Limited → "GitHub API rate limit exceeded, wait {X} minutes"
└── Network Error → "Check internet connection and try again"

ISSUE CONTENT ERRORS:
├── Issue is closed → "Warning: Issue #{number} is closed, continue anyway? (y/n)"
├── Issue has no body → "Warning: Issue has minimal content, may need clarification"
├── No acceptance criteria → "Warning: No clear acceptance criteria found"
└── Multiple conflicting requirements → "Warning: Found conflicting requirements in comments"

FILE SYSTEM ERRORS:
├── PRPs/active/ missing → "Create PRPs/active/ directory automatically"
├── Permission denied → "Check write permissions for PRPs/active/ directory"
└── File already exists → "Overwrite existing PRP file? (y/n)"
```

## SUCCESS VALIDATION CHECKLIST

Before completing, verify:
- [ ] Issue data successfully fetched from GitHub
- [ ] PRP file created with correct naming convention  
- [ ] File contains all issue content + comments
- [ ] Acceptance criteria are clearly extracted
- [ ] User provided with exact next command to run
- [ ] No errors reported during execution

## IMPLEMENTATION NOTES

**Filename Slug Function:**
```javascript
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Spaces to hyphens
    .replace(/-+/g, '-')          // Multiple hyphens to single
    .substring(0, 45);            // Limit length
}
```

**Date Format:** Use ISO format (YYYY-MM-DD HH:MM:SS UTC)

**URL Construction:** `https://github.com/{owner}/{repo}/issues/{number}`