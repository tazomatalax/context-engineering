#!/bin/bash
#
# Context Engineering Smart Validation Script
# 
# Auto-detects project type and runs appropriate validation commands.
# Customize the commands in the CUSTOM COMMANDS section below.
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${BLUE}🔍 $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${BLUE}Context Engineering Validation${NC}"
echo "=============================="

# --- AUTO-DETECTION ---
DETECTED_TYPE=""
HAS_CUSTOM_COMMANDS=false

# Detect project type
if [[ -f "package.json" ]]; then
    DETECTED_TYPE="Node.js/JavaScript"
    info "Detected: $DETECTED_TYPE project"
elif [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]]; then
    DETECTED_TYPE="Python" 
    info "Detected: $DETECTED_TYPE project"
elif [[ -f "go.mod" ]]; then
    DETECTED_TYPE="Go"
    info "Detected: $DETECTED_TYPE project"
elif [[ -f "Cargo.toml" ]]; then
    DETECTED_TYPE="Rust"
    info "Detected: $DETECTED_TYPE project"
else
    DETECTED_TYPE="Generic"
    info "No specific project type detected"
fi

# --- CUSTOM COMMANDS SECTION ---
# Add your project-specific commands here by setting HAS_CUSTOM_COMMANDS=true
# and adding your commands between the markers below.

# HAS_CUSTOM_COMMANDS=true
# Example:
# info "Running custom lint..."
# npm run lint
# info "Running custom tests..."
# npm test

# --- END CUSTOM COMMANDS ---

# --- AUTO-DETECTED COMMANDS ---
if [[ "$HAS_CUSTOM_COMMANDS" == "false" ]]; then
    case "$DETECTED_TYPE" in
        "Node.js/JavaScript")
            info "Running Node.js/JavaScript validation..."
            
            if [[ -f "package.json" ]] && grep -q '"lint"' package.json; then
                info "Running npm run lint..."
                npm run lint
            fi
            
            if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
                info "Running npm test..."
                npm test
            fi
            
            if [[ -f "package.json" ]] && grep -q '"build"' package.json; then
                info "Running npm run build..."
                npm run build
            fi
            ;;
            
        "Python")
            info "Running Python validation..."
            
            if command -v ruff >/dev/null 2>&1; then
                info "Running ruff check..."
                ruff check .
            elif command -v flake8 >/dev/null 2>&1; then
                info "Running flake8..."
                flake8 .
            fi
            
            if command -v pytest >/dev/null 2>&1; then
                info "Running pytest..."
                pytest
            elif [[ -f "test_*.py" ]] || [[ -f "*_test.py" ]]; then
                info "Running python -m unittest..."
                python -m unittest discover
            fi
            ;;
            
        "Go")
            info "Running Go validation..."
            
            info "Running go fmt..."
            go fmt ./...
            
            info "Running go vet..."
            go vet ./...
            
            if [[ -d "." ]]; then
                info "Running go test..."
                go test ./...
            fi
            ;;
            
        "Rust")
            info "Running Rust validation..."
            
            info "Running cargo fmt --check..."
            cargo fmt --check
            
            info "Running cargo clippy..."
            cargo clippy -- -D warnings
            
            info "Running cargo test..."
            cargo test
            ;;
            
        "Generic")
            warn "No project type detected. Please customize this script."
            echo ""
            echo "To customize:"
            echo "1. Edit validate.sh"
            echo "2. Set HAS_CUSTOM_COMMANDS=true"
            echo "3. Add your validation commands in the CUSTOM COMMANDS section"
            echo ""
            echo "Example:"
            echo "  HAS_CUSTOM_COMMANDS=true"
            echo "  info \"Running my tests...\""
            echo "  ./run-tests.sh"
            ;;
    esac
fi

success "Validation completed!"
exit 0