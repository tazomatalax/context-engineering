import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');
const CLI_ROOT = path.resolve(__dirname, '..');
const DIST_ASSETS = path.join(CLI_ROOT, 'dist', 'assets');
const DEV_ASSETS = path.join(CLI_ROOT, 'assets');

interface VsCodeMcpServer {
  type: 'stdio' | 'http';
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  gallery?: string;
  version?: string;
}

interface VsCodeMcpConfig {
  servers: Record<string, VsCodeMcpServer>;
}

interface OpenCodeMcpServer {
  type: 'local' | 'remote';
  command?: string[];
  url?: string;
  environment?: Record<string, string>;
  oauth?: Record<string, unknown>;
  enabled: boolean;
}

interface OpenCodeMcpConfig {
  $schema: string;
  mcp: Record<string, OpenCodeMcpServer>;
}

function parseJsonc(content: string): unknown {
  let cleaned = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  cleaned = cleaned.replace(/(^|\s)\/\/.*$/gm, '$1');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(cleaned);
}

function convertVsCodeMcpToOpenCode(mcpServer: VsCodeMcpServer): OpenCodeMcpServer {
  const serverType = mcpServer.type === 'stdio' ? 'local' : mcpServer.type === 'http' ? 'remote' : 'local';
  
  return {
    type: serverType,
    ...(mcpServer.command && mcpServer.args && {
      command: [mcpServer.command, ...mcpServer.args]
    }),
    ...(mcpServer.url && { url: mcpServer.url }),
    ...(mcpServer.env && {
      environment: Object.fromEntries(
        Object.entries(mcpServer.env).map(([k, v]) => [k, `{env:${k}}`])
      )
    }),
    ...(mcpServer.gallery && { gallery: mcpServer.gallery }),
    enabled: true
  };
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

  await fs.ensureDir(DIST_ASSETS);
  await fs.ensureDir(DEV_ASSETS);

  const githubDir = path.join(ROOT, '.github');
  const assetTypes = ['skills', 'agents', 'commands'];

  for (const type of assetTypes) {
    const source = path.join(githubDir, type);
    
    const distResult = await copyAssetFolder(source, path.join(DIST_ASSETS, type), type);
    await copyAssetFolder(source, path.join(DEV_ASSETS, type), type);
    
    results.push(distResult);
  }

  const mcpSource = path.join(ROOT, '.vscode/mcp.json');
  try {
    if (await fs.pathExists(mcpSource)) {
      await fs.copy(mcpSource, path.join(DIST_ASSETS, 'mcp.json'));
      await fs.copy(mcpSource, path.join(DEV_ASSETS, 'mcp.json'));
      
      const content = await fs.readFile(mcpSource, 'utf-8');
      try {
        const mcp = parseJsonc(content) as VsCodeMcpConfig;
        const count = mcp.servers ? Object.keys(mcp.servers).length : 0;
        results.push({ type: 'mcp (VS Code)', count, success: true });
        
        const openCodeConfig: OpenCodeMcpConfig = {
          $schema: 'https://opencode.ai/config.json',
          mcp: {}
        };
        
        for (const [name, server] of Object.entries(mcp.servers || {})) {
          openCodeConfig.mcp[name] = convertVsCodeMcpToOpenCode(server);
        }
        
        await fs.writeJson(path.join(DIST_ASSETS, 'opencode.json'), openCodeConfig, { spaces: 2 });
        await fs.writeJson(path.join(DEV_ASSETS, 'opencode.json'), openCodeConfig, { spaces: 2 });
        
        results.push({ type: 'mcp (OpenCode)', count, success: true });
      } catch (e) {
        console.warn('Failed to parse MCP config:', e);
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
