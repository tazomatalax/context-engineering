# Next Steps - Python/uv Runtime Migration

## 🎯 What's Been Completed

### ✅ Phase 1: Python Script Implementation
- Created Python equivalents for all core workflow scripts:
  - `installer/toolkit/runtimes/python/scripts/post_issue.py`
  - `installer/toolkit/runtimes/python/scripts/generation/generate_from_issue.py`
  - `installer/toolkit/runtimes/python/scripts/submission/submit_pr.py`
- All scripts use `requests` library (minimal dependencies)
- All scripts support `uv run` execution
- Manual `.env` file parsing (no external dotenv dependency)
- Full feature parity with Node.js scripts

### ✅ Phase 2: Runtime Separation
- Created `installer/toolkit/runtimes/` directory structure
- Organized Node scripts into `runtimes/node/scripts/`
- Organized Python scripts into `runtimes/python/scripts/`
- Added comprehensive README files for each runtime
- Created main `runtimes/README.md` explaining the architecture

### ✅ Phase 3: Installer Updates
- Added `detect_runtime()` function to `install.sh`
- Implemented interactive runtime selection (Node vs Python)
- Updated `install_files()` to deploy runtime-specific scripts
- Added runtime-specific dependency instructions in output
- Support for `RUNTIME` environment variable override

## 🚧 What's Still Needed

### 1. Complete Node Runtime Script Migration ✅ COMPLETED
**Status: DONE**

The Node scripts have been successfully copied to `installer/toolkit/runtimes/node/scripts/`:
- ✅ `post-issue.cjs`
- ✅ `generation/generate-from-issue.cjs`
- ✅ `submission/submit-pr.cjs`

### 2. Update Claude Command Files ✅ COMPLETED
**Status: DONE**

All `.claude/commands/*.md` files have been updated to support both runtimes:
- ✅ `create-task.md` - Auto-detects runtime for posting issues
- ✅ `start-task.md` - Auto-detects runtime for fetching issues
- ✅ `submit-pr.md` - Auto-detects runtime for submitting PRs

**Implementation:**
- Added runtime detection logic (checks for `.py` vs `.cjs` files)
- Updated bash commands to use correct runtime
- Added fallback instructions if runtime not detected

### 3. Update Documentation ✅ COMPLETED
**Status: DONE**

Documentation has been updated with runtime selection information:
- ✅ `README.md` - Added runtime selection section in Quick Start
- ✅ `INSTALL.md` - Documented runtime options, pros/cons, and setup
- ✅ Main docs explain both Python and Node.js runtimes

### 4. Create Runtime Detection Helper ✅ COMPLETED
**Status: DONE**

Created `installer/toolkit/scripts/detect-runtime.sh` with:
- ✅ `detect_runtime_type()` - Detects Python vs Node.js
- ✅ `get_post_issue_cmd()` - Returns correct command for runtime
- ✅ `get_generate_from_issue_cmd()` - Returns correct command for runtime
- ✅ `get_submit_pr_cmd()` - Returns correct command for runtime
- ✅ `check_runtime_dependencies()` - Validates runtime setup
- ✅ `show_runtime_info()` - Displays runtime information

### 5. Update Uninstall Logic ✅ COMPLETED
**Status: DONE**

The uninstaller message in `install.sh` has been updated:
- ✅ Now includes `.env` in cleanup command
- ✅ Handles both runtime script formats

### 6. Test Installation Flow
**Priority: HIGH**
**Estimated Time: 20 minutes**
**Status: READY TO TEST**

Test both runtime paths:

```bash
# Test Node runtime
cd /tmp/test-node
git init
RUNTIME=node bash /workspaces/context-engineering/install.sh
# Verify Node scripts installed
# Test: node scripts/post-issue.cjs --help

# Test Python runtime
cd /tmp/test-python
git init
RUNTIME=python bash /workspaces/context-engineering/install.sh
# Verify Python scripts installed
# Test: uv run scripts/post_issue.py --help
```

### 5. Update Uninstall Logic
**Priority: LOW**
**Estimated Time: 15 minutes**

The uninstaller message in `install.sh` needs updating to handle both runtimes:

```bash
# Current (line ~298):
echo "To uninstall: rm -rf .claude PRPs scripts validate.sh AI_RULES.md advanced_tools.md"

# Should handle both:
# - scripts/post-issue.cjs (Node)
# - scripts/post_issue.py (Python)
# - scripts/generation/ (both)
# - scripts/submission/ (both)
```

### 6. Create Runtime Detection Helper
**Priority: LOW**
**Estimated Time: 20 minutes**

Create `installer/toolkit/scripts/detect-runtime.sh` helper script that can be sourced by Claude commands:

```bash
#!/bin/bash
# detect-runtime.sh - Runtime detection helper

detect_runtime_cmd() {
    if [ -f "scripts/post_issue.py" ]; then
        echo "python"
    elif [ -f "scripts/post-issue.cjs" ]; then
        echo "node"
    else
        echo "unknown"
    fi
}

get_post_issue_cmd() {
    case "$(detect_runtime_cmd)" in
        python) echo "uv run scripts/post_issue.py" ;;
        node) echo "node scripts/post-issue.cjs" ;;
        *) return 1 ;;
    esac
}

# Export functions
export -f detect_runtime_cmd
export -f get_post_issue_cmd
```

### 7. Backward Compatibility Testing
**Priority: MEDIUM**
**Estimated Time: 30 minutes**
**Status: READY TO TEST**

Ensure existing Node-based installations continue to work:
- Test upgrade path (reinstall with Python runtime)
- Verify no breaking changes to existing workflows
- Test with existing PRPs
- Validate `.env` file handling in both runtimes

## 📋 Recommended Work Order ✅ PROGRESS UPDATE

1. ✅ **Copy Node scripts** (Step 1) - COMPLETED
2. ✅ **Update Claude commands** (Step 2) - COMPLETED
3. ✅ **Update documentation** (Step 3) - COMPLETED
4. ✅ **Create runtime helper** (Step 6) - COMPLETED (out of order)
5. ✅ **Update uninstall** (Step 5) - COMPLETED
6. 🔄 **Test installation flow** (Step 4) - IN PROGRESS
7. ⏳ **Backward compat testing** (Step 7) - READY

## 🔍 Testing Checklist

Before considering this complete, verify:

- [ ] `RUNTIME=node ./install.sh` deploys Node scripts
- [ ] `RUNTIME=python ./install.sh` deploys Python scripts
- [ ] Interactive installer prompts for runtime when both available
- [ ] Node scripts execute successfully (with deps installed)
- [ ] Python scripts execute successfully (with requests installed)
- [ ] `uv run scripts/post_issue.py` works
- [ ] `node scripts/post-issue.cjs` works
- [ ] Claude commands auto-detect correct runtime
- [ ] Both runtimes create identical GitHub issues
- [ ] Both runtimes generate identical PRP files
- [ ] Both runtimes submit PRs with same format
- [ ] Documentation is clear for both runtimes

## 🐛 Known Issues

1. **File System Provider Error**: Some terminal commands fail with "ENOPRO" error in Codespaces
   - Workaround: Use file creation tools instead of `cp` commands
   - Need to manually copy Node scripts to `runtimes/node/scripts/`

2. **Installer Download**: Remote installation (curl | bash) not yet tested
   - Need to verify GitHub raw URLs work for runtime-specific paths

3. **Python Script Permissions**: May need explicit `chmod +x` for Python scripts
   - Already added in installer, but verify on actual deployment

## 💡 Future Enhancements

- [ ] Add runtime auto-detection based on project type
- [ ] Support for `npx` and `uvx` for zero-install execution
- [ ] Add runtime performance benchmarks
- [ ] Create GitHub Actions workflow for multi-runtime testing
- [ ] Add TypeScript runtime option
- [ ] Support mixed runtime environments (different scripts, different runtimes)

## 📞 Contact / Handoff

- **Branch**: Will be created as `feat/python-runtime-migration`
- **Issue**: Related to multi-runtime support
- **Files Changed**: ~10 files added/modified
- **Status**: Core implementation complete, needs final polish & testing

To resume work:
```bash
git checkout feat/python-runtime-migration
cat NEXT_STEPS.md
# Start with Step 1: Copy Node scripts
```
