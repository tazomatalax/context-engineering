#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

function main() {
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
  console.log(chalk.gray('\nTo uninstall: npx context-engineering-uninstaller'));
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

main();