import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = resolveAssetsDir();

export type Platform = 'github' | 'opencode';
export type AssetType = 'skills' | 'agents' | 'commands' | 'mcp';

export interface InstallOptions {
  platform: Platform;
  targetDir: string;
}

export interface AssetMetadata {
  name: string;
  type: AssetType;
  isDirectory: boolean;
  hasReadme: boolean;
  fileCount?: number;
  size?: number;
}

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
  agent?: Record<string, unknown>;
  permission?: Record<string, unknown>;
  command?: Record<string, unknown>;
}

const PLATFORM_PATHS: Record<Platform, Record<AssetType, (dir: string, name?: string) => string>> = {
  github: {
    skills: (dir, name) => path.join(dir, '.github', 'skills', name || ''),
    agents: (dir, name) => path.join(dir, '.github', 'agents', `${name}.md`),
    commands: (dir, name) => path.join(dir, '.github', 'commands', name || ''),
    mcp: (dir) => path.join(dir, '.vscode', 'mcp.json')
  },
  opencode: {
    skills: (dir, name) => path.join(dir, '.opencode', 'skills', name || ''),
    agents: (dir, name) => path.join(dir, '.opencode', 'agents', `${name}.md`),
    commands: (dir, name) => path.join(dir, '.opencode', 'commands', `${name}.md`),
    mcp: (dir) => path.join(dir, 'opencode.json')
  }
};

function resolveAssetsDir(): string {
  const candidates: string[] = [
    path.join(__dirname, '../../assets'),
    path.join(__dirname, '../assets'),
    path.join(__dirname, '../../../assets'),
    path.join(process.cwd(), 'cli/assets'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function cleanJsonc(content: string): string {
  let cleaned = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  let result = '';
  let inString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let i = 0;
  
  while (i < cleaned.length) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];
    
    if (inString && char === '\\' && i + 1 < cleaned.length) {
      result += char + nextChar;
      i += 2;
      continue;
    }
    
    if (char === '"' && !inSingleLineComment && !inMultiLineComment) {
      inString = !inString;
      result += char;
      i++;
      continue;
    }
    
    if (inString) {
      result += char;
      i++;
      continue;
    }
    
    if (inSingleLineComment) {
      if (char === '\n') {
        inSingleLineComment = false;
        result += char;
      }
      i++;
      continue;
    }
    
    if (inMultiLineComment) {
      if (char === '*' && nextChar === '/') {
        inMultiLineComment = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    
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
    
    result += char;
    i++;
  }
  
  return result.replace(/,(\s*[}\]])/g, '$1').trim();
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

async function convertAgentForOpenCode(sourcePath: string): Promise<string> {
  const content = await fs.readFile(sourcePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) return content;
  
  let frontmatter = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);
  
  frontmatter = frontmatter
    .replace(/^name:.*$/m, '')
    .replace(/^category:.*$/m, '')
    .replace(/^displayName:.*$/m, '')
    .replace(/^color:.*$/m, '')
    .replace(/^bundle:.*$/m, '')
    .replace(/^model:.*$/m, '')
    .replace(/^tools:.*$/m, 'mode: subagent');
  
  frontmatter += '\ntools:\n  read: true\n  write: false\n  edit: false\n  bash: false';
  
  return `---\n${frontmatter}---\n${body}`;
}

async function convertCommandForOpenCode(sourcePath: string): Promise<string> {
  const content = await fs.readFile(sourcePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) return content;
  
  let frontmatter = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);
  
  frontmatter = frontmatter
    .replace(/^category:.*$/m, '')
    .replace(/^allowed-tools:.*$/m, '')
    .replace(/^argument-hint:.*$/m, '')
    .replace(/^model:.*$/m, '')
    .replace(/^---\n$/, 'agent: build\n---');
  
  return frontmatter + body;
}

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
    .map((item: string) => (type === 'agents' || type === 'commands') && item.endsWith('.md') ? item.slice(0, -3) : item)
    .sort((a: string, b: string) => a.localeCompare(b));
}

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
  }

  return metadata;
}

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
    
    const readmeFile = files.find((f: string) => f.toLowerCase() === 'readme.md');
    if (readmeFile) {
      return await fs.readFile(path.join(itemPath, readmeFile), 'utf-8');
    }

    const mainFiles = ['SKILL.md', 'instructions.md', 'prompt.md', 'index.md', 'main.md'];
    for (const mainFile of mainFiles) {
      if (files.some((f: string) => f.toLowerCase() === mainFile.toLowerCase())) {
        return await fs.readFile(path.join(itemPath, mainFile), 'utf-8');
      }
    }

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

async function installMcpForVsCode(name: string, targetDir: string): Promise<void> {
  const mcpConfig = await getAssetContent('mcp', name) as VsCodeMcpServer;
  const targetMcpPath = PLATFORM_PATHS.github.mcp(targetDir);
  
  await fs.ensureDir(path.dirname(targetMcpPath));
  
  let targetMcp: VsCodeMcpConfig = { servers: {} };
  
  if (await fs.pathExists(targetMcpPath)) {
    try {
      const content = await fs.readFile(targetMcpPath, 'utf-8');
      const cleanedContent = cleanJsonc(content);
      targetMcp = JSON.parse(cleanedContent);
      if (!targetMcp.servers) {
        targetMcp.servers = {};
      }
    } catch {
      console.warn('Warning: Could not parse existing mcp.json, creating new file');
      targetMcp = { servers: {} };
    }
  }

  if (targetMcp.servers[name]) {
    console.log(`Updating existing MCP server: ${name}`);
  }

  targetMcp.servers[name] = mcpConfig;
  await fs.writeJson(targetMcpPath, targetMcp, { spaces: 2 });
}

async function installMcpForOpenCode(name: string, targetDir: string): Promise<void> {
  const mcpConfig = await getAssetContent('mcp', name) as VsCodeMcpServer;
  const openCodeConfig = convertVsCodeMcpToOpenCode(mcpConfig);
  const targetPath = PLATFORM_PATHS.opencode.mcp(targetDir);
  
  await fs.ensureDir(path.dirname(targetPath));
  
  const targetConfig = await readExistingOpenCodeConfig(targetPath);
  
  if (targetConfig.mcp[name]) {
    console.log(`Updating existing MCP server: ${name}`);
  }
  
  targetConfig.mcp[name] = openCodeConfig;
  await fs.writeJson(targetPath, targetConfig, { spaces: 2 });
}

async function readExistingOpenCodeConfig(targetPath: string): Promise<OpenCodeMcpConfig> {
  if (!await fs.pathExists(targetPath)) {
    return {
      $schema: 'https://opencode.ai/config.json',
      mcp: {}
    };
  }
  
  try {
    return await fs.readJson(targetPath);
  } catch {
    try {
      const content = await fs.readFile(targetPath, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        $schema: 'https://opencode.ai/config.json',
        mcp: parsed.mcp || {},
        ...(parsed.agent && { agent: parsed.agent }),
        ...(parsed.permission && { permission: parsed.permission }),
        ...(parsed.command && { command: parsed.command })
      };
    } catch {
      return {
        $schema: 'https://opencode.ai/config.json',
        mcp: {}
      };
    }
  }
}

async function installSkill(name: string, platform: Platform, targetDir: string): Promise<void> {
  const sourcePath = path.join(ASSETS_DIR, 'skills', name);
  const targetPath = PLATFORM_PATHS[platform].skills(targetDir, name);
  
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`Source skill not found: ${name}`);
  }

  await fs.ensureDir(path.dirname(targetPath));
  
  if (await fs.pathExists(targetPath)) {
    const backupPath = `${targetPath}.backup.${Date.now()}`;
    await fs.move(targetPath, backupPath);
    console.log(`Existing asset backed up to: ${backupPath}`);
  }
  
  await fs.copy(sourcePath, targetPath, { overwrite: true });
}

async function findAgentSource(name: string): Promise<string> {
  // Try direct path first
  const directPath = path.join(ASSETS_DIR, 'agents', name + '.md');
  if (await fs.pathExists(directPath)) {
    return directPath;
  }
  
  // Search in subdirectories
  const agentsDir = path.join(ASSETS_DIR, 'agents');
  const subdirs = await fs.readdir(agentsDir);
  
  for (const item of subdirs) {
    const itemPath = path.join(agentsDir, item);
    const stat = await fs.stat(itemPath);
    
    if (stat.isDirectory()) {
      const candidatePath = path.join(itemPath, name + '.md');
      if (await fs.pathExists(candidatePath)) {
        return candidatePath;
      }
    }
  }
  
  throw new Error(`Source agent not found: ${name}`);
}

async function installAgentForGithub(name: string, targetDir: string): Promise<void> {
  const sourcePath = await findAgentSource(name);
  const targetPath = PLATFORM_PATHS.github.agents(targetDir, name);
  
  await fs.ensureDir(path.dirname(targetPath));
  
  if (await fs.pathExists(targetPath)) {
    const backupPath = `${targetPath}.backup.${Date.now()}`;
    await fs.move(targetPath, backupPath);
    console.log(`Existing asset backed up to: ${backupPath}`);
  }
  
  await fs.copy(sourcePath, targetPath, { overwrite: true });
}

async function installAgentForOpenCode(name: string, targetDir: string): Promise<void> {
  const sourcePath = await findAgentSource(name);
  const targetPath = PLATFORM_PATHS.opencode.agents(targetDir, name);
  
  const convertedContent = await convertAgentForOpenCode(sourcePath);
  
  await fs.ensureDir(path.dirname(targetPath));
  
  if (await fs.pathExists(targetPath)) {
    const backupPath = `${targetPath}.backup.${Date.now()}`;
    await fs.move(targetPath, backupPath);
    console.log(`Existing asset backed up to: ${backupPath}`);
  }
  
  await fs.writeFile(targetPath, convertedContent, 'utf-8');
}

async function installCommandForGithub(name: string, targetDir: string): Promise<void> {
  const sourcePath = path.join(ASSETS_DIR, 'commands', name);
  const targetPath = PLATFORM_PATHS.github.commands(targetDir, name);
  
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`Source command not found: ${name}`);
  }

  await fs.ensureDir(path.dirname(targetPath));
  
  if (await fs.pathExists(targetPath)) {
    const backupPath = `${targetPath}.backup.${Date.now()}`;
    await fs.move(targetPath, backupPath);
    console.log(`Existing asset backed up to: ${backupPath}`);
  }
  
  await fs.copy(sourcePath, targetPath, { overwrite: true });
}

async function installCommandForOpenCode(name: string, targetDir: string): Promise<void> {
  const sourcePath = path.join(ASSETS_DIR, 'commands', name);
  const targetPath = PLATFORM_PATHS.opencode.commands(targetDir, name);
  
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`Source command not found: ${name}`);
  }

  const stat = await fs.stat(sourcePath);
  
  await fs.ensureDir(path.dirname(targetPath));
  
  if (await fs.pathExists(targetPath)) {
    const backupPath = `${targetPath}.backup.${Date.now()}`;
    await fs.move(targetPath, backupPath);
    console.log(`Existing asset backed up to: ${backupPath}`);
  }
  
  if (stat.isDirectory()) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
  } else {
    const convertedContent = await convertCommandForOpenCode(sourcePath);
    await fs.writeFile(targetPath, convertedContent, 'utf-8');
  }
}

export async function installAsset(
  type: AssetType,
  name: string,
  options: InstallOptions = { platform: 'github', targetDir: process.cwd() }
): Promise<void> {
  const { platform, targetDir } = options;
  
  if (!await fs.pathExists(targetDir)) {
    throw new Error(`Target directory does not exist: ${targetDir}`);
  }

  if (type === 'mcp') {
    if (platform === 'github') {
      return await installMcpForVsCode(name, targetDir);
    } else {
      return await installMcpForOpenCode(name, targetDir);
    }
  }

  if (type === 'skills') {
    return await installSkill(name, platform, targetDir);
  }

  if (type === 'agents') {
    if (platform === 'github') {
      return await installAgentForGithub(name, targetDir);
    } else {
      return await installAgentForOpenCode(name, targetDir);
    }
  }

  if (type === 'commands') {
    if (platform === 'github') {
      return await installCommandForGithub(name, targetDir);
    } else {
      return await installCommandForOpenCode(name, targetDir);
    }
  }
}

export function validateAssetsDirectory(): { valid: boolean; path: string; error?: string } {
  const exists = fs.existsSync(ASSETS_DIR);
  return {
    valid: exists,
    path: ASSETS_DIR,
    error: exists ? undefined : `Assets directory not found at: ${ASSETS_DIR}`,
  };
}
