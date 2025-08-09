#!/bin/bash
#
# Smart Validation Script - Context Engineering Quality Gate
# 
# Auto-detects your project type and runs appropriate validation commands.
# Customize this script by uncommenting and modifying the sections below.
#

set -e  # Exit on any error (can be overridden with || true)

echo "🔍 Running validation checks..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run command with graceful failure
run_check() {
    local name="$1"
    shift
    echo "🔄 $name..."
    if "$@"; then
        echo "✅ $name passed"
    else
        echo "❌ $name failed (exit code $?)"
        echo "   Command: $*"
        echo "   This may need to be configured for your project"
        # Don't exit - continue with other checks
        return 1
    fi
}

# Auto-detect project type and run basic checks
validation_failed=0

# Node.js/JavaScript Projects
if [[ -f "package.json" ]]; then
    echo "📦 Detected Node.js project"
    
    # Try package.json scripts first (most reliable)
    if grep -q '"lint"' package.json 2>/dev/null; then
        run_check "Package Lint Script" npm run lint || validation_failed=1
    elif command_exists npx && npx eslint --version >/dev/null 2>&1; then
        run_check "ESLint" npx eslint . || validation_failed=1
    else
        echo "⚠️  No linting configured - consider adding eslint"
    fi
    
    if grep -q '"test"' package.json 2>/dev/null; then
        run_check "Package Test Script" npm test || validation_failed=1  
    elif grep -q '"build"' package.json 2>/dev/null; then
        run_check "Package Build Script" npm run build || validation_failed=1
    else
        echo "⚠️  No test/build script found in package.json"
    fi
fi

# Python Projects  
if [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]]; then
    echo "🐍 Detected Python project"
    
    if command_exists ruff; then
        run_check "Ruff Linting" ruff check . || validation_failed=1
    elif command_exists flake8; then
        run_check "Flake8 Linting" flake8 . || validation_failed=1
    else
        echo "⚠️  No Python linter found (ruff, flake8)"
    fi
    
    if command_exists mypy; then
        run_check "MyPy Type Checking" mypy . || validation_failed=1
    fi
    
    if command_exists pytest; then
        run_check "Pytest" pytest || validation_failed=1
    elif command_exists python && [[ -d "tests" ]]; then
        run_check "Python Tests" python -m pytest tests/ || validation_failed=1
    fi
fi

# Git checks (universal)
if [[ -d ".git" ]]; then
    echo "📝 Running Git checks..."
    
    # Check for uncommitted changes (warning, not failure)
    if [[ -n "$(git status --porcelain)" ]]; then
        echo "⚠️  Working directory has uncommitted changes"
        git status --short
    else
        echo "✅ Working directory clean"  
    fi
fi

# Custom validation section - EDIT THIS FOR YOUR PROJECT
echo ""
echo "🎯 Custom Project Validation"
echo "   Edit validate.sh to add project-specific checks below this line"

# --- CUSTOMIZE BELOW THIS LINE ---
# 
# Uncomment and modify these examples for your specific project:
#
# run_check "Custom Linting" your-custom-lint-command
# run_check "Custom Tests" your-test-command
# run_check "Custom Build" your-build-command
#
# Example customizations:
#
# # Next.js project
# run_check "Next.js Build" npx next build
# run_check "TypeScript Check" npx tsc --noEmit
#
# # Django project  
# run_check "Django Check" python manage.py check
# run_check "Django Tests" python manage.py test
#
# # Go project
# run_check "Go Vet" go vet ./...
# run_check "Go Test" go test ./...

# --- END CUSTOMIZATION SECTION ---

echo ""
if [[ $validation_failed -eq 0 ]]; then
    echo "✅ All validation checks passed!"
    exit 0
else
    echo "❌ Some validation checks failed"
    echo "   Consider customizing validate.sh for your project"
    echo "   Your AI assistant can help configure this script"
    exit 1
fi