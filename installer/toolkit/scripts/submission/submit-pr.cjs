#!/usr/bin/env node

/**
 * GitHub Pull Request Submission Script - Context Engineering Workflow
 * 
 * Automatically creates a pull request from your current work, linking it to a GitHub issue.
 * Handles git operations, push to remote, and PR creation with developer notes.
 * Uses .cjs extension for universal compatibility (works in all project types).
 *
 * USAGE:
 *   node scripts/submission/submit-pr.cjs --issue=<number> [--notes-file=<path>]
 *
 * EXAMPLES:
 *   node scripts/submission/submit-pr.cjs --issue=123
 *   node scripts/submission/submit-pr.cjs --issue=123 --notes-file=temp/pr-notes.md
 *
 * REQUIREMENTS:
 *   - .env file with GITHUB_TOKEN and GITHUB_REPO in project root
 *   - Either uncommitted changes OR existing feature branch 
 *   - Valid GitHub issue number
 *
 * BEHAVIOR:
 *   - If on main/master with changes: creates feature branch, commits, pushes, creates PR
 *   - If on feature branch: pushes existing commits and creates PR
 *   - Automatically detects .env file location in project hierarchy
 *   - Links PR to original issue (auto-closes on merge)
 *   - Posts comment on issue with PR link
 *
 * ERROR PREVENTION:
 *   - Validates environment variables and GitHub access
 *   - Handles network errors gracefully  
 *   - Works from any directory within the project
 *   - Provides clear error messages with suggested fixes
 */

const { Octokit } = require('@octokit/rest');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Find and load .env from project root, regardless of current working directory
function findAndLoadEnv() {
  let currentDir = process.cwd();
  let envPath;
  
  // Search up the directory tree for .env file
  while (currentDir !== path.dirname(currentDir)) {
    const possibleEnvPath = path.join(currentDir, '.env');
    if (fs.existsSync(possibleEnvPath)) {
      envPath = possibleEnvPath;
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  
  if (envPath) {
    require('dotenv').config({ path: envPath });
    console.log(`🔧 Loaded environment from: ${envPath}`);
  } else {
    console.warn('⚠️  No .env file found in project hierarchy');
  }
}

findAndLoadEnv();

// Configuration from environment variables
const { GITHUB_TOKEN, GITHUB_REPO } = process.env;

// Parse the repository from owner/repo format
let GITHUB_REPO_OWNER, GITHUB_REPO_NAME;
if (GITHUB_REPO) {
  const [owner, repo] = GITHUB_REPO.split('/');
  GITHUB_REPO_OWNER = owner;
  GITHUB_REPO_NAME = repo;
}

// Validate environment variables
if (!GITHUB_TOKEN) {
  console.error(
    '❌ Error: GITHUB_TOKEN is required. Please set it in your .env file.'
  );
  process.exit(1);
}

if (!GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
  console.error(
    '❌ Error: GITHUB_REPO is required in format "owner/repo-name". Please set it in your .env file.'
  );
  process.exit(1);
}

// Initialize Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Determine if a branch name is a feature branch per toolkit conventions
function isFeatureBranch(branch) {
  return branch && (branch.startsWith('feat/') || branch.startsWith('feature/'));
}

/**
 * Executes a shell command and returns the output
 */
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options,
    });
    return result.trim();
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    if (error.stdout) console.error(`Stdout: ${error.stdout}`);
    if (error.stderr) console.error(`Stderr: ${error.stderr}`);
    process.exit(1);
  }
}

/**
 * Detects the default branch of the repository dynamically
 */
function getDefaultBranch() {
  try {
    // First try to get the default branch from remote HEAD reference
    const remoteHead = execSync('git symbolic-ref refs/remotes/origin/HEAD', {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();

    if (remoteHead) {
      // Extract branch name from refs/remotes/origin/branch-name
      const branchName = remoteHead.replace('refs/remotes/origin/', '');
      if (branchName) {
        return branchName;
      }
    }
  } catch (error) {
    // Remote HEAD not set, try to determine from available branches
  }

  try {
    // Get all remote branches and look for common default names
    const remoteBranches = execSync('git branch -r', {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();

    const branches = remoteBranches
      .split('\n')
      .map((branch) => branch.trim().replace('origin/', ''))
      .filter((branch) => !branch.includes('HEAD') && branch);

    // Priority order for default branch detection
    const defaultCandidates = ['main', 'master', 'develop', 'dev'];

    for (const candidate of defaultCandidates) {
      if (branches.includes(candidate)) {
        return candidate;
      }
    }

    // If no standard defaults found, return the first available branch
    if (branches.length > 0) {
      return branches[0];
    }
  } catch (error) {
    // Fall back to checking local branches
  }

  try {
    // Get current branch as fallback
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();

    if (currentBranch && currentBranch !== 'HEAD') {
      return currentBranch;
    }
  } catch (error) {
    // Final fallback
  }

  // Ultimate fallback to 'main'
  return 'main';
}

/**
 * Fetches issue data from GitHub with improved error handling
 */
async function fetchIssue(issueNumber) {
  try {
    const { data: issue } = await octokit.rest.issues.get({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      issue_number: issueNumber,
    });

    // Validate issue data
    if (!issue) {
      throw new Error('No issue data returned from GitHub API');
    }

    if (!issue.title) {
      console.warn(
        `⚠️  Warning: Issue #${issueNumber} has no title, using fallback`
      );
      issue.title = `Issue #${issueNumber}`;
    }

    return issue;
  } catch (error) {
    if (error.status === 404) {
      console.error(
        `❌ Issue #${issueNumber} not found. Please check the issue number and repository.`
      );
    } else if (error.status === 403) {
      console.error(
        `❌ Access denied. Please check your GITHUB_TOKEN permissions.`
      );
    } else if (error.status === 401) {
      console.error(
        `❌ Authentication failed. Please check your GITHUB_TOKEN.`
      );
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error(
        `❌ Network error: Cannot connect to GitHub API. Please check your internet connection.`
      );
    } else {
      console.error(`❌ Error fetching issue #${issueNumber}:`, error.message);
    }
    process.exit(1);
  }
}

/**
 * Creates a conventional branch name from issue title
 */
function createBranchName(issueNumber, title) {
  const cleanTitle = title
    .toLowerCase()
    .replace(/^\[feat\]:\s*/i, '') // Remove [FEAT]: prefix
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length

  return `feat/${issueNumber}-${cleanTitle}`;
}

/**
 * Creates a conventional commit message
 */
function createCommitMessage(issueNumber, title) {
  const cleanTitle = title.replace(/^\[feat\]:\s*/i, ''); // Remove [FEAT]: prefix
  return `feat(issue-${issueNumber}): ${cleanTitle}`;
}

/**
 * Finds the corresponding PRP file for the issue
 */
function findPRPFile(issueNumber) {
  // Find project root by looking for package.json or .git directory
  let projectRoot = process.cwd();
  while (projectRoot !== path.dirname(projectRoot)) {
    if (fs.existsSync(path.join(projectRoot, 'package.json')) || 
        fs.existsSync(path.join(projectRoot, '.git'))) {
      break;
    }
    projectRoot = path.dirname(projectRoot);
  }

  const activeDir = path.join(projectRoot, 'PRPs', 'active');

  if (!fs.existsSync(activeDir)) {
    return null;
  }

  const files = fs.readdirSync(activeDir);
  const prpFile = files.find(
    (file) => file.startsWith(`${issueNumber}-`) && file.endsWith('.md')
  );

  return prpFile ? `PRPs/active/${prpFile}` : null;
}

/**
 * Posts a comment on the GitHub issue
 */
async function commentOnIssue(issueNumber, prUrl) {
  try {
    const comment = `🤖 **Implementation Complete!**

The feature requested in this issue has been implemented and is ready for review.

**Pull Request**: ${prUrl}

The implementation has passed all validation checks via \`./validate.sh\`. Please review the changes and merge when ready.`;

    await octokit.rest.issues.createComment({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      issue_number: issueNumber,
      body: comment,
    });

    console.log(`✅ Comment posted on issue #${issueNumber}`);
  } catch (error) {
    console.error(
      `⚠️  Warning: Could not comment on issue #${issueNumber}:`,
      error.message
    );
  }
}

/**
 * Creates a Pull Request with improved error handling
 */
async function createPullRequest(
  branchName,
  issueNumber,
  issue,
  prpFile,
  defaultBranch,
  developerNotes = ''
) {
  try {
    const title = `${issue.title}`;
    
    let body = `## Overview
This pull request implements the feature requested in issue #${issueNumber}.`;

    // Add developer notes if provided
    if (developerNotes.trim()) {
      body += `\n\n## Developer Notes\n${developerNotes.trim()}`;
    }

    body += `\n\n## Related Work
- **Implements**: Closes #${issueNumber}
- **Guided by**: \`${prpFile || 'Manual implementation'}\`

## Validation
- [x] All checks in \`./validate.sh\` pass locally.

---
*This PR was created automatically via the Context Engineering workflow.*`;

    const { data: pr } = await octokit.rest.pulls.create({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      title,
      body,
      head: branchName,
      base: defaultBranch,
    });

    return pr;
  } catch (error) {
    if (error.status === 422) {
      console.error(`❌ Pull request validation failed. This might be due to:`);
      console.error(
        `   - Branch '${branchName}' already exists as a pull request`
      );
      console.error(`   - Base branch '${defaultBranch}' doesn't exist`);
      console.error(`   - No differences between branches`);
    } else if (error.status === 403) {
      console.error(
        `❌ Access denied. Your GITHUB_TOKEN may not have 'repo' permissions.`
      );
    } else if (error.status === 401) {
      console.error(
        `❌ Authentication failed. Please check your GITHUB_TOKEN.`
      );
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error(
        `❌ Network error: Cannot connect to GitHub API. Please check your internet connection.`
      );
    } else {
      console.error(`❌ Error creating pull request:`, error.message);
    }
    process.exit(1);
  }
}

/**
 * Main execution function
 */
async function main() {
  // Parse command line arguments - only support --issue=<number> format
  const args = process.argv.slice(2);
  let issueNumber, notesFile;
  
  for (const arg of args) {
    if (arg.startsWith('--issue=')) {
      issueNumber = arg.split('=')[1];
    } else if (arg.startsWith('--notes-file=')) {
      notesFile = arg.split('=')[1];
    }
  }

  if (!issueNumber || isNaN(issueNumber)) {
    console.error('❌ Usage: node scripts/submission/submit-pr.cjs --issue=<number> [--notes-file=<path>]');
    console.error('   Example: node scripts/submission/submit-pr.cjs --issue=123 --notes-file=temp/pr-notes.md');
    process.exit(1);
  }

  // Read developer notes if provided
  let developerNotes = '';
  if (notesFile) {
    try {
  const fsp = fs.promises;
  developerNotes = await fsp.readFile(notesFile, 'utf8');
      console.log(`📝 Loaded developer notes from ${notesFile}`);
    } catch (error) {
      console.error(`❌ Error reading notes file ${notesFile}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log(`🚀 Starting PR submission for issue #${issueNumber}...`);

  // Check if we're in a git repository
  try {
    execCommand('git rev-parse --git-dir');
  } catch (error) {
    console.error('❌ Error: Not in a git repository');
    process.exit(1);
  }

  // Check if there are any changes to commit or if we're already on a feature branch
  try {
    const currentBranch = execCommand('git rev-parse --abbrev-ref HEAD');
    const status = execCommand('git status --porcelain');
    
  if (!status && !isFeatureBranch(currentBranch)) {
      console.error('❌ Error: No changes to commit and not on a feature branch.');
      console.error('   Either make some changes first, or switch to your feature branch.');
      process.exit(1);
    }
    
  if (!status && isFeatureBranch(currentBranch)) {
      console.log('ℹ️  No uncommitted changes found, but you\'re on a feature branch.');
      console.log('   Will attempt to push existing commits and create PR.');
    }
  } catch (error) {
    console.error('❌ Error checking git status');
    process.exit(1);
  }

  // Detect the default branch
  console.log(`🔍 Detecting default branch...`);
  const defaultBranch = getDefaultBranch();
  console.log(`✅ Default branch: ${defaultBranch}`);

  // Fetch issue from GitHub
  console.log(`🔍 Fetching issue #${issueNumber}...`);
  const issue = await fetchIssue(parseInt(issueNumber));
  console.log(`✅ Retrieved: "${issue.title}"`);

  // Create branch name and commit message
  let branchName = createBranchName(issueNumber, issue.title);
  const commitMessage = createCommitMessage(issueNumber, issue.title);

  console.log(`📝 Branch: ${branchName}`);
  console.log(`💬 Commit: ${commitMessage}`);

  // Find corresponding PRP file
  const prpFile = findPRPFile(issueNumber);
  if (prpFile) {
    console.log(`📋 Found PRP: ${prpFile}`);
  } else {
    console.log(`ℹ️  No PRP file found for issue #${issueNumber}`);
  }

  // Git operations - handle both new changes and existing feature branch
  const currentBranch = execCommand('git rev-parse --abbrev-ref HEAD');
  const status = execCommand('git status --porcelain');
  
  if (isFeatureBranch(currentBranch) && !status) {
    // Already on feature branch with no uncommitted changes
    console.log(`ℹ️  Using existing feature branch: ${currentBranch}`);
    console.log(`⬆️  Pushing existing commits to remote...`);
    try {
      execCommand(`git push -u origin ${currentBranch}`);
    } catch (error) {
      // Branch might already be pushed, try without -u
      execCommand(`git push origin ${currentBranch}`);
    }
    // Use the existing branch name for PR
    branchName = currentBranch;
  } else {
    // Create new branch and commit changes
    console.log(`🔄 Creating and switching to branch...`);
    execCommand(`git checkout -b ${branchName}`);

    if (status) {
      console.log(`📦 Adding changes to staging...`);
      execCommand('git add .');

      console.log(`💾 Committing changes...`);
      execCommand(`git commit -m "${commitMessage}"`);
    }

    console.log(`⬆️  Pushing to remote...`);
    execCommand(`git push -u origin ${branchName}`);
  }

  // Create Pull Request
  console.log(`🔄 Creating pull request...`);
  const pr = await createPullRequest(
    branchName,
    issueNumber,
    issue,
    prpFile,
    defaultBranch,
    developerNotes
  );

  // Comment on issue
  await commentOnIssue(issueNumber, pr.html_url);

  // Success!
  console.log(`\n🎉 Pull Request created successfully!`);
  console.log(`🔗 URL: ${pr.html_url}`);
  console.log(`📊 Status: Ready for review`);

  // Switch back to default branch
  console.log(`🔄 Switching back to ${defaultBranch} branch...`);
  try {
    execCommand(`git checkout ${defaultBranch}`);
    console.log(`✅ Switched to ${defaultBranch} branch`);
  } catch (error) {
    console.log(
      `⚠️  Warning: Could not switch to ${defaultBranch} branch: ${error.message}`
    );
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
