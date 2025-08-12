@echo off
REM Context Engineering Universal Installer for Windows
REM Works without Node.js/npm dependency
REM
REM USAGE:
REM   install.bat
REM   git clone https://github.com/tazomatalax/context-engineering.git && cd context-engineering && install.bat

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+ with ANSI support)
set "RED=[91m"
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "GRAY=[37m"
set "NC=[0m"

echo %BLUE%  ╭─────────────────────────────────────────╮%NC%
echo %BLUE%  │   Context Engineering Universal Setup   │%NC%
echo %BLUE%  ╰─────────────────────────────────────────╯%NC%

REM Detect parent directory as project root
for %%i in ("%CD%\..") do set "PROJECT_ROOT=%%~fi"

REM Check if parent directory is a git repository
if not exist "%PROJECT_ROOT%\.git" (
    echo %RED%❌ Parent directory '%PROJECT_ROOT%' is not a git repository.%NC%
    echo Please run this script from within a cloned context-engineering repo inside your project.
    echo Or initialize git in your project: cd "%PROJECT_ROOT%" && git init
    exit /b 1
)

echo %BLUE%🚀 Installing in: %PROJECT_ROOT%%NC%
cd /d "%PROJECT_ROOT%"

echo %BLUE%🚀 Installing Context Engineering files...%NC%

REM Create directory structure
echo Creating directories...
if not exist ".claude\commands" mkdir ".claude\commands"
if not exist ".github\ISSUE_TEMPLATE" mkdir ".github\ISSUE_TEMPLATE"
if not exist "scripts\generation" mkdir "scripts\generation"
if not exist "scripts\submission" mkdir "scripts\submission"
if not exist "PRPs\active" mkdir "PRPs\active"
if not exist "PRPs\templates" mkdir "PRPs\templates"
if not exist "temp" mkdir "temp"

REM Function to copy or download files
:copy_file
set "source_path=%~1"
set "dest_path=%~2"

if exist "installer\toolkit\%source_path%" (
    copy "installer\toolkit\%source_path%" "%dest_path%" >nul
) else (
    REM Download from GitHub using PowerShell
    powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/tazomatalax/context-engineering/main/installer/toolkit/%source_path%' -OutFile '%dest_path%'" 2>nul
    if errorlevel 1 (
        echo %RED%❌ Failed to download %source_path%%NC%
        echo Please ensure you have internet connection or run from cloned repository
        exit /b 1
    )
)
goto :eof

REM Install Claude commands
call :copy_file ".claude\commands\create-task.md" ".claude\commands\create-task.md"
call :copy_file ".claude\commands\execute-prp.md" ".claude\commands\execute-prp.md"
call :copy_file ".claude\commands\refine-task.md" ".claude\commands\refine-task.md"
call :copy_file ".claude\commands\start-task.md" ".claude\commands\start-task.md"
call :copy_file ".claude\commands\submit-pr.md" ".claude\commands\submit-pr.md"
call :copy_file ".claude\commands\validate-execution.md" ".claude\commands\validate-execution.md"

REM Install GitHub templates
call :copy_file ".github\ISSUE_TEMPLATE\feature-request.yml" ".github\ISSUE_TEMPLATE\feature-request.yml"
call :copy_file ".github\PULL_REQUEST_TEMPLATE.md" ".github\PULL_REQUEST_TEMPLATE.md"

REM Install PRP templates
call :copy_file "PRPs\templates\prp_base.md" "PRPs\templates\prp_base.md"

REM Install scripts
call :copy_file "scripts\generation\generate-from-issue.cjs" "scripts\generation\generate-from-issue.cjs"
call :copy_file "scripts\post-issue.cjs" "scripts\post-issue.cjs"
call :copy_file "scripts\submission\submit-pr.cjs" "scripts\submission\submit-pr.cjs"

REM Install documentation
call :copy_file "AI_RULES.md" "AI_RULES.md"
call :copy_file "advanced_tools.md" "advanced_tools.md"

REM Create simple validation script for Windows
echo Creating validate.bat script...
if not exist "validate.bat" (
    call :copy_file "validate.sh" "temp_validate.sh"
    powershell -Command "(Get-Content temp_validate.sh) -replace '#!/bin/bash', '@echo off' -replace 'echo \"', 'echo ' -replace '\"', '' | Set-Content validate.bat"
    del temp_validate.sh >nul 2>&1
)

REM Create environment template
echo Creating .env.example...
if not exist ".env.example" (
    (
    echo # Context Engineering Environment Variables
    echo GITHUB_TOKEN=your_personal_access_token_here
    echo GITHUB_REPO=owner/repo-name
    ) > .env.example
) else (
    findstr /C:"Context Engineering" .env.example >nul 2>&1
    if errorlevel 1 (
        echo. >> .env.example
        echo # Context Engineering Environment Variables >> .env.example
        echo GITHUB_TOKEN=your_personal_access_token_here >> .env.example
        echo GITHUB_REPO=owner/repo-name >> .env.example
    )
)

echo.
echo %GREEN%✅ Context Engineering installed successfully!%NC%
echo.
echo %YELLOW%--- ACTION REQUIRED: Configuration ---%NC%
echo 1. Configure environment:
echo    copy .env.example .env
echo    REM Edit .env with your GitHub credentials
echo.
echo 2. For GitHub integration (optional), install script dependencies:
echo    npm install @octokit/rest@19.0.13 dotenv
echo.
echo 3. Configure validate.bat for your project type
echo.
echo %BLUE%Installation complete! You can now use /create-task in Claude Code%NC%
echo %GRAY%To uninstall: rmdir /s .claude PRPs scripts && del validate.bat AI_RULES.md advanced_tools.md%NC%

endlocal