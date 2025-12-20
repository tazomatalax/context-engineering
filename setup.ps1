# Context Engineering Installer - PowerShell Entry Point
# This script detects the best available tool (uvx or npx) to run the interactive installer.

function Run-Installer {
    # 1. Try uvx (Python/UV) - Fastest and most isolated
    if (Get-Command uvx -ErrorAction SilentlyContinue) {
        Write-Host "🚀 Launching Context Engineering Installer via uvx..." -ForegroundColor Cyan
        uvx context-engineering-installer
        return
    }

    # 2. Try npx (Node.js) - Standard for JS/TS
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Host "📦 Launching Context Engineering Installer via npx..." -ForegroundColor Cyan
        npx context-engineering-installer
        return
    }

    # 3. Fallback: Error
    Write-Error "Neither 'uv' nor 'npm' (Node.js) was found on your system."
    Write-Host "Please install one of the following to continue:" -ForegroundColor Yellow
    Write-Host "  - UV (Python): https://github.com/astral-sh/uv"
    Write-Host "  - Node.js: https://nodejs.org/"
    exit 1
}

Run-Installer
