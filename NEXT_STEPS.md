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

### 1. Complete Node Runtime Script Migration
**Priority: HIGH**
**Estimated Time: 30 minutes**

The Node scripts need to be physically copied to their runtime-specific locations:

```bash
cd /workspaces/context-engineering/installer/toolkit

# Copy Node scripts to runtime directory
cp scripts/post-issue.cjs runtimes/node/scripts/
cp scripts/generation/generate-from-issue.cjs runtimes/node/scripts/generation/
cp scripts/submission/submit-pr.cjs runtimes/node/scripts/submission/

# Verify copies
ls -la runtimes/node/scripts/
ls -la runtimes/python/scripts/
```

### 2. Update Claude Command Files
**Priority: HIGH**
**Estimated Time: 45 minutes**

Update all `.claude/commands/*.md` files to support both runtimes:

**Files to update:**
- `installer/toolkit/.claude/commands/create-task.md`
- `installer/toolkit/.claude/commands/start-task.md`
- `installer/toolkit/.claude/commands/submit-pr.md`

**Changes needed:**
- Add runtime detection logic (check for `scripts/post_issue.py` vs `scripts/post-issue.cjs`)
- Update bash commands to use correct runtime:
  - Node: `node scripts/post-issue.cjs ...`
  - Python: `uv run scripts/post_issue.py ...`
- Add fallback instructions if runtime not detected

**Example pattern:**
```bash
# Detect runtime
if [ -f "scripts/post_issue.py" ]; then
    RUNTIME_CMD="uv run scripts/post_issue.py"
elif [ -f "scripts/post-issue.cjs" ]; then
    RUNTIME_CMD="node scripts/post-issue.cjs"
else
    echo "Error: No workflow scripts found"
    exit 1
fi

# Use detected runtime
$RUNTIME_CMD temp/task-draft.md
```

### 3. Update Documentation
**Priority: MEDIUM**
**Estimated Time: 30 minutes**

**Files to update:**
- `README.md` - Add runtime selection section
- `INSTALL.md` - Document runtime options
- `installer/toolkit/advanced_tools.md` - Add runtime-specific examples

**Content to add:**
- Runtime comparison table (Node vs Python)
- When to choose each runtime
- Migration guide for existing installations
- Troubleshooting for each runtime

### 4. Test Installation Flow
**Priority: HIGH**
**Estimated Time: 20 minutes**

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

Ensure existing Node-based installations continue to work:
- Test upgrade path (reinstall with Python runtime)
- Verify no breaking changes to existing workflows
- Test with existing PRPs
- Validate `.env` file handling in both runtimes

## 📋 Recommended Work Order

1. **Copy Node scripts** (Step 1) - Unblocks everything else
2. **Test installation flow** (Step 4) - Validate core functionality
3. **Update Claude commands** (Step 2) - Critical for user workflow
4. **Update documentation** (Step 3) - Help users understand changes
5. **Create runtime helper** (Step 6) - Makes commands cleaner
6. **Update uninstall** (Step 5) - Polish
7. **Backward compat testing** (Step 7) - Final validation

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
