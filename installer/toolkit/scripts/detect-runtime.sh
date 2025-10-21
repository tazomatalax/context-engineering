#!/bin/bash
# detect-runtime.sh - Runtime detection helper for Context Engineering workflows
#
# This script provides helper functions to detect which runtime (Node.js or Python)
# is installed and provides the correct commands for each script.
#
# USAGE:
#   source scripts/detect-runtime.sh
#   detect_runtime_type
#   get_post_issue_cmd
#   get_generate_from_issue_cmd
#   get_submit_pr_cmd
#
# EXAMPLE:
#   source scripts/detect-runtime.sh
#   RUNTIME=$(detect_runtime_type)
#   if [ "$RUNTIME" = "python" ]; then
#       uv run scripts/post_issue.py temp/task.md
#   elif [ "$RUNTIME" = "node" ]; then
#       node scripts/post-issue.cjs temp/task.md
#   fi

# Detect which runtime is installed based on presence of scripts
detect_runtime_type() {
    if [ -f "scripts/post_issue.py" ]; then
        echo "python"
    elif [ -f "scripts/post-issue.cjs" ]; then
        echo "node"
    else
        echo "unknown"
    fi
}

# Get the command to run post-issue script
get_post_issue_cmd() {
    local runtime=$(detect_runtime_type)
    case "$runtime" in
        python)
            echo "uv run scripts/post_issue.py"
            ;;
        node)
            echo "node scripts/post-issue.cjs"
            ;;
        *)
            echo "ERROR: No workflow scripts found. Please run the installer." >&2
            return 1
            ;;
    esac
}

# Get the command to run generate-from-issue script
get_generate_from_issue_cmd() {
    local runtime=$(detect_runtime_type)
    case "$runtime" in
        python)
            echo "uv run scripts/generation/generate_from_issue.py"
            ;;
        node)
            echo "node scripts/generation/generate-from-issue.cjs"
            ;;
        *)
            echo "ERROR: No workflow scripts found. Please run the installer." >&2
            return 1
            ;;
    esac
}

# Get the command to run submit-pr script
get_submit_pr_cmd() {
    local runtime=$(detect_runtime_type)
    case "$runtime" in
        python)
            echo "uv run scripts/submission/submit_pr.py"
            ;;
        node)
            echo "node scripts/submission/submit-pr.cjs"
            ;;
        *)
            echo "ERROR: No workflow scripts found. Please run the installer." >&2
            return 1
            ;;
    esac
}

# Check if runtime dependencies are installed
check_runtime_dependencies() {
    local runtime=$(detect_runtime_type)
    case "$runtime" in
        python)
            if ! command -v uv &> /dev/null; then
                echo "⚠️  Warning: 'uv' is not installed. Install with: curl -LsSf https://astral.sh/uv/install.sh | sh" >&2
                return 1
            fi
            # Check if requests is available
            if ! uv run python -c "import requests" 2>/dev/null; then
                echo "⚠️  Warning: Python 'requests' package not found. Install with: uv pip install requests" >&2
                return 1
            fi
            ;;
        node)
            if ! command -v node &> /dev/null; then
                echo "⚠️  Warning: Node.js is not installed" >&2
                return 1
            fi
            # Check if node_modules exists
            if [ ! -d "node_modules" ]; then
                echo "⚠️  Warning: Node dependencies not installed. Run: npm install" >&2
                return 1
            fi
            ;;
        *)
            echo "❌ Error: No workflow scripts found. Please run the installer." >&2
            return 1
            ;;
    esac
    return 0
}

# Display runtime information
show_runtime_info() {
    local runtime=$(detect_runtime_type)
    case "$runtime" in
        python)
            echo "🐍 Runtime: Python (uv)"
            echo "📦 Scripts: scripts/*.py"
            ;;
        node)
            echo "🟢 Runtime: Node.js"
            echo "📦 Scripts: scripts/*.cjs"
            ;;
        *)
            echo "❌ Runtime: Unknown/Not installed"
            echo "💡 Run the installer to set up workflow scripts"
            ;;
    esac
}

# Export functions for use in other scripts
export -f detect_runtime_type
export -f get_post_issue_cmd
export -f get_generate_from_issue_cmd
export -f get_submit_pr_cmd
export -f check_runtime_dependencies
export -f show_runtime_info
