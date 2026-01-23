#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './app.js';
import { validateAssetsDirectory, listAssets, installAsset, AssetType, Platform } from './utils/assets.js';

const cli = meow(`
  Context Engineering CLI - Browse and install AI assets

  Usage
    $ context-cli                     Interactive mode
    $ context-cli list <type>         List assets of a type
    $ context-cli install <type> <name>  Install an asset

  Types
    skills    - Reusable AI skill prompts
    agents    - Autonomous AI agents  
    commands  - Slash commands for quick actions
    mcp       - Model Context Protocol servers

  Options
    --target, -t     Target directory for installation (default: current directory)
    --platform, -p    Target platform: github | opencode (default: github)
    --help           Show this help message
    --version        Show version number

  Examples
    $ context-cli
    $ context-cli list skills
    $ context-cli install agents code-review-expert
    $ context-cli install mcp context7 --target ./my-project
    $ context-cli install skills algorithmic-art --platform opencode
`, {
  importMeta: import.meta,
  flags: {
    target: {
      type: 'string',
      shortFlag: 't',
      default: process.cwd(),
    },
    platform: {
      type: 'string',
      shortFlag: 'p',
      default: 'github',
    },
  },
});

async function runListCommand(type: string): Promise<void> {
  const validTypes: AssetType[] = ['skills', 'agents', 'commands', 'mcp'];
  
  if (!validTypes.includes(type as AssetType)) {
    console.error(`Invalid type: ${type}`);
    console.error(`Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  try {
    const items = await listAssets(type as AssetType);
    if (items.length === 0) {
      console.log(`No ${type} found.`);
    } else {
      console.log(`\n${type.charAt(0).toUpperCase() + type.slice(1)} (${items.length}):\n`);
      items.forEach(item => console.log(`  • ${item}`));
      console.log('');
    }
  } catch (err) {
    console.error(`Error listing ${type}:`, err);
    process.exit(1);
  }
}

async function runInstallCommand(type: string, name: string, targetDir: string, platform: string): Promise<void> {
  const validTypes: AssetType[] = ['skills', 'agents', 'commands', 'mcp'];
  
  if (!validTypes.includes(type as AssetType)) {
    console.error(`Invalid type: ${type}`);
    console.error(`Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  if (!name) {
    console.error('Please specify an asset name to install.');
    process.exit(1);
  }

  const selectedPlatform: Platform = platform === 'opencode' ? 'opencode' : 'github';

  try {
    console.log(`Installing ${type}/${name} for ${selectedPlatform}...`);
    await installAsset(type as AssetType, name, { platform: selectedPlatform, targetDir });
    console.log(`✔ Successfully installed ${name}`);
    
    if (type === 'mcp') {
      if (selectedPlatform === 'opencode') {
        console.log(`  → Added to opencode.json`);
        console.log(`  → Restart OpenCode to activate`);
      } else {
        console.log(`  → Added to .vscode/mcp.json`);
        console.log(`  → Restart VS Code to activate`);
      }
    } else {
      if (selectedPlatform === 'opencode') {
        console.log(`  → Installed to .opencode/${type}/${name}`);
      } else {
        console.log(`  → Installed to .github/${type}/${name}`);
      }
    }
  } catch (err) {
    console.error(`✘ Error installing ${name}:`, err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

async function runInteractive(): Promise<void> {
  if (!process.stdin.isTTY) {
    console.error('Interactive mode requires a TTY terminal.');
    console.error('Use "context-cli list <type>" or "context-cli install <type> <name>" instead.');
    process.exit(1);
  }

  render(<App />);
}

async function main(): Promise<void> {
  const validation = validateAssetsDirectory();
  if (!validation.valid) {
    console.error(`Assets not found: ${validation.error}`);
    console.error('Make sure to run bundle script first: npm run bundle');
    process.exit(1);
  }

  const [command, ...args] = cli.input;

  switch (command) {
    case 'list':
      await runListCommand(args[0]);
      break;
    
    case 'install':
      await runInstallCommand(args[0], args[1], cli.flags.target, cli.flags.platform);
      break;
    
    case undefined:
      await runInteractive();
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      console.log(cli.help);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
