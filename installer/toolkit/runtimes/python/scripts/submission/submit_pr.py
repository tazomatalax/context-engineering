#!/usr/bin/env python3
"""Submit a pull request for a Context Engineering workflow using Python.

This module re-implements the Node-based `submit-pr.cjs` functionality with a
Python toolchain suitable for `uv` environments. It handles git automation,
Pull Request creation, optional PRP extraction, and issue commentary.

Usage:
    uv run scripts/submission/submit_pr.py --issue=<number> [options]

Options:
    --notes-file=<path>        Include developer notes from a markdown file
    --no-prp-notes             Skip embedding Implementation Notes from PRP
    --collapse-prp-notes       Collapse Implementation Notes in PR body
    --dry-run, -n              Print actions without touching git or GitHub
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional, Tuple

try:
    import requests
except ModuleNotFoundError as exc:
    sys.stderr.write(
        "❌ Missing dependency: requests\n"
        "   Install with: uv pip install requests\n"
    )
    raise SystemExit(1) from exc

GITHUB_API = "https://api.github.com"


@dataclass
class EnvConfig:
    token: Optional[str]
    repo: Optional[str]


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


def load_env() -> EnvConfig:
    env = dict(os.environ)
    env_path = find_env_file(Path.cwd())
    if env_path:
        env.update(parse_env_file(env_path))
    return EnvConfig(token=env.get("GITHUB_TOKEN"), repo=env.get("GITHUB_REPO"))


def ensure_repo_format(repo: str) -> Tuple[str, str]:
    owner, sep, name = repo.partition("/")
    if not sep:
        raise ValueError("GITHUB_REPO must use owner/repo format")
    return owner, name


def exec_command(command: str, check: bool = True) -> str:
    result = subprocess.run(
        command,
        shell=True,
        text=True,
        capture_output=True,
        check=False,
    )
    if check and result.returncode != 0:
        sys.stderr.write(f"❌ Command failed: {command}\n")
        if result.stdout:
            sys.stderr.write(result.stdout)
        if result.stderr:
            sys.stderr.write(result.stderr)
        raise SystemExit(1)
    return (result.stdout or "").strip()


def is_feature_branch(branch: str) -> bool:
    return branch.startswith("feat/") or branch.startswith("feature/")


def get_default_branch() -> str:
    commands = [
        'git symbolic-ref refs/remotes/origin/HEAD',
        'git branch -r',
        'git rev-parse --abbrev-ref HEAD',
    ]

    try:
        remote_head = exec_command(commands[0])
        if remote_head:
            return remote_head.replace('refs/remotes/origin/', '').strip()
    except SystemExit:
        pass

    try:
        branches_output = exec_command(commands[1])
        branches = [
            line.strip().replace('origin/', '')
            for line in branches_output.splitlines()
            if line and 'HEAD' not in line
        ]
        for candidate in ("main", "master", "develop", "dev"):
            if candidate in branches:
                return candidate
        if branches:
            return branches[0]
    except SystemExit:
        pass

    try:
        current = exec_command(commands[2])
        if current and current != "HEAD":
            return current
    except SystemExit:
        pass

    return "main"


def github_request(method: str, url: str, token: str, payload: Optional[dict] = None) -> dict:
    response = requests.request(
        method,
        url,
        json=payload,
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


def fetch_issue(config: EnvConfig, issue_number: int) -> dict:
    owner, repo = ensure_repo_format(config.repo or "")
    url = f"{GITHUB_API}/repos/{owner}/{repo}/issues/{issue_number}"
    return github_request("GET", url, config.token or "")


def comment_on_issue(config: EnvConfig, issue_number: int, pr_url: str) -> None:
    owner, repo = ensure_repo_format(config.repo or "")
    url = f"{GITHUB_API}/repos/{owner}/{repo}/issues/{issue_number}/comments"
    body = {
        "body": (
            "🤖 **Implementation Complete!**\n\n"
            "The feature requested in this issue has been implemented and is ready for review.\n\n"
            f"**Pull Request**: {pr_url}\n\n"
            "The implementation has passed all validation checks via `./validate.sh`. "
            "Please review the changes and merge when ready."
        )
    }
    github_request("POST", url, config.token or "", payload=body)


def create_branch_name(issue_number: int, title: str) -> str:
    cleaned = title.lower().replace("[feat]:", "")
    cleaned = ''.join(ch if ch.isalnum() or ch == ' ' else ' ' for ch in cleaned)
    cleaned = '-'.join(cleaned.split())
    cleaned = cleaned[:50]
    if not cleaned:
        cleaned = 'update'
    return f"feat/{issue_number}-{cleaned}"


def create_commit_message(issue_number: int, title: str) -> str:
    safe_title = title.replace('[feat]:', '').strip() or f'Issue {issue_number}'
    return f"feat(issue-{issue_number}): {safe_title}"


def find_project_root() -> Path:
    current = Path.cwd()
    while current != current.parent:
        if (current / '.git').exists() or (current / 'package.json').exists():
            return current
        current = current.parent
    return Path.cwd()


def find_prp_file(issue_number: int) -> Optional[Path]:
    root = find_project_root()
    active_dir = root / 'PRPs' / 'active'
    if not active_dir.exists():
        return None
    for file in active_dir.iterdir():
        if file.is_file() and file.name.startswith(f"{issue_number}-") and file.suffix == '.md':
            return file
    return None


def extract_impl_notes_from_content(content: str) -> str:
    lines = content.splitlines()
    start = None
    for idx, line in enumerate(lines):
        if line.strip().lower().startswith('##') and 'implementation' in line.lower():
            start = idx
            break
    if start is None:
        return ''
    end = len(lines)
    for idx in range(start + 1, len(lines)):
        if lines[idx].strip().startswith('##'):
            end = idx
            break
    return '\n'.join(lines[start:end]).strip()


def extract_impl_notes(prp_path: Path) -> str:
    try:
        return extract_impl_notes_from_content(prp_path.read_text(encoding='utf-8'))
    except OSError:
        return ''


def create_pr_body(issue: dict, issue_number: int, prp_file: Optional[Path], *,
                   developer_notes: str = '', implementation_notes: str = '',
                   collapse_impl_notes: bool = False) -> str:
    body = [
        "## Overview",
        f"This pull request implements the feature requested in issue #{issue_number}.",
        "",
    ]
    if developer_notes.strip():
        body.extend(["## Developer Notes", developer_notes.strip(), ""])

    if implementation_notes.strip():
        if collapse_impl_notes or len(implementation_notes) > 1500:
            body.extend([
                "<details>",
                "<summary><strong>Implementation Notes (from PRP)</strong></summary>",
                "",
                implementation_notes.strip(),
                "",
                "</details>",
                "",
            ])
        else:
            body.append(implementation_notes.strip())
            body.append("")

    prp_reference = prp_file.as_posix() if prp_file else 'Manual implementation'
    body.extend([
        "## Related Work",
        f"- **Implements**: Closes #{issue_number}",
        f"- **Guided by**: `{prp_reference}`",
        "",
        "## Validation",
        "- [x] All checks in `./validate.sh` pass locally.",
        "",
        "---",
        "*This PR was created automatically via the Context Engineering workflow.*",
    ])
    return '\n'.join(body)


def create_pull_request(config: EnvConfig, branch: str, default_branch: str, issue_number: int,
                         issue: dict, pr_body: str, dry_run: bool) -> dict:
    if dry_run:
        print("\n===== DRY RUN: PR BODY PREVIEW =====\n")
        print(pr_body)
        print("\n===== END PREVIEW =====\n")
        return {"html_url": "(dry-run)", "number": issue_number}

    owner, repo = ensure_repo_format(config.repo or "")
    url = f"{GITHUB_API}/repos/{owner}/{repo}/pulls"
    payload = {
        "title": issue.get('title', f'Issue #{issue_number}') or f'Issue #{issue_number}',
        "head": branch,
        "base": default_branch,
        "body": pr_body,
    }
    return github_request("POST", url, config.token or "", payload=payload)


def stage_commit_and_push(branch: str, commit_message: str, dry_run: bool) -> None:
    if dry_run:
        print("🔄 Dry run: skipping git operations")
        return

    current_branch = exec_command('git rev-parse --abbrev-ref HEAD')
    status = exec_command('git status --porcelain')

    if is_feature_branch(current_branch) and not status:
        print(f"ℹ️  Using existing feature branch: {current_branch}")
        print("⬆️  Pushing existing commits to remote...")
        try:
            exec_command(f'git push -u origin {current_branch}')
        except SystemExit:
            exec_command(f'git push origin {current_branch}')
        return

    print("🔄 Creating and switching to branch...")
    exec_command(f'git checkout -b {branch}')

    if status:
        print("📦 Adding changes to staging...")
        exec_command('git add .')
        print("💾 Committing changes...")
        exec_command(f'git commit -m "{commit_message}"')

    print("⬆️  Pushing to remote...")
    exec_command(f'git push -u origin {branch}')


def ensure_git_ready(dry_run: bool) -> None:
    if dry_run:
        print('🔍 Dry run: skipping git repository checks')
        return

    try:
        exec_command('git rev-parse --git-dir')
    except SystemExit:
        sys.stderr.write('❌ Error: Not in a git repository\n')
        raise SystemExit(1)

    try:
        current_branch = exec_command('git rev-parse --abbrev-ref HEAD')
        status = exec_command('git status --porcelain')
        if not status and not is_feature_branch(current_branch):
            sys.stderr.write('❌ Error: No changes to commit and not on a feature branch.\n')
            sys.stderr.write('   Either make changes first, or switch to your feature branch.\n')
            raise SystemExit(1)
        if not status and is_feature_branch(current_branch):
            print("ℹ️  No uncommitted changes found, but you're on a feature branch.")
            print('   Will attempt to push existing commits and create PR.')
    except SystemExit:
        raise


def switch_back_to_branch(branch: str, dry_run: bool) -> None:
    if dry_run:
        print(f'🔄 Dry run: skipping switch back to {branch}')
        return
    try:
        exec_command(f'git checkout {branch}')
        print(f'✅ Switched to {branch} branch')
    except SystemExit:
        print(f'⚠️  Warning: Could not switch to {branch}')


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Submit a PR for a GitHub issue')
    parser.add_argument('--issue', required=True, type=int, help='GitHub issue number')
    parser.add_argument('--notes-file', help='Path to developer notes to embed in PR body')
    parser.add_argument('--no-prp-notes', action='store_true', help='Skip Implementation Notes extraction')
    parser.add_argument('--collapse-prp-notes', action='store_true', help='Collapse PRP notes in PR body')
    parser.add_argument('--dry-run', '-n', action='store_true', help='Preview without pushing or calling GitHub')
    return parser.parse_args(argv)


def read_notes(path: Optional[str]) -> str:
    if not path:
        return ''
    try:
        return Path(path).expanduser().read_text(encoding='utf-8')
    except OSError as exc:
        sys.stderr.write(f'❌ Error reading notes file {path}: {exc}\n')
        raise SystemExit(1)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)

    config = load_env()
    if not config.token:
        sys.stderr.write('❌ Missing GITHUB_TOKEN. Set it in your .env file.\n')
        return 1
    if not config.repo:
        sys.stderr.write('❌ Missing GITHUB_REPO. Set it in your .env file (owner/repo).\n')
        return 1

    issue_number = args.issue
    dry_run = args.dry_run

    developer_notes = read_notes(args.notes_file)

    print(f'🚀 Starting PR submission for issue #{issue_number}...')
    ensure_git_ready(dry_run)

    default_branch = 'main'
    if dry_run:
        print('🔍 Dry run: skipping default branch detection (using "main")')
    else:
        print('🔍 Detecting default branch...')
        default_branch = get_default_branch()
        print(f'✅ Default branch: {default_branch}')

    print(f'🔍 Fetching issue #{issue_number}...')
    try:
        issue = fetch_issue(config, issue_number)
    except Exception as exc:
        sys.stderr.write(f'❌ Failed to fetch issue: {exc}\n')
        return 1
    print(f'✅ Retrieved: "{issue.get("title", "Issue")}"')

    branch_name = create_branch_name(issue_number, issue.get('title', ''))
    commit_message = create_commit_message(issue_number, issue.get('title', ''))

    print(f'📝 Branch: {branch_name}')
    print(f'💬 Commit: {commit_message}')

    prp_file = find_prp_file(issue_number)
    if prp_file:
        print(f'📋 Found PRP: {prp_file}')
    else:
        print(f'ℹ️  No PRP file found for issue #{issue_number}')

    stage_commit_and_push(branch_name, commit_message, dry_run)

    implementation_notes = ''
    if prp_file and not args.notes_file and not args.no_prp_notes:
        implementation_notes = extract_impl_notes(prp_file)
        if implementation_notes:
            print('🧩 Injecting Implementation Notes from PRP into PR body')
        else:
            print('ℹ️  No Implementation Notes section found in PRP')

    pr_body = create_pr_body(
        issue,
        issue_number,
        prp_file,
        developer_notes=developer_notes,
        implementation_notes=implementation_notes,
        collapse_impl_notes=args.collapse_prp_notes,
    )

    print('🔄 Creating pull request...')
    try:
        pr = create_pull_request(config, branch_name, default_branch, issue_number, issue, pr_body, dry_run)
    except Exception as exc:
        sys.stderr.write(f'❌ Error creating pull request: {exc}\n')
        return 1

    if dry_run:
        print('\n🧪 Dry-run complete. PR body preview shown above.')
    else:
        try:
            comment_on_issue(config, issue_number, pr.get('html_url', ''))
            print(f'✅ Comment posted on issue #{issue_number}')
        except Exception as exc:
            sys.stderr.write(f'⚠️  Warning: Could not comment on issue #{issue_number}: {exc}\n')

        print('\n🎉 Pull Request created successfully!')
        print(f"🔗 URL: {pr.get('html_url', 'unknown')}")
        print('📊 Status: Ready for review')

    switch_back_to_branch(default_branch, dry_run)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
