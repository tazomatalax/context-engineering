#!/usr/bin/env node

/**
 * Post Issue Script - Context Engineering Workflow
 *
 * Takes a markdown issue draft and posts it to GitHub as a structured issue.
 *
 * Usage: node scripts/post-issue.js <path-to-issue-draft.md>
 *
 * Requirements:
 * - .env file with GITHUB_TOKEN, GITHUB_REPO
 * - Issue draft in markdown format
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
require('dotenv').config();

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n🔄 ${step}: ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

/**
 * Parse markdown issue draft into GitHub issue format
 */
function parseIssueDraft(markdown) {
  const sections = {};
  const lines = markdown
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n');
  let currentSection = null;
  let currentContent = [];

  // Improved section matching patterns with fallbacks
  const sectionPatterns = {
    title: [
      /feature\s*request[:\s]/i,
      /title[:\s]/i,
      /^\s*[#\s]*[🚀🎯]*\s*(.+?)$/u,
    ],
    objective: [/objective/i, /goal/i, /purpose/i, /🎯/],
    acceptance_criteria: [
      /acceptance\s*criteria/i,
      /criteria/i,
      /requirements/i,
      /✅/,
    ],
    technical_context: [
      /technical\s*context/i,
      /technical/i,
      /context/i,
      /gotchas/i,
      /🛠/,
    ],
    priority: [/priority/i, /⚡/],
    complexity: [/complexity/i, /estimated/i, /🧩/],
    examples: [/examples/i, /📚/],
    documentation: [/documentation/i, /docs/i, /📖/],
    other_considerations: [
      /other\s*considerations/i,
      /considerations/i,
      /notes/i,
      /⚠/,
    ],
    additional_context: [/additional\s*context/i, /context/i, /📎/],
  };

  for (const line of lines) {
    // Match section headers with improved resilience
    const headerMatch = line.match(/^#+\s*(.+)$/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }

      // Start new section
      const header = headerMatch[1].trim();
      const cleanHeader = header.replace(/[🚀🎯✅🛠⚡🧩📚📖⚠📎]/gu, '').trim();

      // Find matching section with improved pattern matching
      let matchedSection = null;

      for (const [sectionKey, patterns] of Object.entries(sectionPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(cleanHeader) || pattern.test(header)) {
            matchedSection = sectionKey;
            break;
          }
        }
        if (matchedSection) break;
      }

      if (matchedSection) {
        currentSection = matchedSection;

        // Special handling for title section
        if (matchedSection === 'title') {
          // Extract title content, removing common prefixes and emojis
          let titleContent = cleanHeader
            .replace(/^(feature\s*request[:\s]*)/i, '')
            .replace(/^(title[:\s]*)/i, '')
            .trim();

          // If title is still empty or very short, try to use the full header
          if (!titleContent || titleContent.length < 3) {
            titleContent = header.replace(/[🚀🎯]/gu, '').trim();
          }

          currentContent = [titleContent];
        } else {
          currentContent = [];
        }
      } else {
        // Handle unrecognized headers - try to infer from position or content
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('feature') || lowerLine.includes('title')) {
          currentSection = 'title';
          currentContent = [cleanHeader];
        } else {
          currentSection = null;
          currentContent = [];
        }
      }
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  // Validation and fallbacks
  if (!sections.title) {
    // Try to extract title from first line or common patterns
    const firstLines = lines.slice(0, 5);
    for (const line of firstLines) {
      if (line.trim() && !line.startsWith('#') && line.length > 10) {
        sections.title = line.trim();
        break;
      }
    }
  }

  return sections;
}

/**
 * Format issue body for GitHub
 */
function formatIssueBody(sections) {
  const body = [];

  if (sections.objective) {
    body.push('## 🎯 Objective');
    body.push(sections.objective);
    body.push('');
  }

  if (sections.acceptance_criteria) {
    body.push('## ✅ Acceptance Criteria');
    body.push(sections.acceptance_criteria);
    body.push('');
  }

  if (sections.examples) {
    body.push('## 📚 Examples');
    body.push(sections.examples);
    body.push('');
  }

  if (sections.documentation) {
    body.push('## 📖 Documentation');
    body.push(sections.documentation);
    body.push('');
  }

  if (sections.technical_context) {
    body.push('## 🛠️ Technical Context & Gotchas');
    body.push(sections.technical_context);
    body.push('');
  }

  if (sections.other_considerations) {
    body.push('## ⚠️ Other Considerations');
    body.push(sections.other_considerations);
    body.push('');
  }

  if (sections.priority) {
    body.push('## ⚡ Priority Level');
    body.push(sections.priority);
    body.push('');
  }

  if (sections.complexity) {
    body.push('## 🧩 Estimated Complexity');
    body.push(sections.complexity);
    body.push('');
  }

  if (sections.additional_context) {
    body.push('## 📎 Additional Context');
    body.push(sections.additional_context);
    body.push('');
  }

  // Add workflow footer
  body.push('---');
  body.push('');
  body.push('_This issue was created using the Context Engineering workflow._');
  body.push('**Next steps:** `/generate-prp --issue=<this-issue-number>`');

  return body.join('\n');
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  const required = ['GITHUB_TOKEN', 'GITHUB_REPO'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(', ')}`);
    logInfo('Please create a .env file with:');
    logInfo('GITHUB_TOKEN=your_github_token');
    logInfo('GITHUB_REPO=owner/repo-name');
    return false;
  }

  // Validate GITHUB_REPO format
  if (process.env.GITHUB_REPO && !process.env.GITHUB_REPO.includes('/')) {
    logError('GITHUB_REPO must be in format "owner/repo-name"');
    return false;
  }

  return true;
}

/**
 * Main execution function
 */
async function main() {
  try {
    log('\n🚀 GitHub Issue Poster - Context Engineering Workflow', 'magenta');
    log('======================================================', 'magenta');

    // Check arguments
    const draftPath = process.argv[2];
    if (!draftPath) {
      logError('Usage: node scripts/post-issue.js <path-to-issue-draft.md>');
      process.exit(1);
    }

    // Validate environment
    logStep('1', 'Validating environment configuration');
    if (!validateEnvironment()) {
      process.exit(1);
    }
    logSuccess('Environment configuration valid');

    // Read draft file
    logStep('2', `Reading issue draft from: ${draftPath}`);
    let markdown;
    try {
      markdown = await fs.readFile(draftPath, 'utf8');
      logSuccess(`Draft file loaded (${markdown.length} characters)`);
    } catch (error) {
      logError(`Failed to read draft file: ${error.message}`);
      process.exit(1);
    }

    // Parse markdown
    logStep('3', 'Parsing issue draft structure');
    const sections = parseIssueDraft(markdown);

    if (!sections.title) {
      logError(
        'No title found in draft. Make sure it has a "# 🚀 Feature Request: Title" header'
      );
      process.exit(1);
    }

    logSuccess(`Parsed sections: ${Object.keys(sections).join(', ')}`);
    logInfo(`Title: "${sections.title}"`);

    // Parse repository from owner/repo format
    const [GITHUB_REPO_OWNER, GITHUB_REPO_NAME] = process.env.GITHUB_REPO.split('/');

    // Initialize GitHub client
    logStep('4', 'Connecting to GitHub API');
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Verify repository access
    try {
      const { data: repo } = await octokit.rest.repos.get({
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
      });
      logSuccess(`Connected to repository: ${repo.full_name}`);
    } catch (error) {
      logError(`Failed to access repository: ${error.message}`);
      logInfo('Check your GITHUB_TOKEN permissions and repository settings');
      process.exit(1);
    }

    // Create the issue
    logStep('5', 'Creating GitHub issue');
    const issueData = {
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      title: `[FEATURE] ${sections.title}`,
      body: formatIssueBody(sections),
      labels: ['enhancement', 'context-engineering'],
    };

    const { data: issue } = await octokit.rest.issues.create(issueData);

    logSuccess(`Issue created successfully! 🎉`);
    log(`\n📋 Issue Details:`, 'cyan');
    log(`   Number: #${issue.number}`, 'cyan');
    log(`   Title: ${issue.title}`, 'cyan');
    log(`   URL: ${issue.html_url}`, 'cyan');

    // Provide next steps
    log(`\n🔄 Next Steps:`, 'yellow');
    log(`   1. Review the issue: ${issue.html_url}`, 'yellow');
    log(`   2. Generate PRP: /generate-prp --issue=${issue.number}`, 'yellow');
    log(
      `   3. Execute PRP: /execute-prp PRPs/active/${issue.number}-<title>.md`,
      'yellow'
    );

    // Clean up draft file (optional)
    logStep('6', 'Cleaning up draft file');
    try {
      await fs.unlink(draftPath);
      logSuccess('Draft file cleaned up');
    } catch (error) {
      logWarning(`Could not delete draft file: ${error.message}`);
    }

    log('\n✨ Issue creation completed successfully!', 'green');
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseIssueDraft, formatIssueBody };
