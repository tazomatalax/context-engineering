# Context Engineering Workflows for Warp Drive

## 🚀 Quick Setup

### 1. Import into Warp Drive

In Warp terminal, access Warp Drive by:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Search for "Warp Drive" or click the workflows icon
3. Import these workflow files or copy the commands below

### 2. Essential Warp Drive Workflows

#### 🎯 Phase 1: Planning
**Workflow Name:** `Context Engineering - Create Task Plan`
**Description:** Create comprehensive task plan with PRP template
**Command:**
```
Create a comprehensive task plan for {description} following our Context Engineering methodology:

1. Read the Warp-optimized PRP template 
2. Expand the brief description into detailed acceptance criteria
3. Identify specific files that need changes
4. List validation requirements and test scenarios
5. Create terminal-verifiable success criteria
6. Save as PRPs/active/{issue}-{slug}.md

Requirements:
- All acceptance criteria must be testable via terminal commands
- Include specific file paths and patterns to follow
- Specify validation loops with ./validate.sh
- Format for Warp Agent Mode execution
```

**Parameters:**
- `description`: Feature description
- `issue`: Issue number (optional)

---

#### ⚡ Phase 2: Execution  
**Workflow Name:** `Context Engineering - Execute PRP`
**Description:** Implement feature with validation loops
**Command:**
```
Implement the feature described in PRPs/active/{prp_file} following our Context Engineering execution methodology:

MANDATORY EXECUTION SEQUENCE:

Phase 1 - Context Loading:
1. Read the complete PRP file and confirm understanding
2. Examine all attached context files for patterns to follow
3. Verify prerequisites (.env, validate.sh executable)

Phase 2 - Implementation Planning:
4. Create step-by-step implementation plan
5. Identify similar code patterns in the codebase
6. Break work into testable chunks

Phase 3 - Progressive Implementation:
7. Implement each step with validation loops
8. Run ./validate.sh after each major component
9. Fix any issues before proceeding to next step
10. Update PRP Implementation Notes section with progress

Phase 4 - Final Validation:
11. Ensure all acceptance criteria are met
12. Run ./validate.sh and confirm exit code 0
13. Test all manual verification commands

CRITICAL: The task is NOT complete until ./validate.sh passes with exit code 0.
```

**Parameters:**
- `prp_file`: PRP filename (e.g., `123-add-dark-mode.md`)

---

#### 🚀 Phase 3: Submission
**Workflow Name:** `Context Engineering - Submit PR`
**Description:** Create pull request with implementation notes
**Command:**
```
Submit a pull request for issue #{issue} following our Context Engineering submission methodology:

MANDATORY SUBMISSION SEQUENCE:

Phase 1 - Pre-submission Validation:
1. Verify ./validate.sh passes with exit code 0
2. Confirm all PRP acceptance criteria are met
3. Check that implementation notes are populated in PRP file
4. Ensure git status shows changes ready for commit

Phase 2 - Git Operations:
5. Create appropriate feature branch if not already on one
6. Stage and commit all changes with conventional commit message
7. Push branch to remote repository

Phase 3 - PR Creation:
8. Extract implementation notes from PRP file automatically
9. Create pull request with proper title and description
10. Link PR to original issue (auto-closes on merge)
11. Post comment on issue with PR link

Phase 4 - Cleanup:
12. Switch back to main/master branch
13. Provide PR URL and next steps

Execute: node scripts/submission/submit-pr.cjs --issue={issue}
```

**Parameters:**
- `issue`: GitHub issue number

---

### 3. Quick Commands for Warp Drive

#### 🔧 Validation Check
**Workflow Name:** `Run Validation Script`
**Command:** `./validate.sh`
**Description:** Execute project validation with auto-detection

#### 📊 Project Status
**Workflow Name:** `Context Engineering Health Check`  
**Command:**
```bash
echo "=== Context Engineering Health Check ==="
echo "Validation Status: $(./validate.sh >/dev/null 2>&1 && echo '✅ PASS' || echo '❌ FAIL')"
echo "Git Status: $(git status --porcelain | wc -l) uncommitted files"  
echo "Active PRPs: $(ls PRPs/active/*.md 2>/dev/null | wc -l)"
```

#### 📝 Post GitHub Issue
**Workflow Name:** `Post Task to GitHub`
**Command:** `node scripts/post-issue.cjs temp/task-draft-{timestamp}.md`
**Parameters:**
- `timestamp`: Timestamp from generated file

#### 🔄 Fetch GitHub Issue  
**Workflow Name:** `Start Task from GitHub Issue`
**Command:** `node scripts/generation/generate-from-issue.cjs {issue_number}`
**Parameters:**
- `issue_number`: GitHub issue number

---

## 🎨 Using with Warp Agent Mode

### Conversation Flow

1. **Planning Phase:**
   ```
   "I want to implement {feature description} using our Context Engineering workflow. Please create a comprehensive PRP following our template."
   ```

2. **Execution Phase:**
   ```
   "Continue implementing PRPs/active/{issue}-{feature}.md. Follow the acceptance criteria, run validation loops, and update the Implementation Notes section."
   ```

3. **Submission Phase:**
   ```
   "The feature in issue #{issue} is complete and ./validate.sh passes. Please submit the pull request using our submission script."
   ```

### Context Attachment Strategy

Always attach these files when starting work:
- **PRP file:** `PRPs/active/{issue}-{feature}.md`
- **Template:** `warp-prp-template.md`
- **Validation:** `validate.sh`
- **Examples:** Relevant example files showing patterns
- **Config:** `.env`, `package.json`, etc.

---

## 🛠️ Advanced Workflows

### Debug Validation Failures
**Workflow Name:** `Debug Validation Issues`
**Command:**
```
The validation script ./validate.sh is failing. Please:

1. Run ./validate.sh and analyze the specific error messages
2. Identify the root cause of each failure
3. Fix the issues systematically
4. Re-run ./validate.sh after each fix
5. Confirm all checks pass with exit code 0

Show me the specific errors and your fix strategy.
```

### Create Additional PR Notes
**Workflow Name:** `Create Supplemental PR Notes`
**Command:**
```
Create additional developer notes for issue #{issue}:

1. Review the implemented changes and PRP implementation notes
2. Identify key points that would help reviewers understand the changes
3. Create temp/pr-notes-{issue}.md with reviewer-focused content
4. Keep notes concise and complement the PRP notes

These will be included as a separate "Developer Notes" section in the PR.
```

---

## 🔄 Integration with Existing Workflows

### Warp Notebooks Integration
Save frequently used commands as Warp Notebooks:
- Validation sequences
- Testing procedures  
- GitHub operations
- Project setup steps

### Warp Workflows Integration
The workflows above integrate seamlessly with:
- Warp's command history search
- Warp's environment variable management
- Warp's block attachment features
- Warp's AI command suggestions

---

## 📚 Next Steps

1. **Import workflows** into your Warp Drive
2. **Test with a simple feature** to validate the process  
3. **Customize commands** for your specific project needs
4. **Add project-specific workflows** as you develop patterns
5. **Share with your team** for consistent development practices

The Context Engineering methodology transforms Warp Agent Mode from a general assistant into a systematic, validation-driven development partner that follows your project patterns and ensures quality at every step.
