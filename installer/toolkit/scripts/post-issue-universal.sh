#!/bin/bash

# Universal GitHub Issue Poster - Context Engineering
# 
# This script provides multiple fallback methods for posting GitHub issues
# without requiring Node.js dependencies that might fail.
#
# USAGE:
#   ./scripts/post-issue-universal.sh <task-draft-file>
#   bash scripts/post-issue-universal.sh temp/task-draft-20250108.md
#
# FALLBACK CHAIN:
#   1. GitHub CLI (gh) - Most reliable, pre-installed on many systems
#   2. curl + GitHub API - Works anywhere with curl
#   3. Manual instructions - Always works
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

# Check arguments
if [ $# -ne 1 ]; then
    error "Usage: $0 <task-draft-file>"
    echo "Example: $0 temp/task-draft-20250108.md"
    exit 1
fi

TASK_FILE="$1"

# Validate task file exists
if [ ! -f "$TASK_FILE" ]; then
    error "Task draft file not found: $TASK_FILE"
    exit 1
fi

info "Reading task draft: $TASK_FILE"

# Parse markdown file to extract title and body
parse_markdown() {
    local file="$1"
    local title=""
    local body=""
    local found_title=false
    
    while IFS= read -r line; do
        # Look for first # heading as title
        if [ "$found_title" = false ] && [[ "$line" =~ ^#[[:space:]] ]]; then
            title="${line#\# }"
            found_title=true
            continue
        fi
        
        # Everything else goes in body (after finding title)
        if [ "$found_title" = true ] || [ -n "$(echo "$line" | tr -d '[:space:]')" ]; then
            body="$body$line"$'\n'
        fi
    done < "$file"
    
    # Fallback title if none found
    if [ -z "$title" ]; then
        title="$(basename "$file" .md | sed 's/task-draft-/Feature Request: /' | sed 's/-/ /g')"
    fi
    
    # Export for use by calling functions
    ISSUE_TITLE="$title"
    ISSUE_BODY="$(echo "$body" | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$//')"
}

# Method 1: GitHub CLI (preferred)
try_github_cli() {
    if ! command -v gh >/dev/null 2>&1; then
        warn "GitHub CLI (gh) not found"
        return 1
    fi
    
    info "Using GitHub CLI to create issue..."
    
    # Check if gh is authenticated
    if ! gh auth status >/dev/null 2>&1; then
        warn "GitHub CLI not authenticated. Run: gh auth login"
        return 1
    fi
    
    # Create the issue
    local issue_url
    issue_url=$(gh issue create \
        --title "$ISSUE_TITLE" \
        --body "$ISSUE_BODY" \
        --label "context-engineering,feature-request" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$issue_url" ]; then
        success "Issue created successfully!"
        echo "🔗 URL: $issue_url"
        
        # Extract issue number from URL
        local issue_number
        issue_number=$(echo "$issue_url" | grep -o '[0-9]*$')
        
        if [ -n "$issue_number" ]; then
            echo "📊 Issue #$issue_number"
            echo ""
            echo "Next steps:"
            echo "   /start-task --issue=$issue_number"
            
            # Generate PRP filename
            local prp_name
            prp_name=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
            echo "   /execute-prp PRPs/active/$issue_number-$prp_name.md"
        fi
        
        # Clean up task file
        info "Cleaning up: $TASK_FILE"
        rm -f "$TASK_FILE"
        
        return 0
    else
        warn "GitHub CLI failed to create issue"
        return 1
    fi
}

# Method 2: curl + GitHub API
try_curl_api() {
    if ! command -v curl >/dev/null 2>&1; then
        warn "curl not found"
        return 1
    fi
    
    # Try to find GitHub token from environment or .env
    local github_token=""
    local github_repo=""
    
    # Check environment variables
    if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_REPO" ]; then
        github_token="$GITHUB_TOKEN"
        github_repo="$GITHUB_REPO"
    else
        # Try to load from .env file
        local env_file=".env"
        if [ -f "$env_file" ]; then
            # Source .env file safely
            while IFS='=' read -r key value; do
                # Skip comments and empty lines
                [[ $key =~ ^[[:space:]]*# ]] && continue
                [[ -z "$key" ]] && continue
                
                # Remove quotes from value
                value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
                
                case "$key" in
                    "GITHUB_TOKEN") github_token="$value" ;;
                    "GITHUB_REPO") github_repo="$value" ;;
                esac
            done < "$env_file"
        fi
    fi
    
    if [ -z "$github_token" ] || [ -z "$github_repo" ]; then
        warn "GitHub token or repo not configured"
        echo "Set GITHUB_TOKEN and GITHUB_REPO in .env file or environment"
        return 1
    fi
    
    info "Using curl + GitHub API to create issue..."
    
    # Parse owner/repo
    local repo_owner repo_name
    repo_owner=$(echo "$github_repo" | cut -d'/' -f1)
    repo_name=$(echo "$github_repo" | cut -d'/' -f2)
    
    # Escape JSON content
    local json_title json_body
    json_title=$(echo "$ISSUE_TITLE" | sed 's/"/\\"/g')
    json_body=$(echo "$ISSUE_BODY" | sed 's/"/\\"/g' | sed 's/\n/\\n/g')
    
    # Create JSON payload
    local json_payload
    json_payload=$(cat <<EOF
{
  "title": "$json_title",
  "body": "$json_body",
  "labels": ["context-engineering", "feature-request"]
}
EOF
)
    
    # Make API call
    local response
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: token $github_token" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        "https://api.github.com/repos/$repo_owner/$repo_name/issues")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" -eq 201 ]; then
        success "Issue created successfully!"
        
        # Extract URL and number from response
        local issue_url issue_number
        issue_url=$(echo "$body" | grep -o '"html_url": *"[^"]*"' | cut -d'"' -f4)
        issue_number=$(echo "$body" | grep -o '"number": *[0-9]*' | grep -o '[0-9]*')
        
        echo "🔗 URL: $issue_url"
        echo "📊 Issue #$issue_number"
        echo ""
        echo "Next steps:"
        echo "   /start-task --issue=$issue_number"
        
        # Clean up task file
        info "Cleaning up: $TASK_FILE"
        rm -f "$TASK_FILE"
        
        return 0
    else
        warn "GitHub API request failed (HTTP $http_code)"
        if [ "$http_code" -eq 401 ]; then
            echo "Check your GITHUB_TOKEN - it may be invalid or expired"
        elif [ "$http_code" -eq 404 ]; then
            echo "Repository $github_repo not found or no access"
        fi
        return 1
    fi
}

# Method 3: Manual fallback
manual_fallback() {
    warn "Automated methods failed. Manual process required."
    echo ""
    echo "📋 Manual GitHub Issue Creation:"
    echo ""
    echo "1. Go to your GitHub repository's Issues page"
    echo "2. Click 'New Issue'"
    echo "3. Use this information:"
    echo ""
    echo "Title:"
    echo "   $ISSUE_TITLE"
    echo ""
    echo "Body:"
    echo "---"
    echo "$ISSUE_BODY"
    echo "---"
    echo ""
    echo "Labels: context-engineering, feature-request"
    echo ""
    echo "4. After creating the issue, note the issue number"
    echo "5. Run: /start-task --issue=<number>"
    echo ""
    
    # Don't delete the file in manual mode - user might need it
    info "Task file preserved: $TASK_FILE"
    info "(Delete it manually after creating the issue)"
}

# Main execution
main() {
    info "Context Engineering - Universal Issue Poster"
    
    # Parse the markdown file
    parse_markdown "$TASK_FILE"
    
    info "Title: $ISSUE_TITLE"
    
    # Try methods in order of preference
    if try_github_cli; then
        success "Issue posted via GitHub CLI"
    elif try_curl_api; then
        success "Issue posted via GitHub API"
    else
        manual_fallback
    fi
}

# Run main function
main "$@"