import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve assets directory - works in both dev and production
const resolveAssetsDir = (): string => {
  // Try multiple potential locations
  const candidates: string[] = [
    path.join(__dirname, '../../assets'),      // dist/src/utils -> dist/assets
    path.join(__dirname, '../assets'),         // dist/utils -> dist/assets
    path.join(__dirname, '../../../assets'),   // Development: src/utils -> cli/assets
    path.join(process.cwd(), 'cli/assets'),    // CWD fallback
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Default to first candidate (will show helpful error if missing)
  return candidates[0];
};

const ASSETS_DIR = resolveAssetsDir();

export type AssetType = 'skills' | 'agents' | 'commands' | 'mcp';

export interface AssetMetadata {
  name: string;
  type: AssetType;
  isDirectory: boolean;
  hasReadme: boolean;
  fileCount?: number;
  size?: number;
}

/**
 * Clean JSONC (JSON with Comments) content for parsing
 * Handles: single-line comments, multi-line comments, trailing commas, control characters
 * Preserves // inside quoted strings (like URLs)
 */
function cleanJsonc(content: string): string {
  // First, remove control characters except newlines and tabs
  let cleaned = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // To safely remove comments without affecting strings, we process character by character
  let result = '';
  let inString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let i = 0;
  
  while (i < cleaned.length) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];
    
    // Handle escape sequences in strings
    if (inString && char === '\\' && i + 1 < cleaned.length) {
      result += char + nextChar;
      i += 2;
      continue;
    }
    
    // Toggle string mode on unescaped quotes
    if (char === '"' && !inSingleLineComment && !inMultiLineComment) {
      inString = !inString;
      result += char;
      i++;
      continue;
    }
    
    // Inside a string, just copy characters
    if (inString) {
      result += char;
      i++;
      continue;
    }
    
    // Check for end of single-line comment
    if (inSingleLineComment) {
      if (char === '\n') {
        inSingleLineComment = false;
        result += char; // Keep newline for line counting
      }
      i++;
      continue;
    }
    
    // Check for end of multi-line comment
    if (inMultiLineComment) {
      if (char === '*' && nextChar === '/') {
        inMultiLineComment = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    
    // Check for start of comments
    if (char === '/') {
      if (nextChar === '/') {
        inSingleLineComment = true;
        i += 2;
        continue;
      }
      if (nextChar === '*') {
        inMultiLineComment = true;
        i += 2;
        continue;
      }
    }
    
    // Regular character outside of strings and comments
    result += char;
    i++;
  }
  
  // Remove trailing commas before } or ]
  return result.replace(/,(\s*[}\]])/g, '$1').trim();
}

/**
 * List all assets of a given type
 */
export async function listAssets(type: AssetType): Promise<string[]> {
  if (type === 'mcp') {
    const mcpPath = path.join(ASSETS_DIR, 'mcp.json');
    if (!await fs.pathExists(mcpPath)) {
      return [];
    }
    try {
      const content = await fs.readFile(mcpPath, 'utf-8');
      const cleanedContent = cleanJsonc(content);
      const mcp = JSON.parse(cleanedContent);
      return Object.keys(mcp.servers || {});
    } catch (err) {
      console.error('Error parsing mcp.json:', err);
      return [];
    }
  }

  const dir = path.join(ASSETS_DIR, type);
  if (!await fs.pathExists(dir)) {
    return [];
  }

  const items: string[] = await fs.readdir(dir);
  return items
    .filter((item: string) => !item.startsWith('.'))
    .sort((a: string, b: string) => a.localeCompare(b));
}

/**
 * Get metadata about an asset
 */
export async function getAssetMetadata(type: AssetType, name: string): Promise<AssetMetadata> {
  const metadata: AssetMetadata = {
    name,
    type,
    isDirectory: false,
    hasReadme: false,
  };

  if (type === 'mcp') {
    return metadata;
  }

  const itemPath = path.join(ASSETS_DIR, type, name);
  try {
    const stat = await fs.stat(itemPath);
    metadata.isDirectory = stat.isDirectory();
    metadata.size = stat.size;

    if (stat.isDirectory()) {
      const files: string[] = await fs.readdir(itemPath);
      metadata.fileCount = files.length;
      metadata.hasReadme = files.some((f: string) => f.toLowerCase() === 'readme.md');
    }
  } catch {
    // Item doesn't exist or can't be read
  }

  return metadata;
}

/**
 * Get the content of an asset for preview
 */
export async function getAssetContent(type: AssetType, name: string): Promise<string | object> {
  if (type === 'mcp') {
    const mcpPath = path.join(ASSETS_DIR, 'mcp.json');
    try {
      const content = await fs.readFile(mcpPath, 'utf-8');
      const cleanedContent = cleanJsonc(content);
      const mcp = JSON.parse(cleanedContent);
      const serverConfig = mcp.servers?.[name];
      if (!serverConfig) {
        throw new Error(`MCP server "${name}" not found`);
      }
      return serverConfig;
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) {
        throw err;
      }
      throw new Error(`Failed to parse mcp.json: ${err}`);
    }
  }

  const itemPath = path.join(ASSETS_DIR, type, name);
  
  if (!await fs.pathExists(itemPath)) {
    throw new Error(`Asset "${name}" not found in ${type}`);
  }

  const stat = await fs.stat(itemPath);

  if (stat.isDirectory()) {
    const files: string[] = await fs.readdir(itemPath);
    
    // Try to find and return README content
    const readmeFile = files.find((f: string) => f.toLowerCase() === 'readme.md');
    if (readmeFile) {
      return await fs.readFile(path.join(itemPath, readmeFile), 'utf-8');
    }

    // Try to find and return the main file (instructions.md, prompt.md, etc.)
    const mainFiles = ['instructions.md', 'prompt.md', 'index.md', 'main.md'];
    for (const mainFile of mainFiles) {
      if (files.some((f: string) => f.toLowerCase() === mainFile.toLowerCase())) {
        return await fs.readFile(path.join(itemPath, mainFile), 'utf-8');
      }
    }

    // Return directory listing with file info
    const fileList = await Promise.all(
      files.map(async (file: string) => {
        const filePath = path.join(itemPath, file);
        const fileStat = await fs.stat(filePath);
        const icon = fileStat.isDirectory() ? '📁' : '📄';
        return `${icon} ${file}`;
      })
    );

    return `Directory contents:\n${'─'.repeat(40)}\n${fileList.join('\n')}`;
  } else {
    return await fs.readFile(itemPath, 'utf-8');
  }
}

/**
 * Install an asset to the target directory
 */
export async function installAsset(
  type: AssetType, 
  name: string, 
  targetDir: string = process.cwd()
): Promise<void> {
  // Validate target directory
  if (!await fs.pathExists(targetDir)) {
    throw new Error(`Target directory does not exist: ${targetDir}`);
  }

  if (type === 'mcp') {
    const mcpConfig = await getAssetContent('mcp', name);
    const targetMcpPath = path.join(targetDir, '.vscode', 'mcp.json');
    
    await fs.ensureDir(path.dirname(targetMcpPath));

    let targetMcp: { servers: Record<string, unknown> } = { servers: {} };
    
    if (await fs.pathExists(targetMcpPath)) {
      try {
        const content = await fs.readFile(targetMcpPath, 'utf-8');
        const cleanedContent = cleanJsonc(content);
        targetMcp = JSON.parse(cleanedContent);
        if (!targetMcp.servers) {
          targetMcp.servers = {};
        }
      } catch {
        // If parsing fails, start fresh but warn
        console.warn('Warning: Could not parse existing mcp.json, creating new file');
        targetMcp = { servers: {} };
      }
    }

    // Check if server already exists
    if (targetMcp.servers[name]) {
      // Merge/update the existing config
      console.log(`Updating existing MCP server: ${name}`);
    }

    targetMcp.servers[name] = mcpConfig;
    await fs.writeJson(targetMcpPath, targetMcp, { spaces: 2 });
    return;
  }

  const sourcePath = path.join(ASSETS_DIR, type, name);
  
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`Source asset not found: ${type}/${name}`);
  }

  // Determine target path based on asset type
  const targetSubDir = path.join('.github', type);
  const targetPath = path.join(targetDir, targetSubDir, name);

  // Check if target already exists
  if (await fs.pathExists(targetPath)) {
    // Create backup with timestamp
    const backupPath = `${targetPath}.backup.${Date.now()}`;
    await fs.move(targetPath, backupPath);
    console.log(`Existing asset backed up to: ${backupPath}`);
  }

  await fs.ensureDir(path.dirname(targetPath));
  await fs.copy(sourcePath, targetPath, { overwrite: true });
}

/**
 * Check if assets directory is properly configured
 */
export function validateAssetsDirectory(): { valid: boolean; path: string; error?: string } {
  const exists = fs.existsSync(ASSETS_DIR);
  return {
    valid: exists,
    path: ASSETS_DIR,
    error: exists ? undefined : `Assets directory not found at: ${ASSETS_DIR}`,
  };
}
