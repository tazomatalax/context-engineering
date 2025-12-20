<#
.SYNOPSIS
    Sets up a minimal AI-ready project structure.
.DESCRIPTION
    Creates a new project directory with a minimal set of configuration files
    for AI development, including a clean AGENTS.md and an empty mcp.json.
    It does NOT install any specific MCP servers or agents by default.
.PARAMETER ProjectName
    The name of the project (and directory) to create. Defaults to "NewAIProject".
.EXAMPLE
    .\setup.ps1 -ProjectName "MyAwesomeApp"
#>

param (
    [string]$ProjectName = "NewAIProject"
)

$ErrorActionPreference = "Stop"

# Determine target directory
$TargetDir = Join-Path $PWD $ProjectName

# Create project directory
if (Test-Path $TargetDir) {
    Write-Warning "Directory '$TargetDir' already exists."
} else {
    New-Item -ItemType Directory -Path $TargetDir | Out-Null
    Write-Host "Created directory: $TargetDir" -ForegroundColor Green
}

# 1. Create .vscode directory and minimal mcp.json
$VSCodeDir = Join-Path $TargetDir ".vscode"
if (-not (Test-Path $VSCodeDir)) {
    New-Item -ItemType Directory -Path $VSCodeDir | Out-Null
}

$McpJsonContent = @{
    servers = @{}
} | ConvertTo-Json -Depth 2

Set-Content -Path (Join-Path $VSCodeDir "mcp.json") -Value $McpJsonContent
Write-Host "Created .vscode/mcp.json (Empty configuration)" -ForegroundColor Gray

# 2. Create AGENTS.md (Minimal Rules)
$AgentsMdContent = @"
# AI Project Rules

### 🔄 Project Awareness & Context
- **Read the README.md** to understand the project structure and purpose.
- **Use consistent naming conventions, file structure, and architecture patterns.**

### 🧱 Code Structure & Modularity
- **Keep files focused and small.**
- **Organize code into clearly separated modules.**
- **Use clear, consistent imports.**

### 🧪 Testing & Reliability
- **Create tests for new features.**
- **Ensure tests pass before considering a task complete.**

### 📚 Documentation & Explainability
- **Update \`README.md\`** when new features are added.
- **Comment non-obvious code.**

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions.**
- **Always confirm file paths and module names exist before referencing them.**
"@

Set-Content -Path (Join-Path $TargetDir "AGENTS.md") -Value $AgentsMdContent
Write-Host "Created AGENTS.md" -ForegroundColor Gray

# 3. Create README.md
$ReadmeContent = @"
# $ProjectName

A new project initialized with the minimal AI template.

## 🚀 Getting Started

1.  **Configure AI**: Check \`AGENTS.md\` for AI behavior rules.
2.  **Setup Tools**: Configure \`.vscode/mcp.json\` if you need specific MCP servers.

## 📂 Structure

- \`.vscode/mcp.json\`: MCP Server configuration.
- \`AGENTS.md\`: Rules for AI assistants.
"@

Set-Content -Path (Join-Path $TargetDir "README.md") -Value $ReadmeContent
Write-Host "Created README.md" -ForegroundColor Gray

# 4. Create .gitignore
$GitIgnoreContent = @"
# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
!.vscode/mcp.json

# Node
node_modules/
dist/
npm-debug.log

# Python
__pycache__/
*.py[cod]
venv/
.env
"@

Set-Content -Path (Join-Path $TargetDir ".gitignore") -Value $GitIgnoreContent
Write-Host "Created .gitignore" -ForegroundColor Gray

Write-Host "`nSuccessfully initialized minimal project in: $TargetDir" -ForegroundColor Green
Write-Host "To start working:"
Write-Host "  cd $ProjectName"
Write-Host "  code ."
