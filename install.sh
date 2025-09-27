#!/bin/bash
#
# Context Engineering Universal Installer
# Supports both UV (Python) and NPM installation methods
#
# USAGE:
#   curl -fsSL https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.sh | bash
#   # OR clone and run locally:
#   git clone https://github.com/tazomatalax/context-engineering.git
#   cd context-engineering && ./install.sh
#
# OPTIONS:
#   --python    Force Python/UV installation (default if UV available)
#   --npm       Force NPM installation (fallback)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}🚀 $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Detect installation method
detect_installation_method() {
    local force_python="$1"
    local force_npm="$2"

    if [[ "$force_python" == "true" ]]; then
        echo "true"
        return
    fi

    if [[ "$force_npm" == "true" ]]; then
        echo "false"
        return
    fi

    # Auto-detect: prefer UV if available, fallback to NPM
    if command -v uv >/dev/null 2>&1; then
        echo "true"
    else
        echo "false"
    fi
}

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
    
    # Scripts (detect installation method and install appropriate versions)
    if [[ "$USE_PYTHON" == "true" ]]; then
        download_file "scripts/generation/generate-from-issue.py" "scripts/generation/generate-from-issue.py"
        download_file "scripts/post-issue.py" "scripts/post-issue.py"
        download_file "scripts/submission/submit-pr.py" "scripts/submission/submit-pr.py"
        chmod +x scripts/generation/generate-from-issue.py
        chmod +x scripts/post-issue.py
        chmod +x scripts/submission/submit-pr.py
    else
        download_file "scripts/generation/generate-from-issue.cjs" "scripts/generation/generate-from-issue.cjs"
        download_file "scripts/post-issue.cjs" "scripts/post-issue.cjs"
        download_file "scripts/submission/submit-pr.cjs" "scripts/submission/submit-pr.cjs"
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
    local force_python="false"
    local force_npm="false"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --python)
                force_python="true"
                shift
                ;;
            --npm)
                force_npm="true"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    # Detect installation method
    USE_PYTHON=$(detect_installation_method "$force_python" "$force_npm")

    echo -e "${BLUE}"
    echo "  ╭─────────────────────────────────────────╮"
    echo "  │   Context Engineering Universal Setup   │"
    echo "  ╰─────────────────────────────────────────╯"
    echo -e "${NC}"

    if [[ "$USE_PYTHON" == "true" ]]; then
        info "Using Python/UV installation method"
    else
        info "Using NPM/Node.js installation method"
    fi

    PROJECT_ROOT=$(detect_project_root)
    
    info "Installing in: $PROJECT_ROOT"
    
    check_git_repo "$PROJECT_ROOT"
    cd "$PROJECT_ROOT"
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
    echo "2. For GitHub integration (optional), install script dependencies:"
    if [[ "$USE_PYTHON" == "true" ]]; then
        echo "   uv add requests python-dotenv rich click"
        echo "   # OR with pip: pip install requests python-dotenv rich click"
    else
        echo "   npm install @octokit/rest@19.0.13 dotenv"
    fi
    echo ""
    echo "3. Configure validate.sh for your project type"
    echo ""
    info "Installation complete! You can now use /create-task in Claude Code"
    echo -e "${GRAY}To uninstall: rm -rf .claude PRPs scripts/generation scripts/submission validate.sh AI_RULES.md advanced_tools.md${NC}"
}

# Handle help and uninstall flags
case "${1:-}" in
    --help|-h)
        echo "Context Engineering Universal Installer"
        echo ""
        echo "Usage:"
        echo "  ./install.sh              Install with auto-detection (UV preferred)"
        echo "  ./install.sh --python     Force Python/UV installation"
        echo "  ./install.sh --npm        Force NPM/Node.js installation"
        echo "  ./install.sh --help       Show this help"
        echo ""
        echo "Installation Methods:"
        echo "  Python/UV (default):      Fast, modern Python package manager"
        echo "  NPM/Node.js (fallback):   Traditional Node.js dependency"
        echo ""
        echo "Requirements:"
        echo "  - Git repository"
        echo "  - curl or wget (for remote installation)"
        echo "  For Python method: uv or pip"
        echo "  For NPM method: Node.js and npm"
        echo ""
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac