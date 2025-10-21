# Submit Pull Request

Create and submit a pull request. By default, the script embeds the PRP's Implementation Notes into the PR body to minimize token usage.

## Command: `/submit-pr --issue=<issue-number>`

## MANDATORY EXECUTION SEQUENCE

### PHASE 1: VALIDATION & PREPARATION (Required)

1. **Validate Prerequisites**
   ```bash
   # Check these requirements:
   ✅ .env file exists with GITHUB_TOKEN and GITHUB_REPO
   ✅ Git repository with changes to commit
   ✅ ./validate.sh has passed successfully  
   ✅ scripts/submission/submit-pr.cjs OR scripts/submission/submit_pr.py exists
   ✅ Issue number is valid
   ```

2. **Verify Implementation Quality**
   ```bash
   # MANDATORY: Final validation must pass
   ./validate.sh
   ```
   ```
   ❌ IF VALIDATE.SH FAILS: Stop and fix issues before proceeding
   ✅ IF VALIDATE.SH PASSES: Continue to Phase 2
   ```

3. **Check Git Status**
   ```bash
   git status --porcelain
   ```
   ```
   ❌ IF NO CHANGES: Error "No changes to commit"
   ✅ IF CHANGES EXIST: Continue to developer notes generation
   ```

### PHASE 2: NOTES HANDLING (Required)

4. **Use PRP Implementation Notes (Default Path)**
   - Do not generate separate notes by default. The `submit-pr.cjs` script automatically extracts the PRP section `## �️ Implementation Notes` and embeds it in the PR body.
   - Keep your PRP Implementation Notes concise — the script consumes them verbatim.

5. **Optional: Add Supplemental Developer Notes**
   - If you want to add curated notes in addition to the PRP notes, create file: `temp/pr-notes-{issue-number}.md` and pass `--notes-file` to the script. This will appear as a separate "Developer Notes" section.
   - Fallback/Flags:
     - `--no-prp-notes` to skip PRP notes entirely
     - `--collapse-prp-notes` to wrap PRP notes in a collapsible section

### PHASE 3: GIT OPERATIONS (Required)

6. **Branch Management**
   ```bash
   # Check current branch
   CURRENT_BRANCH=$(git branch --show-current)
   
   # If on main/master, create feature branch
   if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
     git checkout -b "feature/issue-{issue-number}"
   fi
   ```

7. **Commit Changes**
   ```bash
   # Stage all changes
   git add .
   
   # Create conventional commit message
   git commit -m "feat(issue-{issue-number}): {issue-title}

   Implements: #{issue-number}
   
   🤖 Generated with [Claude Code](https://claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

### PHASE 4: PULL REQUEST CREATION (Required)

8. **Execute Submission Script**
   ```bash
   # Detect runtime and execute submission
   if [ -f "scripts/submission/submit_pr.py" ]; then
       # Python runtime - default: auto-embeds PRP Implementation Notes
       uv run scripts/submission/submit_pr.py --issue={issue-number}

       # Optional: include curated Developer Notes
       # uv run scripts/submission/submit_pr.py --issue={issue-number} --notes-file=temp/pr-notes-{issue-number}.md

       # Flags:
       #   --no-prp-notes        # do not include PRP Implementation Notes
       #   --collapse-prp-notes  # wrap PRP notes in a collapsible section
   elif [ -f "scripts/submission/submit-pr.cjs" ]; then
       # Node runtime - default: auto-embeds PRP Implementation Notes
       node scripts/submission/submit-pr.cjs --issue={issue-number}

       # Optional: include curated Developer Notes
       # node scripts/submission/submit-pr.cjs --issue={issue-number} --notes-file=temp/pr-notes-{issue-number}.md

       # Flags:
       #   --no-prp-notes        # do not include PRP Implementation Notes
       #   --collapse-prp-notes  # wrap PRP notes in a collapsible section
   else
       echo "Error: No workflow scripts found"
       exit 1
   fi
   ```

9. **Validate Submission Success**
   ```
   SUBMISSION CHECKLIST:
   ✅ Branch pushed to remote repository
   ✅ Pull request created successfully
   ✅ PR linked to original issue (closes #{issue-number})
   ✅ PRP Implementation Notes included in PR body (unless --no-prp-notes)
   ✅ Developer notes (if notes-file used) included in PR body
   ✅ Comment posted on original issue with PR link
   ```

### PHASE 5: CLEANUP & CONFIRMATION (Required)

10. **Post-Submission Actions**
    ```bash
    # Switch back to main branch
    git checkout main
    
    # Provide user with PR URL and next steps
    ```

11. **Provide User Confirmation**
    ```
    EXACT OUTPUT FORMAT:
    🚀 Pull Request submitted successfully!
    
    📋 Summary:
    - Branch: feature/issue-{number}
    - PR URL: {github-pr-url}
    - Linked to: Issue #{number}
    - Developer notes: Included
    
    ✅ Next steps:
    1. Review the PR in GitHub
    2. Address any reviewer feedback
    3. Merge when approved (will auto-close issue)
    ```

## ERROR HANDLING MATRIX

```
PRE-SUBMISSION ERRORS:
├── validate.sh fails → "Fix validation errors before submitting PR"
├── No git changes → "No changes to commit - implement feature first"
├── .env missing → "Configure .env with GITHUB_TOKEN and GITHUB_REPO"
├── Invalid issue → "Issue #{number} does not exist or is inaccessible"
└── No runtime scripts → "Run installer to set up workflow scripts"

GIT OPERATION ERRORS:
├── Commit fails → "Fix git conflicts and try again"
├── Push rejected → "Pull latest changes and resolve conflicts"
├── Branch exists → "Switch to existing branch or use different name"
└── Remote not configured → "Set up git remote origin"

GITHUB API ERRORS:
├── 401 Unauthorized → "Check GITHUB_TOKEN permissions"
├── 422 Validation Failed → "PR title/body validation failed"
├── 404 Repository Not Found → "Check GITHUB_REPO format (owner/repo)"
└── Network Error → "Check internet connection and retry"

SCRIPT EXECUTION ERRORS:
├── Runtime script missing → "Run installer to restore missing scripts"
├── Dependencies missing (Node) → "Run: npm install @octokit/rest dotenv"
├── Dependencies missing (Python) → "Run: uv pip install requests"
├── Notes file missing → "Developer notes generation failed"
└── Permission denied → "Check file system permissions"
```

## BRANCH NAMING CONVENTIONS

**Format:** `feature/issue-{number}`
**Examples:**
- Issue #42 → `feature/issue-42`
- Issue #123 → `feature/issue-123`

## COMMIT MESSAGE CONVENTIONS

**Format:** `feat(issue-{number}): {issue-title}`
**Examples:**
- `feat(issue-42): Add user authentication system`
- `feat(issue-123): Fix dashboard loading performance`

## PULL REQUEST LINKING

**Auto-close Syntax:** PR description includes `Closes #{issue-number}`
**Result:** Issue automatically closes when PR is merged

## SUCCESS CRITERIA CHECKLIST

Before completion, verify:
- [ ] All git changes committed and pushed
- [ ] Pull request created with proper title and description
- [ ] Developer notes included in PR body
- [ ] PR linked to original issue for auto-close
- [ ] Comment posted on issue with PR link
- [ ] User provided with PR URL and next steps
- [ ] Switched back to main branch for clean state

## INTEGRATION WITH WORKFLOW

This command completes the Context Engineering workflow:

1. `/create-task "feature description"` → Draft comprehensive issue
2. Use runtime-appropriate post command → Post to GitHub
3. `/start-task --issue=123` → Fetch complete context  
4. `/execute-prp PRPs/active/123-*.md` → Implement feature
5. `/submit-pr --issue=123` → **Submit for review**

**Result:** Feature is implemented, validated, and ready for team review with AI-generated developer notes.