#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

function main() {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    return;
  }

  // Check if user wants to uninstall
  if (process.argv.includes('--uninstall')) {
    runUninstaller();
    return;
  }

  console.log(chalk.blue('🚀 Installing Context Engineering Toolkit...'));
  console.log(chalk.blue('='.repeat(60)));

  const sourceToolkitDir = path.resolve(__dirname, '..', 'toolkit');
  const destinationDir = process.cwd();

  // Check if in git repository
  if (!isGitRepository(destinationDir)) {
    console.error(chalk.red('❌ Not in a git repository!'));
    console.log('\nPlease run this installer from within a git repository:');
    console.log('  cd your-project');
    console.log('  git init  # if not already a git repo');
    console.log('  npx context-engineering-installer');
    process.exit(1);
  }

  // Detect or prompt for runtime
  detectAndSelectRuntime().then(runtime => {
    try {
      // Install toolkit with smart handling of special files
      installToolkit(sourceToolkitDir, destinationDir, runtime);
      console.log(chalk.green('✅ Toolkit files copied successfully!'));
      showNextSteps(runtime);
    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error);
      process.exit(1);
    }
  });
}

function isGitRepository(dir) {
  let current = path.resolve(dir);
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return true;
    }
    current = path.dirname(current);
  }
  return false;
}

function hasCommand(cmd) {
  try {
    require('child_process').execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function detectAndSelectRuntime() {
  // Check for RUNTIME environment variable override
  const runtimeOverride = process.env.RUNTIME;
  if (runtimeOverride === 'python' || runtimeOverride === 'node') {
    console.log(chalk.blue(`\n🔧 Using runtime from RUNTIME env var: ${runtimeOverride}`));
    return runtimeOverride;
  }

  // Detect available runtimes
  const hasUv = hasCommand('uv');
  const hasNode = hasCommand('node');

  console.log(chalk.gray(`\nDetected: ${hasUv ? 'uv ✓' : 'uv ✗'} | ${hasNode ? 'node ✓' : 'node ✗'}`));

  // Prompt for runtime selection
  return promptRuntime();
}

function promptRuntime() {
  return new Promise((resolve) => {
    console.log('\n' + '='.repeat(60));
    console.log('Select Runtime');
    console.log('='.repeat(60));
    console.log('\n🐍 Python Runtime (Recommended)');
    console.log('   - Minimal dependencies (only \'requests\')');
    console.log('   - Fast execution with uv');
    console.log('   - No Node.js required');
    console.log('\n� Node.js Runtime');
    console.log('   - Requires Node.js and npm');
    console.log('   - Uses @octokit/rest and dotenv');
    console.log('   - Good if you already have Node.js');
    console.log('\n' + '='.repeat(60));

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nChoose runtime [python/node] (default: python): ', (answer) => {
      rl.close();
      const choice = answer.trim().toLowerCase();

      if (choice === '' || choice === 'python' || choice === 'p') {
        resolve('python');
      } else if (choice === 'node' || choice === 'n') {
        resolve('node');
      } else {
        console.log(chalk.yellow(`Invalid choice: '${choice}'. Defaulting to python`));
        resolve('python');
      }
    });
  });
}

function installToolkit(sourceDir, destDir, runtime) {
  console.log(chalk.blue(`\n📁 Project root: ${destDir}`));
  console.log(chalk.blue(`🔧 Runtime: ${runtime}\n`));

  // Files that should be merged instead of skipped when they exist
  const filesToMerge = new Set(['.env.example']);
  
  // Copy .claude commands
  copyDirectory(
    path.join(sourceDir, '.claude'),
    path.join(destDir, '.claude'),
    'Claude Code commands'
  );

  // Copy GitHub templates
  copyDirectory(
    path.join(sourceDir, '.github'),
    path.join(destDir, '.github'),
    'GitHub issue/PR templates'
  );

  // Copy runtime-specific scripts
  const runtimeScriptsPath = path.join(sourceDir, 'runtimes', runtime, 'scripts');
  if (fs.existsSync(runtimeScriptsPath)) {
    copyDirectory(
      runtimeScriptsPath,
      path.join(destDir, 'scripts'),
      `${runtime.charAt(0).toUpperCase() + runtime.slice(1)} workflow scripts`
    );
    makeScriptsExecutable(path.join(destDir, 'scripts'));
  } else {
    console.log(chalk.yellow(`⚠️  Runtime scripts not found: ${runtimeScriptsPath}`));
  }

  // Copy detect-runtime helper
  const detectRuntimePath = path.join(sourceDir, 'scripts', 'detect-runtime.sh');
  if (fs.existsSync(detectRuntimePath)) {
    fs.copyFileSync(
      detectRuntimePath,
      path.join(destDir, 'scripts', 'detect-runtime.sh')
    );
    console.log(chalk.green('✅ Runtime detection helper installed'));
    if (process.platform !== 'win32') {
      fs.chmodSync(path.join(destDir, 'scripts', 'detect-runtime.sh'), 0o755);
    }
  }

  // Create PRPs directory structure
  const prpsDir = path.join(destDir, 'PRPs');
  fs.ensureDirSync(path.join(prpsDir, 'active'));
  fs.ensureDirSync(path.join(prpsDir, 'templates'));

  // Copy PRP template
  const prpTemplateSrc = path.join(sourceDir, 'PRPs', 'templates', 'prp_base.md');
  if (fs.existsSync(prpTemplateSrc)) {
    fs.copyFileSync(prpTemplateSrc, path.join(prpsDir, 'templates', 'prp_base.md'));
  }
  console.log(chalk.green('✅ PRPs directory structure created'));

  // Copy validation script
  const validateSrc = path.join(sourceDir, 'validate.sh');
  if (fs.existsSync(validateSrc)) {
    fs.copyFileSync(validateSrc, path.join(destDir, 'validate.sh'));
    if (process.platform !== 'win32') {
      fs.chmodSync(path.join(destDir, 'validate.sh'), 0o755);
    }
    console.log(chalk.green('✅ Validation script installed'));
  }

  // Copy AI rules
  const aiRulesSrc = path.join(sourceDir, 'AI_RULES.md');
  if (fs.existsSync(aiRulesSrc)) {
    fs.copyFileSync(aiRulesSrc, path.join(destDir, 'AI_RULES.md'));
    console.log(chalk.green('✅ AI rules documentation installed'));
  }

  // Copy advanced tools docs
  const advancedToolsSrc = path.join(sourceDir, 'advanced_tools.md');
  if (fs.existsSync(advancedToolsSrc)) {
    fs.copyFileSync(advancedToolsSrc, path.join(destDir, 'advanced_tools.md'));
    console.log(chalk.green('✅ Advanced tools documentation installed'));
  }

  // Create .env.example
  createEnvExample(destDir);

  // Create temp directory
  fs.ensureDirSync(path.join(destDir, 'temp'));
  console.log(chalk.green('✅ temp directory created'));
}

function copyDirectory(src, dest, description) {
  if (!fs.existsSync(src)) {
    console.log(chalk.yellow(`⚠️  Source not found: ${src}`));
    return;
  }

  console.log(chalk.blue(`📦 Installing ${description}...`));
  fs.ensureDirSync(dest);
  fs.copySync(src, dest, { overwrite: false, errorOnExist: false });
  console.log(chalk.green(`✅ ${description} installed`));
}

function makeScriptsExecutable(scriptsDir) {
  if (process.platform === 'win32') return; // Skip on Windows

  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (file.endsWith('.py') || file.endsWith('.cjs') || file.endsWith('.sh')) {
        fs.chmodSync(filePath, 0o755);
      }
    });
  };

  if (fs.existsSync(scriptsDir)) {
    walk(scriptsDir);
  }
}

function createEnvExample(destDir) {
  const envPath = path.join(destDir, '.env.example');
  if (!fs.existsSync(envPath)) {
    const content = `# Context Engineering Configuration

# GitHub Personal Access Token (required)
# Create at: https://github.com/settings/tokens
# Scopes needed: repo, workflow
GITHUB_TOKEN=your_github_token_here

# GitHub Repository (required)
# Format: owner/repo-name
# Example: octocat/Hello-World
GITHUB_REPO=your_username/your_repo
`;
    fs.writeFileSync(envPath, content);
    console.log(chalk.green('✅ .env.example created'));
  }
}

function showNextSteps(runtime) {
  console.log('\n' + '='.repeat(60));
  console.log('Installation Complete! 🎉');
  console.log('='.repeat(60));

  console.log('\n📋 Next Steps:\n');
  console.log('1. Configure your environment:');
  console.log('   cp .env.example .env');
  console.log('   # Edit .env with your GITHUB_TOKEN and GITHUB_REPO');
  console.log();

  console.log('2. Install runtime dependencies:');
  if (runtime === 'python') {
    console.log('   curl -LsSf https://astral.sh/uv/install.sh | sh');
    console.log('   uv pip install requests');
  } else {
    console.log('   npm install @octokit/rest dotenv');
  }
  console.log();

  console.log('3. Customize validate.sh for your project type');
  console.log();

  console.log('4. Start using Context Engineering in Claude Code:');
  console.log('   /create-task "Add dark mode toggle"');
  console.log();

  console.log(chalk.gray('To uninstall: npx context-engineering-installer --uninstall'));
}

function mergeEnvExample(srcPath, destPath, srcContent) {
  const existingContent = fs.readFileSync(destPath, 'utf8');
  
  // Parse both files to extract Context Engineering variables
  const ceVars = extractEnvVars(srcContent, 'Context Engineering');
  const existingVars = extractEnvVars(existingContent, '');
  
  // Check if any CE variables are missing from existing file
  const missingVars = [];
  for (const [key, value] of ceVars) {
    if (!existingVars.has(key)) {
      missingVars.push([key, value]);
    }
  }
  
  if (missingVars.length > 0) {
    // Append missing Context Engineering variables
    let newContent = existingContent;
    if (!newContent.endsWith('\n')) {
      newContent += '\n';
    }
    
    newContent += '\n# Context Engineering Environment Variables\n';
    for (const [key, value] of missingVars) {
      newContent += `${key}=${value}\n`;
    }
    
    fs.writeFileSync(destPath, newContent);
    console.log(chalk.blue(`📝 Merged Context Engineering variables into existing .env.example`));
  }
}

function extractEnvVars(content, section) {
  const vars = new Map();
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      vars.set(key.trim(), value.trim());
    }
  }
  
  return vars;
}

function cleanupEnvExample(envExamplePath) {
  const content = fs.readFileSync(envExamplePath, 'utf8');
  const lines = content.split('\n');
  
  // Find the start of Context Engineering section
  let ceStartIndex = -1;
  let ceEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '# Context Engineering Environment Variables') {
      ceStartIndex = i;
      break;
    }
  }
  
  if (ceStartIndex === -1) {
    return; // No Context Engineering section found
  }
  
  // Find the end of the Context Engineering section (next section or end of file)
  for (let i = ceStartIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#') && !line.startsWith('# ') && line !== '# Context Engineering Environment Variables') {
      ceEndIndex = i;
      break;
    }
  }
  
  if (ceEndIndex === -1) {
    ceEndIndex = lines.length;
  }
  
  // Remove the Context Engineering section
  const newLines = [
    ...lines.slice(0, ceStartIndex),
    ...lines.slice(ceEndIndex)
  ];
  
  // Remove trailing empty lines at the end
  while (newLines.length > 0 && newLines[newLines.length - 1].trim() === '') {
    newLines.pop();
  }
  
  if (newLines.length > 0) {
    // File still has content, write it back
    fs.writeFileSync(envExamplePath, newLines.join('\n') + '\n');
    console.log(chalk.red(`  🧹 Cleaned Context Engineering variables from .env.example`));
  } else {
    // File is now empty, remove it entirely
    fs.removeSync(envExamplePath);
    console.log(chalk.red(`  ❌ Removed empty .env.example`));
  }
}

function runUninstaller() {
  console.log(chalk.yellow('🧹 Context Engineering Uninstaller'));
  
  const projectDir = process.cwd();
  
  // Specific files that the installer creates (not entire directories)
  const toolkitFiles = [
    '.github/ISSUE_TEMPLATE/feature-request.yml',
    '.github/PULL_REQUEST_TEMPLATE.md',
    'scripts/generation/generate-from-issue.cjs',
    'scripts/submission/submit-pr.cjs',
    'scripts/post-issue.cjs',
    'PRPs',
    'temp',
    'validate.sh',
    'advanced_tools.md',
    'AI_RULES.md',
    'MCP_SERVERS.md'
  ];
  
  // Specific .claude files that the installer creates
  const claudeFiles = [
    '.claude/commands/start-task.md',
    '.claude/commands/validate-execution.md',
    '.claude/commands/submit-pr.md',
    '.claude/commands/create-task.md',
    '.claude/commands/refine-task.md',
    '.claude/commands/execute-prp.md',
    // Agent definition files
    '.claude/agents/create-task.md',
    '.claude/agents/refine-task.md',
    '.claude/agents/start-task.md',
    '.claude/agents/submit-pr.md',
    '.claude/agents/validate-execution.md'
  ];
  
  console.log(chalk.blue('\n📋 Files/directories that will be removed:'));
  
  let filesToRemove = [];
  let dirsToRemove = [];
  let envExampleNeedsCleanup = false;
  
  // Check .env.example for Context Engineering variables
  const envExamplePath = path.join(projectDir, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    if (content.includes('# Context Engineering Environment Variables')) {
      envExampleNeedsCleanup = true;
      console.log(chalk.white(`  📄 .env.example (Context Engineering variables only)`));
    }
  }
  
  // Check what toolkit files exist
  for (const item of toolkitFiles) {
    const itemPath = path.join(projectDir, item);
    if (fs.existsSync(itemPath)) {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        dirsToRemove.push(item);
        console.log(chalk.white(`  📁 ${item}/`));
      } else {
        filesToRemove.push(item);
        console.log(chalk.white(`  📄 ${item}`));
      }
    }
  }
  
  // Check what .claude files exist
  for (const item of claudeFiles) {
    const itemPath = path.join(projectDir, item);
    if (fs.existsSync(itemPath)) {
      filesToRemove.push(item);
      console.log(chalk.white(`  📄 ${item}`));
    }
  }
  
  // Check for empty parent directories that might need cleanup
  const potentialEmptyDirs = [
    '.claude/commands',
    '.claude/agents',
    '.claude',
    'scripts/generation',
    'scripts/submission', 
    'scripts',
    '.github/ISSUE_TEMPLATE',
    '.github'
  ];
  
  if (filesToRemove.length === 0 && dirsToRemove.length === 0 && !envExampleNeedsCleanup) {
    console.log(chalk.green('\n✅ No Context Engineering files found. Already clean!'));
    return;
  }
  
  console.log(chalk.yellow('\n⚠️  WARNING: This will permanently delete the files listed above.'));
  console.log(chalk.yellow('Make sure you have committed any important changes first.'));
  
  // Simple confirmation (no inquirer dependency)
  console.log(chalk.red('\nTo proceed, type "yes" and press Enter:'));
  
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      const answer = chunk.trim().toLowerCase();
      
      if (answer === 'yes') {
        try {
          // Remove files
          for (const file of filesToRemove) {
            const filePath = path.join(projectDir, file);
            fs.removeSync(filePath);
            console.log(chalk.red(`  ❌ Removed: ${file}`));
          }
          
          // Remove directories
          for (const dir of dirsToRemove) {
            const dirPath = path.join(projectDir, dir);
            fs.removeSync(dirPath);
            console.log(chalk.red(`  ❌ Removed: ${dir}/`));
          }
          
          // Clean up .env.example selectively
          if (envExampleNeedsCleanup) {
            cleanupEnvExample(envExamplePath);
          }
          
          // Clean up potentially empty parent directories
          for (const dir of potentialEmptyDirs) {
            const dirPath = path.join(projectDir, dir);
            if (fs.existsSync(dirPath)) {
              try {
                const contents = fs.readdirSync(dirPath);
                if (contents.length === 0) {
                  fs.removeSync(dirPath);
                  console.log(chalk.gray(`  🧹 Cleaned up empty: ${dir}/`));
                }
              } catch (error) {
                // Ignore errors for cleanup
              }
            }
          }
          
          console.log(chalk.green('\n✅ Context Engineering toolkit removed successfully!'));
          console.log(chalk.blue('You can reinstall anytime with: npx context-engineering-installer'));
          
        } catch (error) {
          console.error(chalk.red('\n❌ Uninstall failed:'), error.message);
          process.exit(1);
        }
      } else if (answer === 'no' || answer === '') {
        console.log(chalk.yellow('Uninstall cancelled.'));
      } else {
        console.log(chalk.yellow('Please type "yes" or "no"'));
        return;
      }
      
      process.exit(0);
    }
  });
}

function showHelp() {
  console.log(chalk.cyan('Context Engineering Installer v1.1.0\n'));
  console.log(chalk.white('Simple installer for adding Context Engineering workflow to any existing project.\n'));
  console.log(chalk.yellow('Usage:'));
  console.log(chalk.white('  npx context-engineering-installer          Install the toolkit'));
  console.log(chalk.white('  npx context-engineering-installer --uninstall    Remove the toolkit'));
  console.log(chalk.white('  npx context-engineering-installer --help         Show this help\n'));
  console.log(chalk.yellow('What gets installed:'));
  console.log(chalk.white('  • .claude/commands/ - 6 AI commands for Context Engineering workflow'));
  console.log(chalk.white('  • .claude/agents/   - 5 agent definitions powering task lifecycle automation'));
  console.log(chalk.white('  • .github/ - Issue and PR templates'));
  console.log(chalk.white('  • scripts/ - Automation scripts for GitHub integration'));
  console.log(chalk.white('  • PRPs/ - Plan templates and active directory'));
  console.log(chalk.white('  • validate.sh - Quality gate script (requires configuration)'));
  console.log(chalk.white('  • .env.example - Environment configuration template'));
  console.log(chalk.white('  • Advanced tools documentation and guides\n'));
  console.log(chalk.gray('Visit https://github.com/tazomatalax/context-engineering for full documentation.'));
}

main();