# Context Engineering - Phase 3: Submission

## 🚀 Submit Pull Request

### Description
Create and submit a pull request with automatic implementation notes extraction from PRP files.

### Command
```bash
node scripts/submission/submit-pr.cjs --issue=[ISSUE_NUMBER]
```

### Warp Agent Command
```
Submit a pull request for issue #[ISSUE_NUMBER] following our Context Engineering submission methodology:

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

CRITICAL REQUIREMENTS:
- ./validate.sh MUST pass before submission
- Implementation notes automatically extracted from PRP
- PR must be properly linked to issue
- Commit message follows conventional format

Execute: node scripts/submission/submit-pr.cjs --issue=[ISSUE_NUMBER]
```

### Context Files to Attach
- The PRP file containing implementation notes
- .env file (for GitHub credentials validation)

### Parameters
- `ISSUE_NUMBER`: GitHub issue number to link the PR to

### Optional Flags
- `--notes-file=temp/pr-notes.md`: Add additional developer notes
- `--no-prp-notes`: Skip automatic PRP notes extraction
- `--collapse-prp-notes`: Wrap PRP notes in collapsible section
- `--dry-run`: Preview PR body without creating actual PR

---

## 📝 Create Additional Developer Notes

### Description
Create supplemental developer notes to include alongside automatic PRP notes in the PR.

### Warp Agent Command
```
Create additional developer notes for issue #[ISSUE_NUMBER]:

1. Review the implemented changes and PRP implementation notes
2. Identify key points that would help reviewers understand the changes
3. Create temp/pr-notes-[ISSUE_NUMBER].md with:
   - Summary of key architectural decisions
   - Explanation of complex logic or algorithms
   - Notes about potential impacts or dependencies
   - Specific review focus areas
4. Keep notes concise and reviewer-focused
5. Complement (don't duplicate) the PRP implementation notes

These notes will be included as a "Developer Notes" section in the PR.
```

### Output File
- `temp/pr-notes-[ISSUE_NUMBER].md`

---

## 🔄 PR Dry Run Preview

### Description
Preview the PR body content without actually creating the PR.

### Command
```bash
node scripts/submission/submit-pr.cjs --issue=[ISSUE_NUMBER] --dry-run
```

### Warp Agent Command
```
Preview the pull request content for issue #[ISSUE_NUMBER]:

1. Run the submission script in dry-run mode
2. Review the generated PR title and body content
3. Verify implementation notes are properly extracted from PRP
4. Check that all required sections are included
5. Confirm formatting looks correct
6. Suggest any improvements to the content

Execute: node scripts/submission/submit-pr.cjs --issue=[ISSUE_NUMBER] --dry-run

This allows reviewing the PR content before actual submission.
```

---

## 🐛 Fix PR Submission Issues

### Description
Troubleshoot and resolve common PR submission problems.

### Warp Agent Command
```
Troubleshoot PR submission issues for issue #[ISSUE_NUMBER]:

1. Check common failure points:
   - ./validate.sh exit code (must be 0)
   - Git changes present (git status --porcelain)
   - .env file with valid GITHUB_TOKEN and GITHUB_REPO
   - Network connectivity to GitHub API

2. Verify GitHub credentials:
   - Token has 'repo' scope permissions
   - Repository exists and is accessible
   - Issue number is valid and open

3. Check git repository state:
   - On correct branch with changes
   - Remote origin is configured
   - No merge conflicts present

4. Test with dry-run first:
   node scripts/submission/submit-pr.cjs --issue=[ISSUE_NUMBER] --dry-run

5. Provide specific error diagnosis and recommended fixes

Common fixes:
- Re-run ./validate.sh to ensure all checks pass
- Check .env file configuration
- Verify git status and branch state
- Test GitHub token permissions
```

---

## ✅ Post-Submission Checklist

### Description
Verify successful PR submission and provide next steps.

### Warp Agent Command
```
Verify successful PR submission for issue #[ISSUE_NUMBER]:

1. Confirm PR was created successfully with correct:
   - Title matching the issue
   - Implementation notes extracted from PRP
   - Proper linking to close the issue
   - All required sections included

2. Check that comment was posted on the original issue

3. Verify branch operations:
   - Feature branch pushed to remote
   - Switched back to main/master branch
   - Working directory is clean

4. Provide follow-up actions:
   - Review PR URL and content
   - Monitor for reviewer feedback
   - Be ready to address comments or requested changes
   - Confirm CI/CD pipeline status if applicable

5. Suggest any additional verification steps specific to this feature
```

### Expected Outcome
- PR created and properly linked to issue
- Implementation notes included in PR body
- Ready for team review and eventual merge
