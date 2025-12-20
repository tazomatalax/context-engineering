#!/bin/bash

# Context Engineering Universal Installer
# This script detects the environment and uses the best available method to run the CLI.

set -e

echo "🚀 Context Engineering Installer"

# Check for UV
if command -v uvx >/dev/null 2>&1; then
    echo "📦 Using UV to run the installer..."
    uvx --from git+https://github.com/tazomatalax/context-engineering context-cli "$@"
    exit 0
fi

# Check for Node/NPX
if command -v npx >/dev/null 2>&1; then
    echo "📦 Using NPX to run the installer..."
    npx context-engineering-installer "$@"
    exit 0
fi

echo "❌ Error: Neither 'uv' nor 'npx' was found."
echo "Please install Node.js (https://nodejs.org/) or UV (https://github.com/astral-sh/uv)."
exit 1
