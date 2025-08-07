#!/usr/bin/env node

/**
 * Context Engineering Simple Installer
 *
 * Safely installs Context Engineering toolkit with minimal analysis.
 * No more smart but brittle project detection - just reliable file deployment.
 */

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');

program
  .name('context-engineering-installer')
  .description('Install Context Engineering toolkit in existing projects')
  .version('1.0.0')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--dry-run', 'Show what would be installed without making changes')
  .parse();

const options = program.opts();

async function main() {
  console.log(chalk.cyan.bold('\n🚀 Context Engineering Installer'));
  console.log(chalk.cyan('=====================================\n'));
  console.log(chalk.blue('Installing safe, standard toolkit...'));

  try {
    const projectPath = process.cwd();
    
    // Check if Git repository exists
    const hasGit = await fs.pathExists(path.join(projectPath, '.git'));
    if (!hasGit) {
      console.log(chalk.yellow('⚠️  Warning: No Git repository detected. Context Engineering works best with Git.'));
    }

    // Show installation plan
    console.log(chalk.blue('\n📋 Installation Plan:'));
    console.log(chalk.white('  • .claude/commands/ - AI command definitions'));
    console.log(chalk.white('  • .github/ - Issue and PR templates'));
    console.log(chalk.white('  • scripts/ - Automation scripts'));
    console.log(chalk.white('  • PRPs/ - Plan templates and active directory'));
    console.log(chalk.white('  • temp/ - Temporary working files'));
    console.log(chalk.white('  • validate.sh - Quality gate script (needs configuration)'));
    console.log(chalk.white('  • advanced_tools.md - Optional AI power-ups guide'));
    console.log(chalk.white('  • .env.example - Environment configuration template'));

    if (options.dryRun) {
      console.log(chalk.yellow('\n🔍 DRY RUN - No files will be modified'));
      return;
    }

    // Confirm installation
    if (!options.yes) {
      const inquirer = require('inquirer');
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Install Context Engineering toolkit?',
          default: true,
        },
      ]);

      if (!proceed) {
        console.log(chalk.yellow('Installation cancelled.'));
        return;
      }
    }

    // Install toolkit
    const spinner = ora('Installing Context Engineering toolkit...').start();
    
    await installToolkit(projectPath);
    
    spinner.succeed('Context Engineering toolkit installed successfully!');

    // Next steps
    console.log(chalk.green.bold('\n✅ Installation Complete! 🎉'));
    console.log(chalk.green('\n🚀 Next Steps:'));
    console.log(chalk.white('  1. Configure validate.sh for your project (the AI can help)'));
    console.log(chalk.white('  2. Copy .env.example to .env and add your GitHub token'));
    console.log(chalk.white('  3. Try: /create-task "Add feature X"'));
    console.log(chalk.white('  4. Read advanced_tools.md for optional AI power-ups'));

  } catch (error) {
    console.error(chalk.red('\n❌ Installation failed:'), error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function installToolkit(projectPath) {
  // Create directory structure
  const dirs = [
    '.claude/commands',
    '.github/ISSUE_TEMPLATE', 
    'scripts/generation',
    'scripts/submission',
    'temp',
    'PRPs/active',
    'PRPs/templates'
  ];

  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir));
  }

  // Install core files
  await installClaudeCommands(projectPath);
  await installGitHubTemplates(projectPath);
  await installScripts(projectPath);
  await installPRPTemplates(projectPath);
  await installValidateScript(projectPath);
  await installAdvancedToolsGuide(projectPath);
  await installEnvExample(projectPath);
  await createGitKeepFiles(projectPath);
}

async function installClaudeCommands(projectPath) {
  const commandsDir = path.join(projectPath, '.claude', 'commands');
  
  const commands = {
    'create-task.md': getCreateTaskCommand(),
    'refine-task.md': getRefineTaskCommand(), 
    'start-task.md': getStartTaskCommand(),
    'execute-prp.md': getExecutePRPCommand(),
    'validate-execution.md': getValidateExecutionCommand(),
    'submit-pr.md': getSubmitPRCommand()
  };

  for (const [filename, content] of Object.entries(commands)) {
    await fs.writeFile(path.join(commandsDir, filename), content, 'utf8');
  }
}

async function installGitHubTemplates(projectPath) {
  // Issue template
  const issueTemplate = getGitHubIssueTemplate();
  await fs.writeFile(
    path.join(projectPath, '.github', 'ISSUE_TEMPLATE', 'feature-request.yml'),
    issueTemplate,
    'utf8'
  );

  // PR template
  const prTemplate = getPullRequestTemplate();
  await fs.writeFile(
    path.join(projectPath, '.github', 'PULL_REQUEST_TEMPLATE.md'),
    prTemplate,
    'utf8'
  );
}

async function installScripts(projectPath) {
  // Generation script placeholder
  const generateScript = getGenerateFromIssueScript();
  await fs.writeFile(
    path.join(projectPath, 'scripts', 'generation', 'generate-from-issue.js'),
    generateScript,
    'utf8'
  );

  // Submission script placeholder  
  const submitScript = getSubmitPRScript();
  await fs.writeFile(
    path.join(projectPath, 'scripts', 'submission', 'submit-pr.js'),
    submitScript,
    'utf8'
  );
}

async function installPRPTemplates(projectPath) {
  const prpTemplate = getPRPBaseTemplate();
  await fs.writeFile(
    path.join(projectPath, 'PRPs', 'templates', 'prp_base.md'),
    prpTemplate,
    'utf8'
  );
}

async function installValidateScript(projectPath) {
  const validateScript = getValidateScript();
  await fs.writeFile(
    path.join(projectPath, 'validate.sh'),
    validateScript,
    'utf8'
  );

  // Set execute permissions (cross-platform)
  try {
    await fs.chmod(path.join(projectPath, 'validate.sh'), '755');
  } catch (error) {
    // Windows doesn't need chmod for shell scripts
  }
}

async function installAdvancedToolsGuide(projectPath) {
  const advancedTools = getAdvancedToolsGuide();
  await fs.writeFile(
    path.join(projectPath, 'advanced_tools.md'),
    advancedTools,
    'utf8'
  );
}

async function installEnvExample(projectPath) {
  const envExample = getEnvExample();
  await fs.writeFile(
    path.join(projectPath, '.env.example'),
    envExample,
    'utf8'
  );
}

async function createGitKeepFiles(projectPath) {
  const gitKeepDirs = [
    'temp',
    'PRPs/active'
  ];

  for (const dir of gitKeepDirs) {
    await fs.writeFile(
      path.join(projectPath, dir, '.gitkeep'),
      '',
      'utf8'
    );
  }
}

// Template functions - these return the exact content specified in TASK.md

function getCreateTaskCommand() {
  return `# Create Task Command

Creates a local draft of a GitHub issue for review before posting.

## Usage
\`/create-task "Brief description of the task"\`

## Instructions for AI

When the user runs this command:

1. **Analyze the request** and the current codebase to understand the context
2. **Generate a comprehensive task plan** with:
   - Clear objective
   - Detailed acceptance criteria  
   - Technical context and relevant files
   - Potential gotchas or considerations
3. **Save the draft** to \`temp/task-draft-{timestamp}.md\`
4. **Tell the user** the next command to run: \`node scripts/post-issue.js temp/task-draft-{filename}\`

This keeps the developer in control - they can review and edit the draft before it becomes an official GitHub issue.
`;
}

function getRefineTaskCommand() {
  return `# Refine Task Command

Converts a simple, manually-created GitHub issue into an actionable plan.

## Usage
\`/refine-task --issue=<issue-number>\`

## Instructions for AI

When the user runs this command:

1. **Fetch the GitHub issue** using the provided issue number
2. **Analyze the codebase** to understand technical context
3. **Generate a detailed implementation plan** including:
   - Technical approach
   - Files that need to be modified/created
   - Dependencies and considerations
   - Step-by-step breakdown
4. **Post the plan as a comment** on the original GitHub issue
5. **Confirm** that the issue now has a comprehensive plan for execution

This handles the common case where a PM or team member creates a simple issue that needs technical enrichment.
`;
}

function getStartTaskCommand() {
  return `# Start Task Command

Fetches a GitHub issue (with all comments) and prepares it for local execution.

## Usage
\`/start-task --issue=<issue-number>\`

## Instructions for AI

When the user runs this command:

1. **Fetch the complete GitHub issue** including:
   - Original issue body
   - All comments and discussion
   - Any refinements or clarifications
2. **Combine into a single document** that captures the full context
3. **Save to** \`PRPs/active/{issue-number}-{slug}.md\`
4. **Confirm** the local context file is ready for execution

The GitHub issue (including its comment thread) is the source of truth. This command creates a local working copy with the complete context.
`;
}

function getExecutePRPCommand() {
  return `# Execute PRP Command

Executes a PRP (Plan/Requirements/Prompt) file to implement the feature.

## Usage
\`/execute-prp <path-to-prp-file>\`

## Instructions for AI

When the user runs this command:

1. **Read the PRP file** completely to understand:
   - The objective and requirements
   - Technical context and constraints
   - Acceptance criteria
2. **Follow the plan systematically**:
   - Implement code changes as specified
   - Create/update tests as needed
   - Follow all coding standards and patterns
3. **Run validation** using \`./validate.sh\` before considering work complete
4. **Report completion** only when all acceptance criteria are met and validation passes

This is the core execution command that turns plans into working code.
`;
}

function getValidateExecutionCommand() {
  return `# Validate Execution Command  

Optional AI-powered logical review of implemented code against the plan.

## Usage
\`/validate-execution <path-to-prp-file>\`

## Instructions for AI

When the user runs this command:

1. **Read the original PRP file** to understand requirements
2. **Review the current codebase changes** (use git diff to see what was modified)
3. **Check for logical flaws**:
   - Does implementation match requirements?
   - Are edge cases handled?
   - Are there potential bugs or issues?
   - Is error handling appropriate?
4. **Provide detailed feedback** on any issues found
5. **Suggest fixes** for any problems discovered

This is a quality gate that catches issues that linting and syntax checks would miss - focusing on logic and requirement adherence.
`;
}

function getSubmitPRCommand() {
  return `# Submit PR Command

Creates a pull request with automated developer notes.

## Usage
\`/submit-pr --issue=<issue-number>\`

## Instructions for AI

When the user runs this command:

1. **Generate Developer Notes** by analyzing the git diff:
   - Summarize what files were changed and why
   - Highlight key implementation decisions
   - Note any important considerations for reviewers
2. **Create a branch** (if not already on one) with format: \`feature/issue-{number}\`
3. **Commit changes** with a clear commit message
4. **Run the submission script** with the developer notes: \`node scripts/submission/submit-pr.js --notes="<generated-notes>"\`
5. **Confirm PR creation** and provide the PR URL

The AI-generated developer notes help human reviewers understand the changes quickly.
`;
}

function getGitHubIssueTemplate() {
  return `name: "🚀 Feature Request"
description: "Create a structured feature request for Context Engineering workflow"
title: "[FEATURE] "
labels: ["enhancement", "context-engineering"]
body:
  - type: textarea
    id: objective
    attributes:
      label: "🎯 Objective"
      description: "What is the primary goal of this feature? What user problem does it solve?"
    validations:
      required: true
  - type: textarea
    id: acceptance-criteria
    attributes:
      label: "✅ Acceptance Criteria"
      description: "List the specific, testable criteria for success. Use markdown checklists."
      render: markdown
      placeholder: |
        - [ ] Criterion 1...
        - [ ] Criterion 2...
    validations:
      required: true
  - type: textarea
    id: technical-context
    attributes:
      label: "🛠️ Technical Context & Gotchas"
      description: "List relevant files, docs, and known pitfalls."
      placeholder: |
        - Relevant Files: \`src/components/\`
        - Patterns: Follow existing component structure
        - Gotcha: Remember to handle edge cases`;
}

function getPullRequestTemplate() {
  return `## Summary
Brief description of what this PR accomplishes.

## Context Engineering Info
- **Original Issue**: Fixes #<issue-number>
- **PRP Used**: \`PRPs/active/<prp-file>.md\`
- **Validation Status**: ✅ \`./validate.sh\` passes

## Developer Notes
<!-- AI-generated summary of changes will be inserted here -->

## Changes Made
- [ ] Feature implementation
- [ ] Tests added/updated  
- [ ] Documentation updated
- [ ] Validation passes

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

---
_Generated using Context Engineering workflow_`;
}

function getGenerateFromIssueScript() {
  return `#!/usr/bin/env node

/**
 * Generate PRP from GitHub Issue
 * 
 * This script fetches a GitHub issue (including all comments) and creates
 * a local PRP file with the complete context.
 */

const fs = require('fs-extra');
const path = require('path');

// TODO: This will be implemented in Phase 3, Task 3.1
console.log('📝 generate-from-issue.js - Ready for implementation');
console.log('This script will fetch GitHub issues and create PRP files.');

// Placeholder for now - real implementation comes in Phase 3
process.exit(0);
`;
}

function getSubmitPRScript() {
  return `#!/usr/bin/env node

/**
 * Submit Pull Request
 * 
 * This script creates a pull request with developer notes and proper linking.
 */

const fs = require('fs-extra');
const path = require('path');

// TODO: This will be implemented in Phase 3, Task 3.3  
console.log('🚀 submit-pr.js - Ready for implementation');
console.log('This script will create pull requests with developer notes.');

// Placeholder for now - real implementation comes in Phase 3
process.exit(0);
`;
}

function getPRPBaseTemplate() {
  return `# [Feature Name]

## 🎯 Objective
Brief description of what this feature accomplishes and why it's needed.

## ✅ Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2  
- [ ] Criterion 3

## 🛠️ Technical Context
### Relevant Files
- \`path/to/file1.js\` - Description
- \`path/to/file2.js\` - Description

### Patterns to Follow
- Follow existing patterns in similar components
- Use consistent naming conventions

### Gotchas & Considerations  
- Consider edge case X
- Remember to handle error case Y

## 📝 Implementation Notes
Additional context, requirements, and clarifications from the GitHub issue thread.

---
*Generated from GitHub Issue #[NUMBER] - [TITLE]*
`;
}

function getValidateScript() {
  return `#!/bin/bash
#
# This is the validation script for your project. It acts as a Quality Gate
# that the AI must pass before work is considered complete.
#
# --- ACTION REQUIRED ---
# You must configure this script with the specific commands for your project.
# The AI assistant can help you with this.
#
# Example for a Node.js project:
# echo "Running Linter..."
# npx eslint .
# echo "Running Tests..."
# npm test
#
# Example for a Python project:
# echo "Running Linter..."
# ruff check .
# echo "Running Type Checker..."
# mypy .
# echo "Running Tests..."
# pytest

echo "✅ Validation script is ready for configuration."
# Exit with success code 0 so the initial setup doesn't fail.
exit 0
`;
}

function getAdvancedToolsGuide() {
  return `# 🚀 Power-Ups for Your AI Assistant

This project is ready for advanced AI tooling. You can enable these features at any time by following the instructions below. This will give your AI assistant extra capabilities, like web search and live documentation access.

---

### 🧠 Power-Up 1: Live Documentation (Context7)
**Use Case:** Ensures the AI is always using the latest, most accurate version of any library or framework's documentation. *Highly Recommended.*
**Setup:**
1.  This server is hosted and requires no API key.
2.  Run this command in your terminal once:
    \`\`\`bash
    claude mcp add --transport http context7 "https://mcp.context7.com/mcp"
    \`\`\`

---

### 🌐 Power-Up 2: Web Search (Brave Search)
**Use Case:** When you need the AI to research topics, read articles, or find information not present in the codebase.
**Setup:**
1.  Get a free API key from [Brave Search API](https://brave.com/search/api/).
2.  Add the key to your \`.env\` file: \`BRAVE_API_KEY=your_key_here\`
3.  Run this command once:
    \`\`\`bash
    env BRAVE_API_KEY="$BRAVE_API_KEY" claude mcp add brave-search npx "-y" "@modelcontextprotocol/server-brave-search"
    \`\`\`
`;
}

function getEnvExample() {
  return `# Context Engineering Environment Variables

# GitHub Integration (Required)
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPO=owner/repo-name

# Optional: Advanced AI Tools
# BRAVE_API_KEY=your_brave_search_api_key_here
`;
}

// Handle CLI execution
if (require.main === module) {
  main();
}