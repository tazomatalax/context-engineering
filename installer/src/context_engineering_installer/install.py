#!/usr/bin/env python3
"""
Context Engineering Installer - UV-based Python installer
Converts the original Node.js CommonJS installer to Python with UV support
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from typing import Set, Dict, List, Tuple
from rich.console import Console
from rich.text import Text

console = Console()

def main():
    """Main entry point for the installer."""
    parser = argparse.ArgumentParser(
        description="Context Engineering Toolkit Installer",
        prog="context-engineering-installer"
    )
    parser.add_argument(
        "--uninstall", action="store_true",
        help="Remove the Context Engineering toolkit"
    )

    args = parser.parse_args()

    if args.uninstall:
        run_uninstaller()
        return

    console.print("🚀 Installing Context Engineering Toolkit...", style="blue")

    # Get source and destination directories
    installer_dir = Path(__file__).parent.parent.parent
    source_toolkit_dir = installer_dir / "toolkit"
    destination_dir = Path.cwd()

    try:
        # Install toolkit with smart handling of special files
        install_toolkit(source_toolkit_dir, destination_dir)
        console.print("✅ Toolkit files copied successfully!", style="green")
    except Exception as error:
        console.print(f"❌ Installation failed: {error}", style="red")
        sys.exit(1)

    # Print next steps
    console.print("\n--- ACTION REQUIRED: Configuration ---", style="yellow")
    console.print("The toolkit is installed but needs to be configured for your project.")
    console.print("\n1. Install script dependencies:")
    console.print("   uv add requests python-dotenv rich click", style="bold")
    console.print("\n2. Configure your environment:")
    console.print("   cp .env.example .env", style="bold")
    console.print("   (Edit .env with your GitHub token and repository)")
    console.print("\n3. Configure your validation script:")
    console.print("   (Open `validate.sh` and add your project's test and lint commands)", style="bold")
    console.print("\n👉 Your AI assistant can help you with this! Just ask:")
    console.print('"Help me configure my `validate.sh` script for a React project."', style="cyan")
    console.print("\n🎉 Installation complete!", style="green")
    console.print("To uninstall: uv run context-engineering-installer --uninstall", style="dim")
    console.print("\n💡 Alternative: Use our universal installer (no Python required):", style="blue")
    console.print("   curl -fsSL https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.sh | bash", style="dim")

def install_toolkit(source_dir: Path, dest_dir: Path):
    """Install toolkit files with smart merging logic."""
    # Files that should be merged instead of skipped when they exist
    files_to_merge = {".env.example"}

    # Recursively copy toolkit with special handling
    copy_toolkit_recursive(source_dir, dest_dir, files_to_merge)

def copy_toolkit_recursive(src_dir: Path, dest_dir: Path, files_to_merge: Set[str]):
    """Recursively copy toolkit files with merge logic."""
    try:
        items = list(src_dir.iterdir())
    except FileNotFoundError:
        console.print(f"❌ Source directory not found: {src_dir}", style="red")
        return

    for item in items:
        dest_path = dest_dir / item.name

        if item.is_dir():
            # Create directory if it doesn't exist
            dest_path.mkdir(exist_ok=True)
            # Recursively copy contents
            copy_toolkit_recursive(item, dest_path, files_to_merge)
        else:
            # Handle file copying with merge logic
            try:
                # Get relative path from toolkit root
                toolkit_root = src_dir
                while toolkit_root.name != "toolkit" and toolkit_root.parent != toolkit_root:
                    toolkit_root = toolkit_root.parent

                relative_path = str(item.relative_to(toolkit_root))

                if relative_path in files_to_merge:
                    # Special handling for files that should be merged
                    merge_file(item, dest_path, relative_path)
                else:
                    # Normal copy behavior: skip if exists
                    if not dest_path.exists():
                        shutil.copy2(item, dest_path)
            except Exception as e:
                console.print(f"❌ Error copying {item}: {e}", style="red")

def merge_file(src_path: Path, dest_path: Path, relative_path: str):
    """Merge special files that need intelligent handling."""
    src_content = src_path.read_text(encoding='utf-8')

    if not dest_path.exists():
        # File doesn't exist, just copy it
        dest_path.write_text(src_content, encoding='utf-8')
        return

    if relative_path == ".env.example":
        merge_env_example(src_path, dest_path, src_content)
    # Add more merge handlers here for other file types

def merge_env_example(src_path: Path, dest_path: Path, src_content: str):
    """Merge .env.example files intelligently."""
    existing_content = dest_path.read_text(encoding='utf-8')

    # Parse both files to extract Context Engineering variables
    ce_vars = extract_env_vars(src_content, "Context Engineering")
    existing_vars = extract_env_vars(existing_content, "")

    # Check if any CE variables are missing from existing file
    missing_vars = []
    for key, value in ce_vars.items():
        if key not in existing_vars:
            missing_vars.append((key, value))

    if missing_vars:
        # Append missing Context Engineering variables
        new_content = existing_content
        if not new_content.endswith('\n'):
            new_content += '\n'

        new_content += '\n# Context Engineering Environment Variables\n'
        for key, value in missing_vars:
            new_content += f'{key}={value}\n'

        dest_path.write_text(new_content, encoding='utf-8')
        console.print("📝 Merged Context Engineering variables into existing .env.example", style="blue")

def extract_env_vars(content: str, section: str) -> Dict[str, str]:
    """Extract environment variables from file content."""
    vars_dict = {}
    lines = content.split('\n')

    for line in lines:
        trimmed = line.strip()
        if trimmed and not trimmed.startswith('#') and '=' in trimmed:
            key, *value_parts = trimmed.split('=')
            value = '='.join(value_parts)
            vars_dict[key.strip()] = value.strip()

    return vars_dict

def cleanup_env_example(env_example_path: Path):
    """Clean up Context Engineering variables from .env.example."""
    content = env_example_path.read_text(encoding='utf-8')
    lines = content.split('\n')

    # Find the start of Context Engineering section
    ce_start_index = -1
    ce_end_index = -1

    for i, line in enumerate(lines):
        if line.strip() == '# Context Engineering Environment Variables':
            ce_start_index = i
            break

    if ce_start_index == -1:
        return  # No Context Engineering section found

    # Find the end of the Context Engineering section
    for i in range(ce_start_index + 1, len(lines)):
        line = lines[i].strip()
        if line.startswith('#') and not line.startswith('# ') and line != '# Context Engineering Environment Variables':
            ce_end_index = i
            break

    if ce_end_index == -1:
        ce_end_index = len(lines)

    # Remove the Context Engineering section
    new_lines = lines[:ce_start_index] + lines[ce_end_index:]

    # Remove trailing empty lines
    while new_lines and new_lines[-1].strip() == '':
        new_lines.pop()

    if new_lines:
        # File still has content, write it back
        env_example_path.write_text('\n'.join(new_lines) + '\n', encoding='utf-8')
        console.print("  🧹 Cleaned Context Engineering variables from .env.example", style="red")
    else:
        # File is now empty, remove it entirely
        env_example_path.unlink()
        console.print("  ❌ Removed empty .env.example", style="red")

def run_uninstaller():
    """Run the uninstaller to remove Context Engineering files."""
    console.print("🧹 Context Engineering Uninstaller", style="yellow")

    project_dir = Path.cwd()

    # Specific files that the installer creates
    toolkit_files = [
        ".github/ISSUE_TEMPLATE/feature-request.yml",
        ".github/PULL_REQUEST_TEMPLATE.md",
        "scripts/generation/generate-from-issue.py",
        "scripts/submission/submit-pr.py",
        "scripts/post-issue.py",
        "PRPs",
        "temp",
        "validate.sh",
        "advanced_tools.md",
        "AI_RULES.md",
        "MCP_SERVERS.md"
    ]

    # Specific .claude files that the installer creates
    claude_files = [
        ".claude/commands/start-task.md",
        ".claude/commands/validate-execution.md",
        ".claude/commands/submit-pr.md",
        ".claude/commands/create-task.md",
        ".claude/commands/refine-task.md",
        ".claude/commands/execute-prp.md",
        # Agent definition files
        ".claude/agents/create-task.md",
        ".claude/agents/refine-task.md",
        ".claude/agents/start-task.md",
        ".claude/agents/submit-pr.md",
        ".claude/agents/validate-execution.md"
    ]

    console.print("\n📋 Files/directories that will be removed:", style="blue")

    files_to_remove = []
    dirs_to_remove = []
    env_example_needs_cleanup = False

    # Check .env.example for Context Engineering variables
    env_example_path = project_dir / ".env.example"
    if env_example_path.exists():
        content = env_example_path.read_text(encoding='utf-8')
        if '# Context Engineering Environment Variables' in content:
            env_example_needs_cleanup = True
            console.print("  📄 .env.example (Context Engineering variables only)", style="white")

    # Check what toolkit files exist
    for item in toolkit_files:
        item_path = project_dir / item
        if item_path.exists():
            if item_path.is_dir():
                dirs_to_remove.append(item)
                console.print(f"  📁 {item}/", style="white")
            else:
                files_to_remove.append(item)
                console.print(f"  📄 {item}", style="white")

    # Check what .claude files exist
    for item in claude_files:
        item_path = project_dir / item
        if item_path.exists():
            files_to_remove.append(item)
            console.print(f"  📄 {item}", style="white")

    # Check for empty parent directories that might need cleanup
    potential_empty_dirs = [
        ".claude/commands",
        ".claude/agents",
        ".claude",
        "scripts/generation",
        "scripts/submission",
        "scripts",
        ".github/ISSUE_TEMPLATE",
        ".github"
    ]

    if not files_to_remove and not dirs_to_remove and not env_example_needs_cleanup:
        console.print("\n✅ No Context Engineering files found. Already clean!", style="green")
        return

    console.print("\n⚠️  WARNING: This will permanently delete the files listed above.", style="yellow")
    console.print("Make sure you have committed any important changes first.", style="yellow")

    # Simple confirmation
    console.print("\nTo proceed, type 'yes' and press Enter:", style="red")

    answer = input().strip().lower()

    if answer == 'yes':
        try:
            # Remove files
            for file in files_to_remove:
                file_path = project_dir / file
                if file_path.exists():
                    if file_path.is_file():
                        file_path.unlink()
                    else:
                        shutil.rmtree(file_path)
                    console.print(f"  ❌ Removed: {file}", style="red")

            # Remove directories
            for dir_name in dirs_to_remove:
                dir_path = project_dir / dir_name
                if dir_path.exists():
                    shutil.rmtree(dir_path)
                    console.print(f"  ❌ Removed: {dir_name}/", style="red")

            # Clean up .env.example selectively
            if env_example_needs_cleanup:
                cleanup_env_example(env_example_path)

            # Clean up potentially empty parent directories
            for dir_name in potential_empty_dirs:
                dir_path = project_dir / dir_name
                if dir_path.exists():
                    try:
                        if not any(dir_path.iterdir()):  # Directory is empty
                            dir_path.rmdir()
                            console.print(f"  🧹 Cleaned up empty: {dir_name}/", style="dim")
                    except OSError:
                        # Ignore errors for cleanup
                        pass

            console.print("\n✅ Context Engineering toolkit removed successfully!", style="green")
            console.print("You can reinstall anytime with: uv run context-engineering-installer", style="blue")

        except Exception as error:
            console.print(f"\n❌ Uninstall failed: {error}", style="red")
            sys.exit(1)
    elif answer in ('no', ''):
        console.print("Uninstall cancelled.", style="yellow")
    else:
        console.print("Please type 'yes' or 'no'", style="yellow")

def show_help():
    """Show help information."""
    console.print("Context Engineering Installer v2.0.0\n", style="cyan")
    console.print("Fast UV-based installer for adding Context Engineering workflow to any existing project.\n", style="white")
    console.print("Usage:", style="yellow")
    console.print("  uv run context-engineering-installer          Install the toolkit", style="white")
    console.print("  uv run context-engineering-installer --uninstall    Remove the toolkit", style="white")
    console.print("  uv run context-engineering-installer --help         Show this help\n", style="white")
    console.print("What gets installed:", style="yellow")
    console.print("  • .claude/commands/ - 6 AI commands for Context Engineering workflow", style="white")
    console.print("  • .claude/agents/   - 5 agent definitions powering task lifecycle automation", style="white")
    console.print("  • .github/ - Issue and PR templates", style="white")
    console.print("  • scripts/ - Automation scripts for GitHub integration", style="white")
    console.print("  • PRPs/ - Plan templates and active directory", style="white")
    console.print("  • validate.sh - Quality gate script (requires configuration)", style="white")
    console.print("  • .env.example - Environment configuration template", style="white")
    console.print("  • Advanced tools documentation and guides\n", style="white")
    console.print("Visit https://github.com/tazomatalax/context-engineering for full documentation.", style="dim")

if __name__ == "__main__":
    main()