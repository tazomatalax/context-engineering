@echo off
setlocal enabledelayedexpansion

REM Universal GitHub Issue Poster - Context Engineering (Windows)
REM 
REM This script provides multiple fallback methods for posting GitHub issues
REM without requiring Node.js dependencies that might fail.
REM
REM USAGE:
REM   scripts\post-issue-universal.bat <task-draft-file>
REM
REM FALLBACK CHAIN:
REM   1. GitHub CLI (gh) - Most reliable, pre-installed on many systems
REM   2. PowerShell + GitHub API - Works on all Windows systems
REM   3. Manual instructions - Always works

if "%~1"=="" (
    echo ❌ Usage: %0 ^<task-draft-file^>
    echo Example: %0 temp\task-draft-20250108.md
    exit /b 1
)

set "TASK_FILE=%~1"

REM Validate task file exists
if not exist "%TASK_FILE%" (
    echo ❌ Task draft file not found: %TASK_FILE%
    exit /b 1
)

echo 🚀 Reading task draft: %TASK_FILE%

REM Try GitHub CLI first
where gh >nul 2>&1
if %errorlevel%==0 (
    echo 🚀 Using GitHub CLI to create issue...
    
    REM Check if gh is authenticated
    gh auth status >nul 2>&1
    if !errorlevel!==0 (
        REM Read the file to extract title and body
        set "title="
        set "body="
        set "found_title=false"
        
        for /f "usebackq delims=" %%a in ("%TASK_FILE%") do (
            set "line=%%a"
            if "!found_title!"=="false" (
                if "!line:~0,2!"=="# " (
                    set "title=!line:~2!"
                    set "found_title=true"
                ) else (
                    if not "!line!"=="" set "body=!body!!line!\n"
                )
            ) else (
                set "body=!body!!line!\n"
            )
        )
        
        REM Create issue using GitHub CLI
        for /f "usebackq delims=" %%i in (`gh issue create --title "!title!" --body "!body!" --label "context-engineering,feature-request" 2^>nul`) do (
            set "issue_url=%%i"
        )
        
        if defined issue_url (
            echo ✅ Issue created successfully!
            echo 🔗 URL: !issue_url!
            
            REM Extract issue number from URL
            for /f "tokens=* delims=/" %%a in ("!issue_url!") do set "temp=%%a"
            for %%a in (!issue_url!) do set "issue_number=%%~na"
            
            echo 📊 Issue #!issue_number!
            echo.
            echo Next steps:
            echo    /start-task --issue=!issue_number!
            
            REM Clean up task file
            echo 🧹 Cleaning up: %TASK_FILE%
            del "%TASK_FILE%" >nul 2>&1
            
            exit /b 0
        ) else (
            echo ⚠️ GitHub CLI failed to create issue
        )
    ) else (
        echo ⚠️ GitHub CLI not authenticated. Run: gh auth login
    )
) else (
    echo ⚠️ GitHub CLI (gh) not found
)

REM Fallback to PowerShell + GitHub API
echo 🚀 Trying PowerShell + GitHub API...

REM Check for .env file to get GitHub credentials
set "github_token="
set "github_repo="

if exist ".env" (
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if /i "%%a"=="GITHUB_TOKEN" set "github_token=%%b"
        if /i "%%a"=="GITHUB_REPO" set "github_repo=%%b"
    )
)

REM Check environment variables as fallback
if not defined github_token set "github_token=%GITHUB_TOKEN%"
if not defined github_repo set "github_repo=%GITHUB_REPO%"

if defined github_token if defined github_repo (
    echo 🚀 Using PowerShell + GitHub API...
    
    REM Create a temporary PowerShell script
    set "ps_script=%temp%\github_issue.ps1"
    
    (
        echo $ErrorActionPreference = 'Stop'
        echo try {
        echo     $content = Get-Content -Path '%TASK_FILE%' -Raw
        echo     $lines = $content -split "`n"
        echo     $title = ""
        echo     $body = ""
        echo     $foundTitle = $false
        echo     foreach ($line in $lines^) {
        echo         if (-not $foundTitle -and $line.StartsWith("# "^)^) {
        echo             $title = $line.Substring(2^).Trim(^)
        echo             $foundTitle = $true
        echo         } elseif ($foundTitle -or $line.Trim(^) -ne ""^) {
        echo             $body += $line + "`n"
        echo         }
        echo     }
        echo     if (-not $title^) {
        echo         $title = [System.IO.Path]::GetFileNameWithoutExtension('%TASK_FILE%'^).Replace('task-draft-', 'Feature Request: '^).Replace('-', ' '^)
        echo     }
        echo     $payload = @{
        echo         title = $title
        echo         body = $body.TrimEnd(^)
        echo         labels = @("context-engineering", "feature-request"^)
        echo     } ^| ConvertTo-Json -Depth 10
        echo     $headers = @{
        echo         'Authorization' = "token %github_token%"
        echo         'Accept' = 'application/vnd.github.v3+json'
        echo         'Content-Type' = 'application/json'
        echo     }
        echo     $repoInfo = "%github_repo%".Split('/'^^)
        echo     $owner = $repoInfo[0]
        echo     $repo = $repoInfo[1]
        echo     $uri = "https://api.github.com/repos/$owner/$repo/issues"
        echo     $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $payload
        echo     Write-Host "✅ Issue created successfully!"
        echo     Write-Host "🔗 URL: $($response.html_url^)"
        echo     Write-Host "📊 Issue #$($response.number^)"
        echo     Write-Host ""
        echo     Write-Host "Next steps:"
        echo     Write-Host "   /start-task --issue=$($response.number^)"
        echo     Remove-Item -Path '%TASK_FILE%' -Force
        echo     Write-Host "🧹 Cleaned up: %TASK_FILE%"
        echo } catch {
        echo     Write-Host "❌ PowerShell method failed: $($_.Exception.Message^)" -ForegroundColor Red
        echo     exit 1
        echo }
    ) > "%ps_script%"
    
    powershell -ExecutionPolicy Bypass -File "%ps_script%"
    set "ps_result=!errorlevel!"
    del "%ps_script%" >nul 2>&1
    
    if !ps_result!==0 (
        exit /b 0
    )
)

REM Manual fallback
echo ⚠️ Automated methods failed. Manual process required.
echo.
echo 📋 Manual GitHub Issue Creation:
echo.
echo 1. Go to your GitHub repository's Issues page
echo 2. Click 'New Issue'
echo 3. Copy the content from: %TASK_FILE%
echo 4. Add labels: context-engineering, feature-request
echo 5. After creating the issue, note the issue number
echo 6. Run: /start-task --issue=^<number^>
echo.
echo 💡 Task file preserved: %TASK_FILE%
echo    (Delete it manually after creating the issue)

exit /b 0