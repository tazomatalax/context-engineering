#!/usr/bin/env python3
"""
Context Engineering Installer - Python/UVX Version

Installs the Context Engineering toolkit into your project.

Usage:
    uvx context-engineering-installer
    # Or with uv tool:
    uv tool run context-engineering-installer
"""

import os
import sys
import shutil
from pathlib import Path
from typing import Optional


class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    YELLOW = '\033[1;33m'
    GRAY = '\033[0;37m'
    NC = '\033[0m'  # No Color


def info(msg: str) -> None:
    """Print info message"""
    print(f"{Colors.BLUE}🚀 {msg}{Colors.NC}")


def success(msg: str) -> None:
    """Print success message"""
    print(f"{Colors.GREEN}✅ {msg}{Colors.NC}")


def warn(msg: str) -> None:
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.NC}")


def error(msg: str) -> None:
    """Print error message"""
    print(f"{Colors.RED}❌ {msg}{Colors.NC}")


def find_git_root(start_path: Path = None) -> Optional[Path]:
    """Find the root of the git repository"""
    if start_path is None:
        start_path = Path.cwd()
    
    current = start_path.resolve()
    
    # Walk up the directory tree looking for .git
    while current != current.parent:
        if (current / '.git').exists():
            return current
        current = current.parent
    
    return None


def detect_runtime() -> str:
    """Detect which runtime to use based on available tools"""
    # Check for uv (Python)
    uv_available = shutil.which('uv') is not None
    
    # Check for node
    node_available = shutil.which('node') is not None
    
    if uv_available and not node_available:
        return 'python'
    elif node_available and not uv_available:
        return 'node'
    elif uv_available and node_available:
        # Both available, prefer Python
        return 'python'
    else:
        # Neither available, default to python
        return 'python'


def prompt_runtime() -> str:
    """Prompt user to select runtime"""
    print("\n" + "="*60)
    print("Select Runtime")
    print("="*60)
    print("\n🐍 Python Runtime (Recommended)")
    print("   - Minimal dependencies (only 'requests')")
    print("   - Fast execution with uv")
    print("   - No Node.js required")
    print("\n🟢 Node.js Runtime")
    print("   - Requires Node.js and npm")
    print("   - Uses @octokit/rest and dotenv")
    print("   - Good if you already have Node.js")
    print("\n" + "="*60)
    
    while True:
        choice = input("\nChoose runtime [python/node] (default: python): ").strip().lower()
        
        if choice == '' or choice == 'python' or choice == 'p':
            return 'python'
        elif choice == 'node' or choice == 'n':
            return 'node'
        else:
            warn(f"Invalid choice: '{choice}'. Please enter 'python' or 'node'")


def copy_directory(src: Path, dest: Path, description: str) -> None:
    """Copy a directory with progress info"""
    if not src.exists():
        warn(f"Source directory not found: {src}")
        return
    
    info(f"Installing {description}...")
    
    # Create destination if it doesn't exist
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    # Copy the directory
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    
    success(f"{description} installed")


def copy_file(src: Path, dest: Path, description: str) -> None:
    """Copy a file with progress info"""
    if not src.exists():
        warn(f"Source file not found: {src}")
        return
    
    # Create destination directory if needed
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    # Copy the file
    shutil.copy2(src, dest)
    
    success(f"{description} installed")


def make_executable(file_path: Path) -> None:
    """Make a file executable (Unix-like systems)"""
    if os.name != 'nt':  # Not Windows
        current_mode = file_path.stat().st_mode
        file_path.chmod(current_mode | 0o111)


def install_toolkit(project_root: Path, runtime: str) -> None:
    """Install the Context Engineering toolkit"""
    
    # Get installer directory (where this script is located)
    installer_dir = Path(__file__).parent / 'toolkit'
    
    if not installer_dir.exists():
        error("Toolkit directory not found!")
        error(f"Expected: {installer_dir}")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("Installing Context Engineering Toolkit")
    print("="*60)
    print(f"\n📁 Project root: {project_root}")
    print(f"🔧 Runtime: {runtime}")
    print()
    
    # 1. Install .claude commands
    copy_directory(
        installer_dir / '.claude',
        project_root / '.claude',
        'Claude Code commands'
    )
    
    # 2. Install GitHub templates
    copy_directory(
        installer_dir / '.github',
        project_root / '.github',
        'GitHub issue/PR templates'
    )
    
    # 3. Install runtime-specific scripts
    runtime_scripts_src = installer_dir / 'runtimes' / runtime / 'scripts'
    scripts_dest = project_root / 'scripts'
    
    if runtime_scripts_src.exists():
        copy_directory(
            runtime_scripts_src,
            scripts_dest,
            f'{runtime.title()} workflow scripts'
        )
        
        # Make scripts executable
        for script_file in scripts_dest.rglob('*'):
            if script_file.is_file() and (script_file.suffix in ['.py', '.cjs', '.sh']):
                make_executable(script_file)
    else:
        warn(f"Runtime scripts not found: {runtime_scripts_src}")
    
    # 4. Install detect-runtime helper
    copy_file(
        installer_dir / 'scripts' / 'detect-runtime.sh',
        project_root / 'scripts' / 'detect-runtime.sh',
        'Runtime detection helper'
    )
    make_executable(project_root / 'scripts' / 'detect-runtime.sh')
    
    # 5. Install PRPs directory
    prps_dir = project_root / 'PRPs'
    prps_dir.mkdir(exist_ok=True)
    (prps_dir / 'active').mkdir(exist_ok=True)
    (prps_dir / 'templates').mkdir(exist_ok=True)
    
    # Copy PRP template if it exists
    prp_template_src = installer_dir / 'PRPs' / 'templates' / 'prp_base.md'
    if prp_template_src.exists():
        copy_file(
            prp_template_src,
            prps_dir / 'templates' / 'prp_base.md',
            'PRP template'
        )
    
    success("PRPs directory structure created")
    
    # 6. Install validation script
    validate_src = installer_dir / 'validate.sh'
    if validate_src.exists():
        copy_file(
            validate_src,
            project_root / 'validate.sh',
            'Validation script'
        )
        make_executable(project_root / 'validate.sh')
    
    # 7. Install AI rules
    ai_rules_src = installer_dir / 'AI_RULES.md'
    if ai_rules_src.exists():
        copy_file(
            ai_rules_src,
            project_root / 'AI_RULES.md',
            'AI rules documentation'
        )
    
    # 8. Install advanced tools docs
    advanced_tools_src = installer_dir / 'advanced_tools.md'
    if advanced_tools_src.exists():
        copy_file(
            advanced_tools_src,
            project_root / 'advanced_tools.md',
            'Advanced tools documentation'
        )
    
    # 9. Create .env.example if it doesn't exist
    env_example = project_root / '.env.example'
    if not env_example.exists():
        env_example.write_text("""# Context Engineering Configuration

# GitHub Personal Access Token (required)
# Create at: https://github.com/settings/tokens
# Scopes needed: repo, workflow
GITHUB_TOKEN=your_github_token_here

# GitHub Repository (required)
# Format: owner/repo-name
# Example: octocat/Hello-World
GITHUB_REPO=your_username/your_repo
""")
        success(".env.example created")
    
    # 10. Create temp directory
    temp_dir = project_root / 'temp'
    temp_dir.mkdir(exist_ok=True)
    success("temp directory created")


def show_next_steps(runtime: str) -> None:
    """Display post-installation instructions"""
    print("\n" + "="*60)
    print("Installation Complete! 🎉")
    print("="*60)
    
    print("\n📋 Next Steps:\n")
    print("1. Configure your environment:")
    print("   cp .env.example .env")
    print("   # Edit .env with your GITHUB_TOKEN and GITHUB_REPO")
    print()
    
    print("2. Install runtime dependencies:")
    if runtime == 'python':
        print("   curl -LsSf https://astral.sh/uv/install.sh | sh")
        print("   uv pip install requests")
    else:
        print("   npm install @octokit/rest dotenv")
    print()
    
    print("3. Customize validate.sh for your project type")
    print()
    
    print("4. Start using Context Engineering in Claude Code:")
    print("   /create-task \"Add dark mode toggle\"")
    print()
    
    print(f"{Colors.GRAY}To uninstall: rm -rf .claude PRPs scripts validate.sh AI_RULES.md advanced_tools.md .env{Colors.NC}")


def main() -> None:
    """Main installer function"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Context Engineering Installer")
    print(f"{'='*60}{Colors.NC}\n")
    
    # Find project root
    project_root = find_git_root()
    
    if project_root is None:
        error("Not in a git repository!")
        print("\nPlease run this installer from within a git repository:")
        print("  cd your-project")
        print("  git init  # if not already a git repo")
        print("  uvx context-engineering-installer")
        sys.exit(1)
    
    # Check for RUNTIME environment variable override
    runtime_override = os.environ.get('RUNTIME', '').lower()
    
    if runtime_override in ['python', 'node']:
        runtime = runtime_override
        info(f"Using runtime from RUNTIME env var: {runtime}")
    else:
        # Detect or prompt for runtime
        detected = detect_runtime()
        print(f"\n{Colors.GRAY}Detected runtime: {detected}{Colors.NC}")
        
        # Always prompt to confirm
        runtime = prompt_runtime()
    
    # Install the toolkit
    install_toolkit(project_root, runtime)
    
    # Show next steps
    show_next_steps(runtime)
    
    print()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Installation cancelled by user{Colors.NC}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}❌ Installation failed: {e}{Colors.NC}")
        sys.exit(1)
