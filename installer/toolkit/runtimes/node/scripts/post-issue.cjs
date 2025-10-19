#!/usr/bin/env node

/**
 * Post Issue Script - Context Engineering Workflow
 * 
 * Posts a task draft file to GitHub as a new issue.
 * Uses .cjs extension for universal compatibility (works in all project types).
 *
 * USAGE:
 *   node scripts/post-issue.cjs <task-draft-file>
 *
 * EXAMPLES:
 *   node scripts/post-issue.cjs temp/task-draft-20250108.md
 *
 * REQUIREMENTS:
 *   - .env file with GITHUB_TOKEN and GITHUB_REPO in project root
 *   - Valid task draft file in markdown format
 *   - @octokit/rest and dotenv packages installed
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

// Try to load dotenv
let dotenv;
try {
  dotenv = require('dotenv');
} catch (error) {
  console.error('❌ dotenv package not found. Installing...');
  console.error('   Run: npm install dotenv @octokit/rest');
  process.exit(1);
}

// Find and load .env from project root
function findProjectRoot(startDir = process.cwd()) {
  let currentDir = startDir;
  
  while (currentDir !== path.parse(currentDir).root) {
    const envPath = path.join(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback: try to load from current directory
  dotenv.config();
  return process.cwd();
}

// Initialize
const projectRoot = findProjectRoot();
const { GITHUB_TOKEN, GITHUB_REPO } = process.env;

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('❌ Usage: node scripts/post-issue.cjs <task-draft-file>');
  console.error('   Example: node scripts/post-issue.cjs temp/task-draft-20250108.md');
  process.exit(1);
}

const taskDraftFile = args[0];

// Validate environment variables
if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN is required. Please set it in your .env file.');
  process.exit(1);
}

if (!GITHUB_REPO) {
  console.error('❌ GITHUB_REPO is required. Please set it in your .env file (format: owner/repo).');
  process.exit(1);
}

// Parse the repository from owner/repo format
let GITHUB_REPO_OWNER, GITHUB_REPO_NAME;
if (GITHUB_REPO) {
  const [owner, repo] = GITHUB_REPO.split('/');
  if (!owner || !repo) {
    console.error('❌ GITHUB_REPO must be in format "owner/repo"');
    process.exit(1);
  }
  GITHUB_REPO_OWNER = owner;
  GITHUB_REPO_NAME = repo;
}

// Initialize Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function postIssue() {
  try {
    // Check if task draft file exists
    const taskDraftPath = path.resolve(taskDraftFile);
    if (!fs.existsSync(taskDraftPath)) {
      console.error(`❌ Task draft file not found: ${taskDraftFile}`);
      process.exit(1);
    }

    console.log(`📄 Reading task draft: ${taskDraftFile}`);
    const content = fs.readFileSync(taskDraftPath, 'utf8');

    // Parse the markdown to extract title and body
    const lines = content.split('\n');
    let title = '';
    let body = '';
    let foundTitle = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for the first # heading as the title
      if (!foundTitle && line.startsWith('# ')) {
        title = line.substring(2).trim();
        foundTitle = true;
        continue;
      }
      
      // Everything else goes in the body (skip empty lines at the start)
      if (foundTitle || line.trim()) {
        body += line + '\n';
      }
    }

    // Fallback: if no title found, use filename
    if (!title) {
      const filename = path.basename(taskDraftFile, path.extname(taskDraftFile));
      title = filename.replace(/task-draft-/, 'Feature Request: ').replace(/-/g, ' ');
    }

    // Clean up body
    body = body.trim();

    if (!body) {
      console.error('❌ Task draft appears to be empty or invalid format.');
      console.error('   Expected markdown with # title and content below.');
      process.exit(1);
    }

    console.log(`🚀 Posting issue to ${GITHUB_REPO}...`);
    console.log(`📝 Title: ${title}`);

    // Create the issue
    const { data: issue } = await octokit.rest.issues.create({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      title: title,
      body: body,
      labels: ['context-engineering', 'feature-request']
    });

    console.log(`✅ Issue created successfully!`);
    console.log(`🔗 URL: ${issue.html_url}`);
    console.log(`📊 Issue #${issue.number}`);
    console.log('');
    console.log('Next steps:');
    console.log(`   /start-task --issue=${issue.number}`);
    console.log(`   /execute-prp PRPs/active/${issue.number}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`);

    // Clean up the task draft file
    console.log(`🧹 Cleaning up: ${taskDraftFile}`);
    fs.unlinkSync(taskDraftPath);

  } catch (error) {
    console.error('❌ Failed to post issue:', error.message);
    
    if (error.status === 401) {
      console.error('   Check your GITHUB_TOKEN - it may be invalid or expired.');
    } else if (error.status === 404) {
      console.error(`   Repository ${GITHUB_REPO} not found or no access.`);
    } else if (error.status === 422) {
      console.error('   Invalid request - check your issue content.');
    }
    
    process.exit(1);
  }
}

// Run the script
postIssue();
