
$ErrorActionPreference = "Stop"

# 1. Determine Source and Destination
$RepoRoot = $PSScriptRoot
$ModuleSource = Join-Path $RepoRoot "powershell\ContextManager"

# User's module path
$Docs = [Environment]::GetFolderPath("MyDocuments")
# Check for PowerShell Core vs Windows PowerShell
if ($PSVersionTable.PSVersion.Major -ge 6) {
    $ModulePath = Join-Path $Docs "PowerShell\Modules"
} else {
    $ModulePath = Join-Path $Docs "WindowsPowerShell\Modules"
}

# Ensure directory exists
if (-not (Test-Path $ModulePath)) {
    New-Item -ItemType Directory -Path $ModulePath -Force | Out-Null
}

$DestDir = Join-Path $ModulePath "ContextManager"

Write-Host "Installing ContextManager module to: $DestDir"

# 2. Copy Files
if (-not (Test-Path $DestDir)) {
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
}

Copy-Item -Path (Join-Path $ModuleSource "*") -Destination $DestDir -Force

# 3. Set Environment Variable (Persistent)
Write-Host "Setting CONTEXT_ENGINEERING_HOME to: $RepoRoot"
[Environment]::SetEnvironmentVariable("CONTEXT_ENGINEERING_HOME", $RepoRoot, "User")

# 4. Import Module (Current Session)
$env:CONTEXT_ENGINEERING_HOME = $RepoRoot
Import-Module $DestDir\ContextManager.psd1 -Force

Write-Host "`nInstallation Complete!" -ForegroundColor Green
Write-Host "You can now use the following commands in any new PowerShell window:"
Write-Host "  Get-ContextItem"
Write-Host "  Install-ContextItem"
Write-Host "  Initialize-ContextProject"
Write-Host "`nTry running: Get-ContextItem"
