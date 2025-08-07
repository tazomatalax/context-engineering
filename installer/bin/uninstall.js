#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

function main() {
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

main();