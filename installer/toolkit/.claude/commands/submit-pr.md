# Submit Pull Request

## Command

`/submit-pr --issue=<issue-number>`

## Description

Automatically creates a feature branch, commits all changes, pushes to remote, and opens a Pull Request that links back to the original GitHub Issue. This command completes the Context Engineering workflow by automating the submission process.

## Usage

- `/submit-pr --issue=123` - Submit PR for GitHub issue #123
- The command requires a GitHub issue number as argument
- Should only be used after successfully completing a PRP implementation

## Prerequisites

1. **Environment Setup**: Ensure `.env` file exists with required GitHub credentials:

   ```
   GITHUB_TOKEN=your_personal_access_token_here
   GITHUB_REPO_OWNER=your_username
   GITHUB_REPO_NAME=your_repository_name
   ```

2. **Git Repository**: Must be in a git repository with changes ready to commit

3. **Validation Complete**: The `./validate.sh` script should have passed successfully

4. **Remote Repository**: Git remote 'origin' should be configured and accessible

## Execution Process

When this command is invoked, Claude will:

1. **Generate Developer Notes** by analyzing the git diff:
   - Analyze all changed files using `git diff`
   - Summarize what files were changed and why
   - Highlight key implementation decisions
   - Note any important considerations for reviewers
   - Create concise, reviewer-friendly notes

2. **Create Feature Branch** (if not already on one):
   - Format: `feature/issue-{number}`
   - Switch to the new branch

3. **Commit Changes**:
   - Stage all changes with `git add .`
   - Create conventional commit message
   - Commit the implementation

4. **Save Developer Notes and Execute Submission Script**:
   - Save the generated developer notes to `temp/pr-notes.md`
   - Execute the script with the notes file path:
   ```bash
   node scripts/submission/submit-pr.cjs --issue=<number> --notes-file=temp/pr-notes.md
   ```

5. **Script Operations**:
   - Fetch GitHub issue details
   - Push branch to remote with upstream tracking
   - Create Pull Request using GitHub API
   - Inject developer notes into PR body
   - Link PR to original issue (auto-closes on merge)
   - Post comment on original issue with PR link

6. **Cleanup**: Switch back to main/master branch

## Expected Output

- A new feature branch created and pushed to remote
- A Pull Request opened with:
  - Title matching the issue title
  - Body containing AI-generated Developer Notes
  - Reference to the issue and PRP file
  - Auto-close linking to the issue
- A comment posted on the original issue with PR link
- Console output with PR URL and next steps

The AI-generated developer notes will include a section like:

```markdown
## Developer Notes
### Files Changed
- `src/auth/login.js` - Added OAuth integration with error handling
- `src/components/LoginForm.jsx` - Updated UI to support OAuth flow
- `tests/auth.test.js` - Added comprehensive test coverage

### Key Implementation Decisions
- Used bcrypt for password hashing (industry standard)
- Implemented rate limiting to prevent brute force attacks
- Added session management with configurable timeout

### Review Considerations  
- OAuth credentials are properly secured in environment variables
- All user input is validated and sanitized
- Error messages don't leak sensitive information
```

## Error Handling

The script will fail gracefully with clear error messages if:

- No changes to commit (clean working directory)
- Git repository issues or missing remote
- GitHub API authentication failures
- Network connectivity problems
- Issue number doesn't exist

## Branch Naming Convention

Branches are created using the format: `feat/{issue-number}-{sanitized-title}`

Example: `feat/42-user-authentication-system`

## Commit Message Convention

Commits use conventional format: `feat(issue-{number}): {title}`

Example: `feat(issue-42): Implement user authentication system`

## Example

```
User: /submit-pr --issue=42
Claude: 🚀 Starting PR submission for issue #42...
        📊 Analyzing git diff to generate developer notes...
        ✅ Generated comprehensive developer notes
        🌿 Creating feature branch: feature/issue-42
        💾 Committing changes...
        📝 Running submission script with developer notes...
        🔍 Fetching issue #42: "User Authentication System"
        ⬆️  Pushing to remote...
        🔄 Creating pull request with developer notes...
        💬 Posted comment on issue #42 with PR link
        ✅ Pull Request created successfully!
        🔗 URL: https://github.com/user/repo/pull/15
```

## Integration with Workflow

This command completes the Context Engineering workflow:

1. `/start-task --issue=42` - Fetch issue context and create PRP
2. `/execute-prp PRPs/active/42-feature.md` - Implement feature
3. `./validate.sh` - Ensure validation passes
4. `/submit-pr --issue=42` - Submit for review with AI-generated notes

Or for simple issues created manually:
1. `/refine-task --issue=42` - Add technical implementation plan
2. `/start-task --issue=42` - Fetch complete context
3. `/execute-prp PRPs/active/42-feature.md` - Implement feature
4. `./validate.sh` - Ensure validation passes
5. `/submit-pr --issue=42` - Submit for review

## Next Steps After PR Creation

- Review the PR in GitHub
- Address any feedback from reviewers
- Merge when approved
- Issue will auto-close on merge
