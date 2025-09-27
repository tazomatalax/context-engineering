#!/usr/bin/env python3
"""
Context Engineering Installer - Root Entry Point

This is a lightweight wrapper that delegates to the main installer
in installer/src/context_engineering_installer/install.py.

This structure allows UV's `uvx --from git+...` to work while
preserving the existing development infrastructure.
"""

import sys
import os
import shutil
import argparse
from pathlib import Path
from typing import Set, Dict, List, Tuple

# Import rich for consistent styling
try:
    from rich.console import Console
    console = Console()
except ImportError:
    # Fallback if rich not available
    class Console:
        def print(self, text, style=None):
            print(text)
    console = Console()

def main():
    """Main entry point - simplified installer that finds toolkit from repo root."""
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
        # For uninstall, delegate to the full installer
        try:
            # Add installer to path and import
            installer_dir = Path(__file__).parent.parent.parent / "installer" / "src"
            sys.path.insert(0, str(installer_dir))
            from context_engineering_installer.install import run_uninstaller
            run_uninstaller()
        except ImportError:
            print("❌ Error: Could not import uninstaller. Please use the universal script or NPM method.")
            sys.exit(1)
        return

    console.print("🚀 Installing Context Engineering Toolkit...", style="blue")

    # Get source and destination directories (from repo root perspective)
    repo_root = Path(__file__).parent.parent.parent
    source_toolkit_dir = repo_root / "installer" / "toolkit"
    destination_dir = Path.cwd()

    if not source_toolkit_dir.exists():
        console.print(f"❌ Error: Toolkit directory not found at {source_toolkit_dir}", style="red")
        console.print("This usually means the package wasn't installed correctly.", style="red")
        sys.exit(1)

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
    console.print("   # OR with pip: pip install requests python-dotenv rich click")
    console.print("\n2. Configure your environment:")
    console.print("   cp .env.example .env", style="bold")
    console.print("   (Edit .env with your GitHub token and repository)")
    console.print("\n3. Configure your validation script:")
    console.print("   (Open `validate.sh` and add your project's test and lint commands)", style="bold")
    console.print("\n👉 Your AI assistant can help you with this! Just ask:")
    console.print('"Help me configure my `validate.sh` script for a React project."', style="cyan")
    console.print("\n🎉 Installation complete!", style="green")
    console.print("To uninstall: context-engineering-installer --uninstall", style="dim")
    console.print("\n💡 Alternative methods:", style="blue")
    console.print("   Universal script: curl -fsSL https://raw.githubusercontent.com/tazomatalax/context-engineering/main/install.sh | bash", style="dim")

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

if __name__ == "__main__":
    main()