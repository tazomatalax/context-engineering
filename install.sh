#!/bin/bash
#
# Context Engineering Universal Installer
# 
# ⚠️  DEPRECATION NOTICE ⚠️
# This bash installer is deprecated and will be removed in a future version.
# 
# Please use the modern package manager installers instead:
#   - Python: uvx context-engineering-installer
#   - Node.js: npx context-engineering-installer
#
# These are faster, more secure, and cross-platform.
#
# LEGACY USAGE (still works for now):
#   curl -fsSL https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.sh | bash
#   # OR clone and run locally:
#   git clone https://github.com/tazomatalax/context-engineering.git
#   cd context-engineering && ./install.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Show deprecation warning
echo -e "${YELLOW}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           ⚠️  DEPRECATION WARNING ⚠️                        ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  This bash installer is deprecated and will be removed     ║"
echo "║  in a future version.                                      ║"
echo "║                                                            ║"
echo "║  Please use modern package managers instead:               ║"
echo "║                                                            ║"
echo "║  Python:  uvx context-engineering-installer                ║"
echo "║  Node.js: npx context-engineering-installer                ║"
echo "║                                                            ║"
echo "║  Benefits: Faster, more secure, cross-platform            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GRAY}Continuing with legacy installer in 3 seconds...${NC}"
sleep 3
echo ""

# Runtime selection (default to node for backward compatibility)
RUNTIME="${RUNTIME:-node}"

# Helper functions
info() { echo -e "${BLUE}🚀 $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Check if parent directory is a git repository
check_git_repo() {
    local project_root="$1"
    if [ ! -d "$project_root/.git" ]; then
        error "Parent directory '$project_root' is not a git repository."
        echo "Please run this script from within a cloned context-engineering repo inside your project."
        echo "Or initialize git in your project: cd '$project_root' && git init"
        exit 1
    fi
}

# Detect project root (always parent directory since script runs from cloned repo)
detect_project_root() {
    local parent_dir="$(dirname "$PWD")"
    
    # Look for .git in parent and up from there
    local current_dir="$parent_dir"
    while [[ "$current_dir" != "/" ]]; do
        if [[ -d "$current_dir/.git" ]]; then
            echo "$current_dir"
            return 0
        fi
        current_dir="$(dirname "$current_dir")"
    done
    
    # Fallback to parent directory if no .git found
    echo "$parent_dir"
}

# Detect available runtimes
detect_runtime() {
    local has_node=false
    local has_python=false
    
    if command -v node >/dev/null 2>&1; then
        has_node=true
    fi
    
    if command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1; then
        has_python=true
    fi
    
    # If RUNTIME env var is set, validate and use it
    if [[ -n "$RUNTIME" ]]; then
        case "$RUNTIME" in
            node)
                if ! $has_node; then
                    warn "Node.js runtime requested but not found in PATH"
                    return 1
                fi
                return 0
                ;;
            python)
                if ! $has_python; then
                    warn "Python runtime requested but not found in PATH"
                    return 1
                fi
                return 0
                ;;
            *)
                error "Invalid RUNTIME value: $RUNTIME (must be 'node' or 'python')"
                return 1
                ;;
        esac
    fi
    
    # Interactive runtime selection
    echo ""
    echo -e "${BLUE}╭────────────────────────────────────────╮${NC}"
    echo -e "${BLUE}│     Select Workflow Script Runtime     │${NC}"
    echo -e "${BLUE}╰────────────────────────────────────────╯${NC}"
    echo ""
    
    if $has_node && $has_python; then
        echo "Both Node.js and Python are available:"
        echo ""
        echo "  1) Node.js  (requires: npm, @octokit/rest)"
        echo "  2) Python   (requires: uv or pip, requests)"
        echo ""
        read -p "Enter choice [1-2]: " choice
        
        case "$choice" in
            1) RUNTIME="node" ;;
            2) RUNTIME="python" ;;
            *)
                warn "Invalid choice. Defaulting to Node.js"
                RUNTIME="node"
                ;;
        esac
    elif $has_node; then
        info "Node.js detected - using Node.js runtime"
        RUNTIME="node"
    elif $has_python; then
        info "Python detected - using Python runtime"
        RUNTIME="python"
    else
        error "Neither Node.js nor Python found in PATH"
        echo "Please install one of:"
        echo "  - Node.js: https://nodejs.org/"
        echo "  - Python: https://python.org/"
        return 1
    fi
    
    echo ""
    success "Selected runtime: $RUNTIME"
    return 0
}

# Download file from GitHub if not running locally
download_file() {
    local source_path="$1"
    local dest_path="$2"
    local github_url="https://raw.githubusercontent.com/tazomatalax/context-engineering/main/installer/toolkit/$source_path"
    
    if [[ -f "installer/toolkit/$source_path" ]]; then
        # Running locally, use local file
        cp "installer/toolkit/$source_path" "$dest_path"
    else
        # Download from GitHub
        if command -v curl >/dev/null 2>&1; then
            curl -fsSL "$github_url" -o "$dest_path"
        elif command -v wget >/dev/null 2>&1; then
            wget -q "$github_url" -O "$dest_path"
        else
            error "Neither curl nor wget found. Cannot download files."
            echo "Please install curl or wget, or clone the repository and run locally."
            exit 1
        fi
    fi
}

# Create directory structure
create_directories() {
    info "Creating directory structure..."
    
    mkdir -p .claude/commands
    mkdir -p .github/ISSUE_TEMPLATE
    mkdir -p scripts/generation
    mkdir -p scripts/submission
    mkdir -p PRPs/active
    mkdir -p PRPs/templates
    mkdir -p temp
    
    success "Directories created"
}

# Install core files
install_files() {
    info "Installing Context Engineering files..."
    
    # Claude commands
    download_file ".claude/commands/create-task.md" ".claude/commands/create-task.md"
    download_file ".claude/commands/execute-prp.md" ".claude/commands/execute-prp.md"
    download_file ".claude/commands/refine-task.md" ".claude/commands/refine-task.md"
    download_file ".claude/commands/start-task.md" ".claude/commands/start-task.md"
    download_file ".claude/commands/submit-pr.md" ".claude/commands/submit-pr.md"
    download_file ".claude/commands/validate-execution.md" ".claude/commands/validate-execution.md"
    
    # GitHub templates
    download_file ".github/ISSUE_TEMPLATE/feature-request.yml" ".github/ISSUE_TEMPLATE/feature-request.yml"
    download_file ".github/PULL_REQUEST_TEMPLATE.md" ".github/PULL_REQUEST_TEMPLATE.md"
    
    # PRP templates
    download_file "PRPs/templates/prp_base.md" "PRPs/templates/prp_base.md"
    
    # Runtime-specific scripts
    if [[ "$RUNTIME" == "node" ]]; then
        info "Installing Node.js runtime scripts..."
        download_file "runtimes/node/scripts/post-issue.cjs" "scripts/post-issue.cjs"
        download_file "runtimes/node/scripts/generation/generate-from-issue.cjs" "scripts/generation/generate-from-issue.cjs"
        download_file "runtimes/node/scripts/submission/submit-pr.cjs" "scripts/submission/submit-pr.cjs"
    elif [[ "$RUNTIME" == "python" ]]; then
        info "Installing Python runtime scripts..."
        download_file "runtimes/python/scripts/post_issue.py" "scripts/post_issue.py"
        download_file "runtimes/python/scripts/generation/generate_from_issue.py" "scripts/generation/generate_from_issue.py"
        download_file "runtimes/python/scripts/submission/submit_pr.py" "scripts/submission/submit_pr.py"
        chmod +x scripts/post_issue.py
        chmod +x scripts/generation/generate_from_issue.py
        chmod +x scripts/submission/submit_pr.py
    fi
    
    # Documentation
    download_file "AI_RULES.md" "AI_RULES.md"
    download_file "advanced_tools.md" "advanced_tools.md"
    
    success "Core files installed"
}

# Download validation script
download_validation_script() {
    info "Installing validation script..."
    download_file "validate.sh" "validate.sh"
    chmod +x validate.sh
    success "Validation script installed"
}

# Create environment template
create_env_template() {
    info "Creating environment template..."
    
    if [[ ! -f ".env.example" ]]; then
        cat > .env.example << 'EOF'
# Context Engineering Environment Variables
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_REPO=owner/repo-name
EOF
    else
        # Append to existing .env.example if Context Engineering section doesn't exist
        if ! grep -q "Context Engineering" .env.example; then
            echo "" >> .env.example
            echo "# Context Engineering Environment Variables" >> .env.example
            echo "GITHUB_TOKEN=your_personal_access_token_here" >> .env.example
            echo "GITHUB_REPO=owner/repo-name" >> .env.example
        fi
    fi
    
    success "Environment template created"
}

# Main installation function
main() {
    echo -e "${BLUE}"
    echo "  ╭─────────────────────────────────────────╮"
    echo "  │   Context Engineering Universal Setup   │"
    echo "  ╰─────────────────────────────────────────╯"
    echo -e "${NC}"
    
    PROJECT_ROOT=$(detect_project_root)
    
    info "Installing in: $PROJECT_ROOT"
    
    check_git_repo "$PROJECT_ROOT"
    cd "$PROJECT_ROOT"
    
    # Detect and select runtime
    detect_runtime || exit 1
    
    create_directories
    install_files
    download_validation_script
    create_env_template
    
    echo ""
    success "Context Engineering installed successfully!"
    echo ""
    warn "--- ACTION REQUIRED: Configuration ---"
    echo "1. Configure environment:"
    echo "   cp .env.example .env"
    echo "   # Edit .env with your GitHub credentials"
    echo ""
    
    if [[ "$RUNTIME" == "node" ]]; then
        echo "2. Install Node.js dependencies:"
        echo "   npm install @octokit/rest dotenv"
        echo ""
        echo "3. Usage examples:"
        echo "   node scripts/post-issue.cjs temp/draft.md"
        echo "   node scripts/generation/generate-from-issue.cjs 123"
        echo "   node scripts/submission/submit-pr.cjs --issue=123"
    elif [[ "$RUNTIME" == "python" ]]; then
        echo "2. Install Python dependencies:"
        echo "   uv pip install requests"
        echo "   # Or: pip install requests"
        echo ""
        echo "3. Usage examples:"
        echo "   uv run scripts/post_issue.py temp/draft.md"
        echo "   uv run scripts/generation/generate_from_issue.py 123"
        echo "   uv run scripts/submission/submit_pr.py --issue=123"
    fi
    
    echo ""
    echo "4. Configure validate.sh for your project type"
    echo ""
    info "Installation complete! You can now use /create-task in Claude Code"
    echo -e "${GRAY}To uninstall: rm -rf .claude PRPs scripts validate.sh AI_RULES.md advanced_tools.md .env${NC}"
}

# Handle help and uninstall flags
case "${1:-}" in
    --help|-h)
        echo "Context Engineering Universal Installer"
        echo ""
        echo "Usage:"
        echo "  ./install.sh          Install the toolkit"  
        echo "  ./install.sh --help   Show this help"
        echo ""
        echo "Requirements:"
        echo "  - Git repository"
        echo "  - curl or wget (for remote installation)"
        echo "  - jq (for GitHub API calls)"
        echo ""
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac