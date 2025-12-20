
function Get-ContextHome {
    if ($env:CONTEXT_ENGINEERING_HOME) {
        return $env:CONTEXT_ENGINEERING_HOME
    }
    # Fallback: If module is imported from the repo, try to find root
    $ModulePath = $PSScriptRoot
    # Assuming powershell/ContextManager/ContextManager.psm1 -> ../../
    $RepoRoot = Resolve-Path (Join-Path $ModulePath "..\..")
    if (Test-Path (Join-Path $RepoRoot "AGENTS.md")) {
        return $RepoRoot.Path
    }
    Throw "CONTEXT_ENGINEERING_HOME environment variable is not set and could not be inferred."
}

function Get-ContextItem {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$false)]
        [ValidateSet("Skill", "Agent", "Command", "MCP")]
        [string]$Type
    )

    $HomeDir = Get-ContextHome
    $Results = @()

    # Skills
    if (-not $Type -or $Type -eq "Skill") {
        $Path = Join-Path $HomeDir ".github\skills"
        if (Test-Path $Path) {
            Get-ChildItem $Path | ForEach-Object {
                $Results += [PSCustomObject]@{ Type = "Skill"; Name = $_.Name; Path = $_.FullName }
            }
        }
    }

    # Agents
    if (-not $Type -or $Type -eq "Agent") {
        $Path = Join-Path $HomeDir ".github\agents"
        if (Test-Path $Path) {
            Get-ChildItem $Path | ForEach-Object {
                $Results += [PSCustomObject]@{ Type = "Agent"; Name = $_.Name; Path = $_.FullName }
            }
        }
    }

    # Commands
    if (-not $Type -or $Type -eq "Command") {
        $Path = Join-Path $HomeDir ".github\commands"
        if (Test-Path $Path) {
            Get-ChildItem $Path | ForEach-Object {
                $Results += [PSCustomObject]@{ Type = "Command"; Name = $_.Name; Path = $_.FullName }
            }
        }
    }

    # MCPs
    if (-not $Type -or $Type -eq "MCP") {
        $McpPath = Join-Path $HomeDir ".vscode\mcp.json"
        if (Test-Path $McpPath) {
            try {
                $Json = Get-Content $McpPath -Raw | ConvertFrom-Json
                if ($Json.servers) {
                    $Json.servers.PSObject.Properties | ForEach-Object {
                        $Results += [PSCustomObject]@{ Type = "MCP"; Name = $_.Name; Path = $McpPath; Config = $_.Value }
                    }
                }
            } catch {
                Write-Warning "Failed to parse MCP config at $McpPath"
            }
        }
    }

    return $Results
}

function Install-ContextItem {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [ValidateSet("Skill", "Agent", "Command", "MCP")]
        [string]$Type,

        [Parameter(Mandatory=$true)]
        [string]$Name,

        [Parameter(Mandatory=$false)]
        [string]$Target = "."
    )

    $HomeDir = Get-ContextHome
    $Target = Resolve-Path $Target

    if ($Type -eq "MCP") {
        Install-ContextMcp -Name $Name -Target $Target -HomeDir $HomeDir
    } else {
        Install-ContextFile -Type $Type -Name $Name -Target $Target -HomeDir $HomeDir
    }
}

function Install-ContextFile {
    param ($Type, $Name, $Target, $HomeDir)

    $SourceSubDir = switch ($Type) {
        "Skill" { ".github\skills" }
        "Agent" { ".github\agents" }
        "Command" { ".github\commands" }
    }

    $SourcePath = Join-Path $HomeDir $SourceSubDir
    $SourceItem = Join-Path $SourcePath $Name

    if (-not (Test-Path $SourceItem)) {
        Write-Error "$Type '$Name' not found in $SourcePath"
        return
    }

    $TargetSubDir = Join-Path $Target $SourceSubDir
    if (-not (Test-Path $TargetSubDir)) {
        New-Item -ItemType Directory -Path $TargetSubDir -Force | Out-Null
    }

    $TargetItem = Join-Path $TargetSubDir $Name
    Copy-Item -Path $SourceItem -Destination $TargetItem -Recurse -Force
    Write-Host "Installed $Type '$Name' to $TargetItem" -ForegroundColor Green
}

function Install-ContextMcp {
    param ($Name, $Target, $HomeDir)

    $SourceMcpPath = Join-Path $HomeDir ".vscode\mcp.json"
    $TargetMcpPath = Join-Path $Target ".vscode\mcp.json"

    # Read Source
    $SourceJson = Get-Content $SourceMcpPath -Raw | ConvertFrom-Json
    if (-not $SourceJson.servers.$Name) {
        Write-Error "MCP Server '$Name' not found in source configuration."
        return
    }
    $ServerConfig = $SourceJson.servers.$Name

    # Prepare Target
    $TargetVscode = Join-Path $Target ".vscode"
    if (-not (Test-Path $TargetVscode)) {
        New-Item -ItemType Directory -Path $TargetVscode -Force | Out-Null
    }

    $TargetJson = @{ servers = @{} }
    if (Test-Path $TargetMcpPath) {
        try {
            $TargetJson = Get-Content $TargetMcpPath -Raw | ConvertFrom-Json
            # Ensure servers object exists (ConvertFrom-Json might return object without it if empty)
            if (-not $TargetJson.servers) {
                $TargetJson | Add-Member -MemberType NoteProperty -Name "servers" -Value @{}
            }
        } catch {
            Write-Warning "Could not parse existing mcp.json, creating new one."
        }
    }

    # Add/Update Server
    # Note: PowerShell's handling of dynamic objects can be tricky.
    # We use a hashtable for manipulation if possible, or PSObject.
    
    # Convert to hashtable for easier manipulation if it's a PSCustomObject
    # But simpler: just add the property to the PSObject
    
    if ($TargetJson.servers.PSObject.Properties.Match($Name).Count -gt 0) {
        Write-Warning "MCP Server '$Name' already exists in target. Overwriting."
        $TargetJson.servers.$Name = $ServerConfig
    } else {
        $TargetJson.servers | Add-Member -MemberType NoteProperty -Name $Name -Value $ServerConfig
    }

    $TargetJson | ConvertTo-Json -Depth 10 | Set-Content -Path $TargetMcpPath
    Write-Host "Installed MCP Server '$Name' to $TargetMcpPath" -ForegroundColor Green
}

function Initialize-ContextProject {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [string]$ProjectName
    )
    
    $TargetDir = Join-Path $PWD $ProjectName
    if (Test-Path $TargetDir) {
        Write-Warning "Directory '$TargetDir' already exists."
    } else {
        New-Item -ItemType Directory -Path $TargetDir | Out-Null
        Write-Host "Created directory: $TargetDir" -ForegroundColor Green
    }

    # Create minimal structure
    $VSCodeDir = Join-Path $TargetDir ".vscode"
    New-Item -ItemType Directory -Path $VSCodeDir -Force | Out-Null
    
    @{ servers = @{} } | ConvertTo-Json | Set-Content (Join-Path $VSCodeDir "mcp.json")
    
    # Copy AGENTS.md from source if available, else create minimal
    $HomeDir = Get-ContextHome
    $SourceAgents = Join-Path $HomeDir "AGENTS.md"
    if (Test-Path $SourceAgents) {
        Copy-Item $SourceAgents (Join-Path $TargetDir "AGENTS.md")
    } else {
        Set-Content (Join-Path $TargetDir "AGENTS.md") -Value "# AI Rules"
    }
    
    Set-Content (Join-Path $TargetDir "README.md") -Value "# $ProjectName`n`nInitialized with ContextCLI."
    
    Write-Host "Project initialized. Use 'Install-ContextItem' to add features." -ForegroundColor Green
}

Export-ModuleMember -Function Install-ContextItem, Get-ContextItem, Initialize-ContextProject
