import os
import sys
import subprocess
from pathlib import Path

def main():
    """
    Lightweight Python wrapper for the Context Engineering Node.js CLI.
    This allows the tool to be installed and run via 'uvx' or 'pip'.
    """
    # Find the repo root relative to this file
    # src/context_installer/main.py -> repo_root
    repo_root = Path(__file__).parent.parent.parent
    
    # Path to the Node.js entry point
    cli_entry = repo_root / "cli" / "dist" / "index.js"
    
    if not cli_entry.exists():
        print(f"Error: CLI entry point not found at {cli_entry}")
        print("Please ensure the project is built: npm run build")
        sys.exit(1)
        
    # Check if node is installed
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Node.js is required to run this tool.")
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)
        
    # Run the node CLI
    try:
        # Pass all arguments to the node process
        cmd = ["node", str(cli_entry)] + sys.argv[1:]
        # Use inherit for stdio to keep the TUI interactive
        result = subprocess.run(cmd)
        sys.exit(result.returncode)
    except KeyboardInterrupt:
        sys.exit(0)
    except Exception as e:
        print(f"Error running CLI: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
