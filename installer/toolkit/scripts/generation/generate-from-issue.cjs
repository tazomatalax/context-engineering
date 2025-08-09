#!/usr/bin/env node

/**
 * GitHub Issue to PRP Generator
 *
 * Fetches a GitHub issue and saves the raw content for AI-powered PRP generation.
 * Usage: node generate-from-issue.js <issue-number>
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
    } else {
      console.error(`❌ Error fetching issue #${issueNumber}:`, error.message);
    }
    process.exit(1);
  }
}

/**
 * Fetches all comments for an issue
 */
async function fetchIssueComments(issueNumber) {
  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      issue_number: issueNumber,
    });

    return comments || [];
  } catch (error) {
    console.warn(`⚠️  Warning: Could not fetch comments for issue #${issueNumber}:`, error.message);
    return [];
  }
}

/**
 * Creates a comprehensive issue context document including comments
 */
function createIssueDocument(issue, comments) {
  const { title, number, html_url, body, user, created_at, state } = issue;

  let document = `# ${title}

**GitHub Issue:** #${number} - ${html_url}
**Created:** ${created_at} by ${user.login}
**Status:** ${state}

---

## 🎯 Original Request

${body || 'No description provided.'}`;

  // Add comments section if there are any
  if (comments && comments.length > 0) {
    document += `\n\n---\n\n## 💬 Discussion & Refinements\n`;
    
    comments.forEach((comment, index) => {
      const commentDate = new Date(comment.created_at).toLocaleDateString();
      document += `\n### Comment ${index + 1} - ${comment.user.login} (${commentDate})\n\n${comment.body}\n`;
    });
  }

  document += `\n\n---\n\n## 🛠️ Implementation Notes

*This section will be filled during execution based on the discussion above.*

## ✅ Acceptance Criteria

*Extracted from the original request and discussion above.*

---

*Generated from GitHub Issue #${number} on ${new Date().toISOString()}*
*Ready for execution with /execute-prp*
`;

  return document;
}

/**
 * Creates a kebab-case filename from issue title with improved resilience
 */
function createFileName(issueNumber, title) {
  if (!title || typeof title !== 'string') {
    return `${issueNumber}-untitled-issue.md`;
  }

  const cleanTitle = title
    .toLowerCase()
    .replace(/^\[feat\]:\s*/i, '') // Remove [FEAT]: prefix
    .replace(/^\[feature\]:\s*/i, '') // Remove [FEATURE]: prefix
    .replace(/^\[bug\]:\s*/i, '') // Remove [BUG]: prefix
    .replace(/^\[enhancement\]:\s*/i, '') // Remove [ENHANCEMENT]: prefix
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length to avoid filesystem issues

  // Ensure we have a valid filename
  if (!cleanTitle || cleanTitle.length < 1) {
    return `${issueNumber}-issue.md`;
  }

  return `${issueNumber}-${cleanTitle}.md`;
}

/**
 * Main execution function
 */
async function main() {
  const issueNumber = process.argv[2];

  if (!issueNumber || isNaN(issueNumber)) {
    console.error('❌ Usage: node generate-from-issue.js <issue-number>');
    console.error('   Example: node generate-from-issue.js 123');
    process.exit(1);
  }

  console.log(`🔍 Fetching complete context for issue #${issueNumber}...`);

  // Fetch issue from GitHub
  const issue = await fetchIssue(parseInt(issueNumber));
  console.log(`✅ Retrieved issue: "${issue.title}"`);

  // Fetch all comments for the issue
  const comments = await fetchIssueComments(parseInt(issueNumber));
  if (comments.length > 0) {
    console.log(`💬 Found ${comments.length} comments with additional context`);
  }

  // Create the comprehensive issue document with all context
  const issueDocument = createIssueDocument(issue, comments);

  // Create filename and ensure active directory exists
  const fileName = createFileName(issueNumber, issue.title);
  const activeDir = path.join(__dirname, '..', '..', 'PRPs', 'active');

  if (!fs.existsSync(activeDir)) {
    fs.mkdirSync(activeDir, { recursive: true });
  }

  const outputPath = path.join(activeDir, fileName);

  // Write the raw issue document
  fs.writeFileSync(outputPath, issueDocument, 'utf8');

  console.log(`✅ Complete context saved!`);
  console.log(`📁 File: PRPs/active/${fileName}`);
  console.log(`🚀 Ready to execute: /execute-prp PRPs/active/${fileName}`);
}

// Run the script if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

// Export functions for testing
module.exports = { createIssueDocument };
