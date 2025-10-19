#!/usr/bin/env python3
"""Download a GitHub issue (title, body, comments) and create a PRP draft.

This Python implementation mirrors the existing Node script while leaning on the
standard library plus `requests` for HTTP calls.

Usage:
    uv run scripts/generation/generate_from_issue.py <issue-number>
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

try:
    import requests
except ModuleNotFoundError as exc:
    sys.stderr.write(
        "❌ Missing dependency: requests\n"
        "   Install with: uv pip install requests\n"
    )
    raise SystemExit(1) from exc

GITHUB_API = "https://api.github.com"


def find_env_file(start: Path) -> Optional[Path]:
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


def parse_env_file(path: Path) -> Dict[str, str]:
    data: Dict[str, str] = {}
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, _, value = stripped.partition("=")
        data[key.strip()] = value.strip()
    return data


def load_env() -> Dict[str, str]:
    env = dict(os.environ)
    env_path = find_env_file(Path.cwd())
    if env_path:
        env.update(parse_env_file(env_path))
    return env


def github_get(token: str, repo: str, suffix: str):
    owner, _, name = repo.partition("/")
    if not owner or not name:
        raise ValueError("GITHUB_REPO must use owner/repo format")

    response = requests.get(
        f"{GITHUB_API}/repos/{owner}/{name}/{suffix}",
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


def create_issue_document(issue: Dict, comments: List[Dict]) -> str:
    body = issue.get("body") or "No description provided."
    created = issue.get("created_at")
    created_fmt = created or "unknown"
    if created:
        try:
            created_fmt = datetime.fromisoformat(created.replace("Z", "+00:00")).isoformat()
        except ValueError:
            created_fmt = created

    lines = [
        f"# {issue.get('title', 'Issue')}\n",
        f"**GitHub Issue:** #{issue.get('number')} - {issue.get('html_url')}\n",
        f"**Created:** {created_fmt} by {issue.get('user', {}).get('login', 'unknown')}\n",
        f"**Status:** {issue.get('state', 'unknown')}\n",
        "\n---\n",
        "\n## 🎯 Original Request\n",
        f"\n{body}\n",
    ]

    if comments:
        lines.append("\n---\n\n## 💬 Discussion & Refinements\n")
        for idx, comment in enumerate(comments, 1):
            login = comment.get("user", {}).get("login", "unknown")
            created_at = comment.get("created_at", "")
            try:
                created_display = datetime.fromisoformat(created_at.replace("Z", "+00:00")).strftime("%Y-%m-%d")
            except ValueError:
                created_display = created_at or "unknown"
            body = comment.get("body", "")
            lines.append(
                f"\n### Comment {idx} - {login} ({created_display})\n\n{body}\n"
            )

    lines.extend(
        [
            "\n---\n",
            "\n## 🛠️ Implementation Notes\n",
            "\n*This section will be filled during execution based on the discussion above.*\n",
            "\n## ✅ Acceptance Criteria\n",
            "\n*Extracted from the original request and discussion above.*\n",
            "\n---\n",
            f"\n*Generated from GitHub Issue #{issue.get('number')} on {datetime.utcnow().isoformat()}*\n",
            "*Ready for execution with /execute-prp*\n",
        ]
    )

    return "".join(lines)


def create_filename(issue_number: int, title: str) -> str:
    sanitized = (title or "untitled").lower()
    replacements = {
        "[feat]:": "",
        "[feature]:": "",
        "[bug]:": "",
        "[enhancement]:": "",
    }
    for original, repl in replacements.items():
        sanitized = sanitized.replace(original, repl)
    cleaned = "".join(ch if ch.isalnum() or ch == " " else " " for ch in sanitized)
    cleaned = "-".join(cleaned.split())
    cleaned = "-".join(filter(None, cleaned.split("-")))
    cleaned = cleaned[:100] or "issue"
    return f"{issue_number}-{cleaned}.md"


def resolve_active_dir(script_path: Path) -> Path:
    # scripts/generation -> scripts -> project root
    project_root = script_path.parent.parent.parent
    return project_root / "PRPs" / "active"


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Fetch a GitHub issue and create a PRP draft")
    parser.add_argument("issue_number", type=int, help="GitHub issue number")
    args = parser.parse_args(argv)

    env = load_env()
    token = env.get("GITHUB_TOKEN")
    repo = env.get("GITHUB_REPO")

    if not token:
        sys.stderr.write("❌ Missing GITHUB_TOKEN. Set it in your .env file.\n")
        return 1
    if not repo:
        sys.stderr.write("❌ Missing GITHUB_REPO. Set it in your .env file (owner/repo).\n")
        return 1

    issue_number = args.issue_number
    print(f"🔍 Fetching complete context for issue #{issue_number}...")

    try:
        issue = github_get(token, repo, f"issues/{issue_number}")
    except Exception as exc:
        sys.stderr.write(f"❌ Failed to fetch issue: {exc}\n")
        return 1

    print(f"✅ Retrieved issue: \"{issue.get('title', 'Unknown')}\"")

    try:
        comments = github_get(token, repo, f"issues/{issue_number}/comments")
    except Exception as exc:
        sys.stderr.write(f"⚠️  Warning: Could not fetch comments: {exc}\n")
        comments = []

    if comments:
        print(f"💬 Found {len(comments)} comments with additional context")

    document = create_issue_document(issue, comments)
    filename = create_filename(issue_number, issue.get("title", ""))

    active_dir = resolve_active_dir(Path(__file__).resolve())
    active_dir.mkdir(parents=True, exist_ok=True)
    output_path = active_dir / filename
    output_path.write_text(document, encoding="utf-8")

    print("✅ Complete context saved!")
    print(f"📁 File: PRPs/active/{filename}")
    print(f"🚀 Ready to execute: /execute-prp PRPs/active/{filename}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
