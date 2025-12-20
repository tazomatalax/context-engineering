import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// cli/scripts -> cli -> context-engineering (project root)
const ROOT = path.resolve(__dirname, '../..');
const CLI_ROOT = path.resolve(__dirname, '..');
const DIST_ASSETS = path.join(CLI_ROOT, 'dist', 'assets');
const DEV_ASSETS = path.join(CLI_ROOT, 'assets');

/**
 * Parse JSONC (JSON with comments and trailing commas)
 */
function parseJsonc(content: string): unknown {
  // Normalize line endings
  let cleaned = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Remove single-line comments (careful not to match // in URLs)
  cleaned = cleaned.replace(/(^|\s)\/\/.*$/gm, '$1');
  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(cleaned);
}

interface BundleResult {
  type: string;
  count: number;
  success: boolean;
  error?: string;
}

async function copyAssetFolder(
  source: string, 
  dest: string, 
  type: string
): Promise<BundleResult> {
  try {
    if (!await fs.pathExists(source)) {
      return { type, count: 0, success: true };
    }

    await fs.ensureDir(dest);
    await fs.copy(source, dest, { 
      overwrite: true,
      filter: (src) => {
        // Skip hidden files and node_modules
        const basename = path.basename(src);
        return !basename.startsWith('.') && basename !== 'node_modules';
      }
    });

    const items = await fs.readdir(dest);
    return { type, count: items.length, success: true };
  } catch (err) {
    return { 
      type, 
      count: 0, 
      success: false, 
      error: err instanceof Error ? err.message : String(err) 
    };
  }
}

async function bundle(): Promise<void> {
  console.log('🔄 Bundling Context Engineering assets...\n');
  console.log(`   Source: ${ROOT}`);
  console.log(`   Target: ${DIST_ASSETS}`);
  console.log(`   Dev:    ${DEV_ASSETS}\n`);

  const results: BundleResult[] = [];

  // Ensure directories exist
  await fs.ensureDir(DIST_ASSETS);
  await fs.ensureDir(DEV_ASSETS);

  // Copy .github asset folders
  const githubDir = path.join(ROOT, '.github');
  const assetTypes = ['skills', 'agents', 'commands'];

  for (const type of assetTypes) {
    const source = path.join(githubDir, type);
    
    // Copy to both dist and dev assets
    const distResult = await copyAssetFolder(source, path.join(DIST_ASSETS, type), type);
    await copyAssetFolder(source, path.join(DEV_ASSETS, type), type);
    
    results.push(distResult);
  }

  // Copy MCP config
  const mcpSource = path.join(ROOT, '.vscode/mcp.json');
  try {
    if (await fs.pathExists(mcpSource)) {
      await fs.copy(mcpSource, path.join(DIST_ASSETS, 'mcp.json'));
      await fs.copy(mcpSource, path.join(DEV_ASSETS, 'mcp.json'));
      
      // Count MCP servers - just count top-level "key": patterns after "servers"
      const content = await fs.readFile(mcpSource, 'utf-8');
      const serversMatch = content.match(/"servers"\s*:\s*\{([^]*)\}/);
      if (serversMatch) {
        // Count keys by finding patterns like "key":
        const serverKeys = serversMatch[1].match(/"[^"]+"\s*:\s*\{/g) || [];
        results.push({ type: 'mcp', count: serverKeys.length, success: true });
      } else {
        results.push({ type: 'mcp', count: 0, success: true });
      }
    } else {
      results.push({ type: 'mcp', count: 0, success: true });
    }
  } catch (err) {
    results.push({ 
      type: 'mcp', 
      count: 0, 
      success: false, 
      error: err instanceof Error ? err.message : String(err) 
    });
  }

  // Copy core templates
  const templates = [
    { src: 'AGENTS.md', dest: 'AGENTS.md', root: ROOT },
    { src: 'context/setup.ps1', dest: 'setup.ps1', root: ROOT }
  ];

  for (const template of templates) {
    const source = path.join(template.root, template.src);
    try {
      if (await fs.pathExists(source)) {
        await fs.copy(source, path.join(DIST_ASSETS, template.dest));
        await fs.copy(source, path.join(DEV_ASSETS, template.dest));
        results.push({ type: template.dest, count: 1, success: true });
      }
    } catch (err) {
      results.push({ 
        type: template.dest, 
        count: 0, 
        success: false, 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  }

  // Print results
  console.log('📦 Bundle Results:\n');
  
  let totalItems = 0;
  let hasErrors = false;

  for (const result of results) {
    if (result.success) {
      const icon = result.count > 0 ? '✅' : '⚠️';
      console.log(`   ${icon} ${result.type}: ${result.count} items`);
      totalItems += result.count;
    } else {
      console.log(`   ❌ ${result.type}: Failed - ${result.error}`);
      hasErrors = true;
    }
  }

  console.log(`\n   Total: ${totalItems} assets bundled`);
  
  if (hasErrors) {
    console.log('\n⚠️  Some assets failed to bundle. Check errors above.');
    process.exit(1);
  } else {
    console.log('\n✨ Assets bundled successfully!');
  }
}

bundle().catch(err => {
  console.error('Bundle failed:', err);
  process.exit(1);
});
