#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

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

  const sourceToolkitDir = path.resolve(__dirname, '..', 'toolkit');
  const destinationDir = process.cwd();

  try {
    // Install toolkit with smart handling of special files
    installToolkit(sourceToolkitDir, destinationDir);
    console.log(chalk.green('✅ Toolkit files copied successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Installation failed:'), error);
    process.exit(1);
  }

  // Print next steps
  console.log(chalk.yellow('\n--- ACTION REQUIRED: Configuration ---'));
  console.log('The toolkit is installed but needs to be configured for your project.');
  console.log('\n1. ' + chalk.bold('Configure your environment:'));
  console.log('   cp .env.example .env');
  console.log('   (Edit .env with your GitHub token and repository)');
  console.log('\n2. ' + chalk.bold('Configure your validation script:'));
  console.log('   (Open `validate.sh` and add your project\'s test and lint commands)');
  console.log('\n👉 Your AI assistant can help you with this! Just ask:');
  console.log(chalk.cyan('"Help me configure my `validate.sh` script for a React project."'));
  console.log(chalk.green('\n🎉 Installation complete!'));
  console.log(chalk.gray('\nTo uninstall: npx context-engineering-installer --uninstall'));
}

function installToolkit(sourceDir, destDir) {
  // Files that should be merged instead of skipped when they exist
  const filesToMerge = new Set(['.env.example']);
  
  // Recursively copy toolkit with special handling
  copyToolkitRecursive(sourceDir, destDir, filesToMerge);
}

function copyToolkitRecursive(srcDir, destDir, filesToMerge) {
  const items = fs.readdirSync(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    const stats = fs.statSync(srcPath);
    
    if (stats.isDirectory()) {
      // Create directory if it doesn't exist
      fs.ensureDirSync(destPath);
      // Recursively copy contents
      copyToolkitRecursive(srcPath, destPath, filesToMerge);
    } else {
      // Handle file copying with merge logic
      const relativePath = path.relative(path.resolve(__dirname, '..', 'toolkit'), srcPath);
      
      if (filesToMerge.has(relativePath)) {
        // Special handling for files that should be merged
        mergeFile(srcPath, destPath, relativePath);
      } else {
        // Normal copy behavior: skip if exists
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  }
}

function mergeFile(srcPath, destPath, relativePath) {
  const srcContent = fs.readFileSync(srcPath, 'utf8');
  
  if (!fs.existsSync(destPath)) {
    // File doesn't exist, just copy it
    fs.writeFileSync(destPath, srcContent);
    return;
  }
  
  if (relativePath === '.env.example') {
    mergeEnvExample(srcPath, destPath, srcContent);
  }
  // Add more merge handlers here for other file types
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

function runUninstaller() {
  console.log(chalk.yellow('🧹 Context Engineering Uninstaller'));
  
  const projectDir = process.cwd();
  
  // List of files/directories that the installer creates
  const toolkitFiles = [
    '.claude',
    '.github/ISSUE_TEMPLATE/feature-request.yml',
    '.github/PULL_REQUEST_TEMPLATE.md',
    'scripts/generation/generate-from-issue.js',
    'scripts/submission/submit-pr.js',
    'PRPs',
    'temp',
    'validate.sh',
    'advanced_tools.md',
    'AI_RULES.md',
    'MCP_SERVERS.md',
    '.env.example'
  ];
  
  console.log(chalk.blue('\n📋 Files/directories that will be removed:'));
  
  let filesToRemove = [];
  let dirsToRemove = [];
  
  // Check what exists
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
  
  // Check for empty parent directories that might need cleanup
  const potentialEmptyDirs = [
    'scripts/generation',
    'scripts/submission', 
    'scripts',
    '.github/ISSUE_TEMPLATE',
    '.github'
  ];
  
  if (filesToRemove.length === 0 && dirsToRemove.length === 0) {
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
  console.log(chalk.white('  • .github/ - Issue and PR templates'));
  console.log(chalk.white('  • scripts/ - Automation scripts for GitHub integration'));
  console.log(chalk.white('  • PRPs/ - Plan templates and active directory'));
  console.log(chalk.white('  • validate.sh - Quality gate script (requires configuration)'));
  console.log(chalk.white('  • .env.example - Environment configuration template'));
  console.log(chalk.white('  • Advanced tools documentation and guides\n'));
  console.log(chalk.gray('Visit https://github.com/tazomatalax/context-engineering for full documentation.'));
}

main();