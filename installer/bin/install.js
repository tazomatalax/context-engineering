#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

function main() {
  console.log(chalk.blue('🚀 Installing Context Engineering Toolkit...'));

  // 1. Define source and destination paths
  const sourceToolkitDir = path.resolve(__dirname, '..', 'toolkit');
  const destinationDir = process.cwd(); // User's current project directory

  // 2. Safely copy the entire toolkit
  try {
    fs.copySync(sourceToolkitDir, destinationDir, {
      overwrite: false, // IMPORTANT: Do not overwrite existing user files
      errorOnExist: false
    });
    console.log(chalk.green('✅ Toolkit files copied successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Installation failed:'), error);
    process.exit(1);
  }

  // 3. Print the "Next Steps" message
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

main();