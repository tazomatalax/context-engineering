#!/usr/bin/env python3
"""Post a Context Engineering task draft to GitHub as an issue.

This script mirrors the behavior of the Node-based `post-issue.cjs` utility while
remaining free of external dependencies beyond the standard library (except for
`requests`, which is widely available and easy to install via uv).

Usage:
    uv run scripts/post_issue.py <task-draft-file>

When installed by the toolkit, the script lives at `scripts/post_issue.py` in
an end-user project. It can be executed with any Python 3.9+ interpreter. For a
fully isolated workflow, we recommend the Astro "uv" toolchain:
    uv pip install requests

Requirements:
    - `.env` file containing GITHUB_TOKEN and GITHUB_REPO (owner/repo)
    - Draft markdown file that begins with a `# Title` heading
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Dict, Optional

try:  # Defer import to provide helpful guidance when missing.
    import requests
except ModuleNotFoundError as exc:
    sys.stderr.write(
        "❌ Missing dependency: requests\n"
        "   Install with: uv pip install requests\n"
    )
    raise SystemExit(1) from exc

GITHUB_API = "https://api.github.com"


def find_env_file(start: Path) -> Optional[Path]:
    """Search upward from *start* for a `.env` file."""
    current = start.resolve()
    root = current.root
    while True:
        candidate = current / ".env"
        if candidate.exists():
            return candidate
        if str(current) == root:
            break
        current = current.parent
    return None


def parse_env_file(env_path: Path) -> Dict[str, str]:
    """Parse a simple KEY=VALUE env file without external dependencies."""
    env: Dict[str, str] = {}
    for line in env_path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, _, value = stripped.partition("=")
        env[key.strip()] = value.strip()
    return env


def load_env() -> Dict[str, str]:
    env = dict(os.environ)
    env_path = find_env_file(Path.cwd())
    if env_path:
        env.update(parse_env_file(env_path))
    return env


def parse_task_draft(path: Path) -> tuple[str, str]:
    """Extract the issue title and body from a markdown file."""
    content = path.read_text(encoding="utf-8")
    lines = content.splitlines()
    title = ""
    body_lines = []
    found_title = False

    for line in lines:
        if not found_title and line.startswith("# "):
            title = line[2:].strip()
            found_title = True
            continue
        if found_title or line.strip():
            body_lines.append(line)

    if not title:
        filename = path.stem
        title = filename.replace("task-draft-", "Feature Request: ").replace("-", " ")

    body = "\n".join(body_lines).strip()
    if not body:
        raise ValueError("Task draft appears empty or missing a recognizable body")

    return title, body


def post_issue(token: str, repo: str, title: str, body: str) -> dict:
    owner, _, name = repo.partition("/")
    if not owner or not name:
        raise ValueError("GITHUB_REPO must use owner/repo format")

    response = requests.post(
        f"{GITHUB_API}/repos/{owner}/{name}/issues",
        json={"title": title, "body": body, "labels": ["context-engineering", "feature-request"]},
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "context-engineering-toolkit",
        },
        timeout=30,
    )

    if response.status_code >= 400:
        try:
            detail = response.json()
        except ValueError:
            detail = response.text
        raise RuntimeError(f"GitHub API error ({response.status_code}): {detail}")

    return response.json()


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Post a task draft to GitHub as an issue")
    parser.add_argument("task_draft", help="Path to the markdown draft created by /create-task")
    args = parser.parse_args(argv)

    task_path = Path(args.task_draft).expanduser().resolve()
    if not task_path.exists():
        sys.stderr.write(f"❌ Task draft file not found: {task_path}\n")
        return 1

    env = load_env()
    token = env.get("GITHUB_TOKEN")
    repo = env.get("GITHUB_REPO")

    if not token:
        sys.stderr.write("❌ Missing GITHUB_TOKEN. Set it in your .env file.\n")
        return 1
    if not repo:
        sys.stderr.write("❌ Missing GITHUB_REPO. Set it in your .env file (owner/repo).\n")
        return 1

    try:
        title, body = parse_task_draft(task_path)
    except ValueError as exc:
        sys.stderr.write(f"❌ {exc}\n")
        return 1

    print(f"📄 Reading task draft: {task_path}")
    print(f"📝 Title: {title}")
    print(f"🚀 Posting issue to {repo}...")

    try:
        issue = post_issue(token, repo, title, body)
    except Exception as exc:  # noqa: BLE001 - show helpful diagnostics
        sys.stderr.write(f"❌ Failed to post issue: {exc}\n")
        return 1

    print("✅ Issue created successfully!")
    print(f"🔗 URL: {issue.get('html_url', 'unknown')}")
    print(f"📊 Issue #{issue.get('number', '?')}")
    print("\nNext steps:")
    issue_number = issue.get("number")
    if issue_number is not None:
        print(f"   /start-task --issue={issue_number}")
    safe_title = title.lower().replace(" ", "-")
    safe_title = ''.join(ch if ch.isalnum() or ch == '-' else '-' for ch in safe_title)
    print(f"   /execute-prp PRPs/active/{issue_number}-{safe_title}.md")

    try:
        task_path.unlink()
        print(f"🧹 Removed draft file: {task_path}")
    except OSError as exc:
        sys.stderr.write(f"⚠️  Warning: Could not delete draft file: {exc}\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
