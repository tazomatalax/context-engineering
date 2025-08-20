# Context Engineering - Snippets & Patterns

## 📋 Common Warp Agent Patterns

### Context Attachment Template
```
[TASK_DESCRIPTION]

Context files to consider:
- PRPs/active/[ISSUE_NUMBER]-*.md (the PRP file)
- [EXAMPLE_FILES] (patterns to follow)
- [TEST_FILES] (testing patterns)
- [CONFIG_FILES] (.env, package.json, etc.)
- validate.sh (validation requirements)

Requirements:
- Follow existing project patterns
- Run ./validate.sh until exit code 0
- Update PRP Implementation Notes section
- Test all acceptance criteria
```

### Quick Validation Check
```bash
# Auto-detect and run quick validation
if [ -f "package.json" ]; then
  npm run lint:fix && npm run type-check
elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
  ruff check . --fix && mypy .
elif [ -f "go.mod" ]; then
  go fmt ./... && go vet ./...
elif [ -f "Cargo.toml" ]; then
  cargo fmt && cargo clippy
fi
```

### PRP Implementation Notes Entry
```
[YYYY-MM-DDTHH:MM:SSZ] | [TASK_NAME] | [STATUS] | files: file1,file2 | cmds: "./validate.sh:0" | note: [SHORT_DESCRIPTION]
```

---

## 🎯 Project Setup Snippets

### Initialize Context Engineering in New Project
```bash
# Clone and run the installer
git clone https://github.com/tazomatalax/context-engineering.git
cd context-engineering && ./install.sh

# Configure environment
cp .env.example .env
# Edit .env with GITHUB_TOKEN and GITHUB_REPO

# Install script dependencies (if using NPX method)
npm install @octokit/rest@19.0.13 dotenv
```

### Verify Context Engineering Setup
```bash
# Check required files exist
ls -la .claude/commands/
ls -la scripts/generation/
ls -la scripts/submission/
ls -la PRPs/templates/
test -x ./validate.sh && echo "validate.sh is executable" || echo "validate.sh needs chmod +x"

# Test environment variables
source .env
echo "GitHub Token: ${GITHUB_TOKEN:0:8}..." 
echo "GitHub Repo: $GITHUB_REPO"
```

---

## 🔄 Workflow State Management

### Check Current Workflow State
```bash
# Check for active PRPs
ls -la PRPs/active/

# Check for task drafts
ls -la temp/task-draft-*.md 2>/dev/null || echo "No task drafts found"

# Check git status
git status --porcelain

# Check validation status
./validate.sh && echo "✅ Validation passes" || echo "❌ Validation fails"
```

### Clean Up Workflow Artifacts
```bash
# Clean completed task artifacts (be careful!)
# rm -f temp/task-draft-*.md
# rm -f temp/pr-notes-*.md

# Show what would be cleaned
find temp/ -name "task-draft-*.md" -o -name "pr-notes-*.md" 2>/dev/null || echo "Nothing to clean"
```

---

## 🧪 Testing & Validation Snippets

### Manual Feature Test Template
```bash
# Test the implemented feature
echo "Testing: [FEATURE_NAME]"

# Basic functionality
[COMMAND_TO_TEST_BASIC_FUNCTION]

# Edge cases
[COMMAND_TO_TEST_EDGE_CASES]

# Error handling
[COMMAND_TO_TEST_ERROR_HANDLING]

# Integration
[COMMAND_TO_TEST_INTEGRATION]

echo "✅ All manual tests passed" || echo "❌ Manual tests failed"
```

### Debug Validation Failures
```bash
# Run validation with verbose output
./validate.sh 2>&1 | tee validation-debug.log

# Check specific test failures
if [ -f "package.json" ]; then
  npm test -- --verbose
elif command -v pytest >/dev/null 2>&1; then
  pytest -v
fi

# Check linting issues
if [ -f "package.json" ]; then
  npm run lint
elif command -v ruff >/dev/null 2>&1; then
  ruff check . --show-fixes
fi
```

---

## 🚀 GitHub Integration Snippets

### Quick Issue Status Check
```bash
# Requires GitHub CLI (gh)
gh issue view [ISSUE_NUMBER] --json title,state,assignees,labels

# Or using curl with GitHub API
curl -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_REPO/issues/[ISSUE_NUMBER]" | \
  jq '.title, .state'
```

### PR Status Check
```bash
# Check if PR exists for issue
gh pr list --search "closes:[ISSUE_NUMBER]" --json number,title,url

# Check PR status
gh pr view [PR_NUMBER] --json title,state,mergeable,reviewDecision
```

### Branch Management
```bash
# Create feature branch for issue
git checkout -b "feat/issue-[ISSUE_NUMBER]-[FEATURE_SLUG]"

# Clean up merged branches
git branch --merged | grep -E "feat/|feature/" | xargs -n 1 git branch -d
```

---

## 📊 Monitoring & Reporting

### Context Engineering Metrics
```bash
# Count active PRPs
echo "Active PRPs: $(ls PRPs/active/*.md 2>/dev/null | wc -l)"

# Count recent implementations
echo "Recent implementations: $(find PRPs/active/ -name "*.md" -exec grep -l "Implementation Notes" {} \; 2>/dev/null | wc -l)"

# Validation pass rate (requires log analysis)
echo "Recent validation attempts:"
grep -c "validate.sh" ~/.zsh_history | head -5 || echo "History not available"
```

### Project Health Check
```bash
# Overall project status
echo "=== Context Engineering Health Check ==="
echo "Validation Status: $(./validate.sh >/dev/null 2>&1 && echo '✅ PASS' || echo '❌ FAIL')"
echo "Git Status: $(git status --porcelain | wc -l) uncommitted files"
echo "Active PRPs: $(ls PRPs/active/*.md 2>/dev/null | wc -l)"
echo "Environment: $(.env >/dev/null 2>&1 && echo '✅ Configured' || echo '❌ Missing')"
```

---

## 🎨 Warp Agent Conversation Starters

### Start New Feature
```
"I want to implement [FEATURE_DESCRIPTION] using our Context Engineering workflow. Please create a comprehensive PRP following our template and guide me through the Plan → Execute → Submit process."
```

### Continue Existing Work
```
"Continue implementing PRPs/active/[ISSUE_NUMBER]-[FEATURE_NAME].md. Follow the acceptance criteria, run validation loops, and update the Implementation Notes section as you progress."
```

### Debug and Fix
```
"The validation script ./validate.sh is failing. Please analyze the errors, fix the issues, and ensure all checks pass before we proceed with the implementation."
```

### Submit Completed Work
```
"The feature in issue #[ISSUE_NUMBER] is complete and ./validate.sh passes. Please submit the pull request using our submission script and extract the implementation notes from the PRP file."
```
