# v1.5.0 Release Testing Plan

## Objective
Test the new Python/uv runtime migration and simplified installation by:
1. Installing the toolkit into this repo (temporarily)
2. Creating a GitHub issue for this migration work
3. Submitting a PR for the feat/python-runtime-migration branch

## Test Steps

### 1. Install Toolkit (Python Runtime)
```bash
cd /workspaces/context-engineering
python3 installer/install.py
# Select: python runtime
```

**Expected:**
- ✅ Detects git repository
- ✅ Prompts for runtime selection
- ✅ Installs .claude/commands/
- ✅ Installs scripts/ (Python versions)
- ✅ Creates PRPs/active/ and PRPs/templates/
- ✅ Creates .env.example
- ✅ Shows next steps

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with actual credentials for tazomatalax/context-engineering
```

### 3. Test Creating Issue
Create a comprehensive issue documenting the migration:
- Use /create-task or manually create issue draft
- Test posting to GitHub

### 4. Test Submitting PR
- Commit all migration changes
- Use submit-pr script to create PR for feat/python-runtime-migration

### 5. Clean Up (Optional)
Since this is a toolkit repo, we may want to keep the installation for dogfooding.
Or remove test files if not needed.

## Success Criteria
- [ ] Python installer works without errors
- [ ] All files installed correctly
- [ ] GitHub issue created successfully
- [ ] PR submitted successfully with proper linking
- [ ] No breaking changes detected
- [ ] Ready for v1.5.0 release

## Version
- Package: v1.5.0
- Branch: feat/python-runtime-migration
- Target: main
