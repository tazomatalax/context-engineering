import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { listAssets, getAssetContent, installAsset, AssetType, Platform } from './utils/assets.js';

type View = 'HOME' | 'TARGET' | 'LIST' | 'PREVIEW' | 'INSTALLING' | 'SUCCESS' | 'ERROR';

const THEME = {
  primary: 'green',
  secondary: 'cyan',
  accent: 'yellow',
  error: 'red',
  muted: 'gray',
} as const;

interface Category {
  label: string;
  value: AssetType;
  icon: string;
  description: string;
}

interface TargetOption {
  label: string;
  value: Platform;
  description: string;
}

const CATEGORIES: Category[] = [
  { label: '⚡ Skills', value: 'skills', icon: '⚡', description: 'Reusable AI skill prompts' },
  { label: '🤖 Agents', value: 'agents', icon: '🤖', description: 'Autonomous AI agents' },
  { label: '⌘  Commands', value: 'commands', icon: '⌘', description: 'Slash commands for quick actions' },
  { label: '🔌 MCP Servers', value: 'mcp', icon: '🔌', description: 'Model Context Protocol servers' },
];

const TARGET_OPTIONS: TargetOption[] = [
  { label: '🤖 GitHub Copilot', value: 'github', description: '.github/ + .vscode/mcp.json' },
  { label: '🔓 OpenCode', value: 'opencode', description: '.opencode/ + opencode.json' },
];

const PREVIEW_LINES = 15;

const Header: React.FC = () => (
  <Box flexDirection="column">
    <Text color={THEME.primary} bold>
      ╔══════════════════════════════════════╗
    </Text>
    <Text color={THEME.primary} bold>
      ║   Context Engineering CLI  v2.0.5        ║
    </Text>
    <Text color={THEME.primary} bold>
      ╚══════════════════════════════════════╝
    </Text>
  </Box>
);

const Breadcrumb: React.FC<{ path: string[] }> = ({ path }) => (
  <Box>
    <Text dimColor>{path.join(' › ')}</Text>
  </Box>
);

const StatusBar: React.FC<{ hints: string[] }> = ({ hints }) => (
  <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
    <Text dimColor>{hints.join('  │  ')}</Text>
  </Box>
);

const App: React.FC = () => {
  const { exit } = useApp();
  const [view, setView] = useState<View>('HOME');
  const [category, setCategory] = useState<AssetType | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewScroll, setPreviewScroll] = useState(0);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>('github');

  useEffect(() => {
    if (view === 'LIST' && category) {
      listAssets(category)
        .then((i: string[]) => setItems(i))
        .catch((err: Error) => {
          setError(err.message);
          setView('ERROR');
        });
    }
  }, [view, category]);

  useEffect(() => {
    if (view === 'PREVIEW' && category && selectedItem) {
      setPreviewScroll(0);
      getAssetContent(category, selectedItem)
        .then((content: string | object) => {
          setPreviewContent(
            typeof content === 'object' 
              ? JSON.stringify(content, null, 2)
              : content
          );
        })
        .catch((err: Error) => {
          setPreviewContent(`Error loading preview: ${err.message}`);
        });
    }
  }, [view, category, selectedItem]);

  useInput((input, key) => {
    if (view === 'HOME' && (input === 'q' || key.escape)) {
      exit();
    }

    if (view === 'HOME' && input === 't') {
      setView('TARGET');
    }

    if (view === 'TARGET' && (input === 'q' || key.escape)) {
      setView('HOME');
    }

    if (view === 'PREVIEW') {
      if (key.upArrow) {
        setPreviewScroll((prev: number) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setPreviewScroll((prev: number) => prev + 1);
      } else if (key.escape) {
        setView('LIST');
      } else if (key.return || input === 'i') {
        setView('INSTALLING');
        installAsset(category!, selectedItem!, { platform, targetDir: process.cwd() })
          .then(() => {
            setMessage(`Successfully installed "${selectedItem}"`);
            setView('SUCCESS');
          })
          .catch((err: Error) => {
            setError(err.message);
            setView('ERROR');
          });
      }
    }

    if ((view === 'SUCCESS' || view === 'ERROR') && (key.return || key.escape)) {
      setView('HOME');
      setCategory(null);
      setSelectedItem(null);
      setError('');
      setMessage('');
    }

    if (view === 'LIST' && key.escape) {
      setView('HOME');
      setCategory(null);
    }
  });

  const breadcrumbPath = useMemo(() => {
    const path = ['Home'];
    if (view === 'TARGET') {
      path.push('Target');
    }
    if (category) {
      path.push(CATEGORIES.find(c => c.value === category)?.label.replace(/^[^\s]+\s/, '') || category);
    }
    if (selectedItem) {
      path.push(selectedItem);
    }
    return path;
  }, [category, selectedItem, view]);

  const handleCategorySelect = (item: { value: string }) => {
    setCategory(item.value as AssetType);
    setView('LIST');
  };

  const handleItemSelect = (item: { value: string }) => {
    setSelectedItem(item.value);
    setView('PREVIEW');
  };

  const handleTargetSelect = (item: { value: string }) => {
    setPlatform(item.value as Platform);
    setView('HOME');
  };

  if (view === 'HOME') {
    const categoryItems = CATEGORIES.map(cat => ({
      label: cat.label,
      value: cat.value,
    }));

    return (
      <Box flexDirection="column" padding={1}>
        <Header />
        <Box paddingX={1}>
          <Text dimColor>Target: </Text>
          <Text color={THEME.accent} bold>
            {platform === 'github' ? '🤖 GitHub Copilot' : '🔓 OpenCode'}
          </Text>
          <Text dimColor>  [t] Change</Text>
        </Box>
        <Text>Select a category:</Text>
        <Box marginTop={1}>
          <SelectInput
            items={categoryItems}
            onSelect={handleCategorySelect}
            indicatorComponent={({ isSelected }: { isSelected?: boolean }) => (
              <Text color={THEME.primary}>{isSelected ? '▶ ' : '  '}</Text>
            )}
            itemComponent={({ isSelected, label }: { isSelected?: boolean; label: string }) => (
              <Text color={isSelected ? THEME.secondary : undefined} bold={isSelected}>
                {label}
              </Text>
            )}
          />
        </Box>
        <StatusBar hints={['↑↓ Navigate', '⏎ Select', 't Target', 'q Quit']} />
      </Box>
    );
  }

  if (view === 'TARGET') {
    return (
      <Box flexDirection="column" padding={1}>
        <Breadcrumb path={breadcrumbPath} />
        <Box marginBottom={1}>
          <Text>Select target platform:</Text>
        </Box>
        <Box marginTop={1}>
          <SelectInput
            items={TARGET_OPTIONS}
            onSelect={handleTargetSelect}
            indicatorComponent={({ isSelected }: { isSelected?: boolean }) => (
              <Text color={THEME.primary}>{isSelected ? '▶ ' : '  '}</Text>
            )}
            itemComponent={({ isSelected, label }: { isSelected?: boolean; label: string }) => {
              const opt = TARGET_OPTIONS.find(o => o.label === label);
              return (
                <Box flexDirection="column">
                  <Text color={isSelected ? THEME.secondary : undefined} bold={isSelected}>
                    {label}
                  </Text>
                  {opt?.description && <Text dimColor>{opt.description}</Text>}
                </Box>
              );
            }}
          />
        </Box>
        <StatusBar hints={['↑↓ Navigate', '⏎ Select', 'Esc Back', 'q Quit']} />
      </Box>
    );
  }

  if (view === 'LIST') {
    const categoryInfo = CATEGORIES.find(c => c.value === category);
    const listItems = items.map(item => ({ label: item, value: item }));

    return (
      <Box flexDirection="column" padding={1}>
        <Breadcrumb path={breadcrumbPath.slice(0, 2)} />
        <Box>
          <Box marginBottom={1}>
            <Text color={THEME.secondary} bold>
              {categoryInfo?.icon} {categoryInfo?.label.replace(/^[^\s]+\s/, '')}
            </Text>
            <Text dimColor> ({items.length} items)</Text>
          </Box>
        </Box>

        {items.length === 0 ? (
          <Text dimColor>No items found in this category.</Text>
        ) : (
          <Box flexDirection="column" height={12}>
            <SelectInput
              items={listItems}
              onSelect={handleItemSelect}
              limit={10}
              indicatorComponent={({ isSelected }: { isSelected?: boolean }) => (
                <Text color={THEME.primary}>{isSelected ? '▶ ' : '  '}</Text>
              )}
              itemComponent={({ isSelected, label }: { isSelected?: boolean; label: string }) => (
                <Text color={isSelected ? THEME.primary : undefined} bold={isSelected}>
                  {label}
                </Text>
              )}
            />
          </Box>
        )}
        <StatusBar hints={['↑↓ Navigate', '⏎ Preview', 'Esc Back']} />
      </Box>
    );
  }

  if (view === 'PREVIEW') {
    const lines = previewContent.split('\n');
    const visibleLines = lines.slice(previewScroll, previewScroll + PREVIEW_LINES);
    const totalLines = lines.length;
    const canScrollUp = previewScroll > 0;
    const canScrollDown = previewScroll + PREVIEW_LINES < totalLines;

    return (
      <Box flexDirection="column" padding={1}>
        <Breadcrumb path={breadcrumbPath} />
        
        <Box 
          flexDirection="column" 
          borderStyle="round" 
          borderColor={THEME.accent} 
          paddingX={1}
          width={65}
        >
          <Text color={THEME.accent} bold> {selectedItem} </Text>
          <Box flexDirection="column" height={PREVIEW_LINES}>
            {visibleLines.map((line, i) => (
              <Text key={i}>{line.slice(0, 60)}</Text>
            ))}
          </Box>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>
            Lines {previewScroll + 1}-{Math.min(previewScroll + PREVIEW_LINES, totalLines)} of {totalLines}
            {canScrollUp && ' ▲'}
            {canScrollDown && ' ▼'}
          </Text>
        </Box>

        <Box marginTop={1}>
          <Text color={THEME.primary} bold>⏎ Install to project</Text>
        </Box>

        <StatusBar hints={['↑↓ Scroll', '⏎/i Install', 'Esc Back']} />
      </Box>
    );
  }

  if (view === 'INSTALLING') {
    return (
      <Box flexDirection="column" padding={1}>
        <Box>
          <Text color={THEME.secondary}>
            <Spinner type="dots" />
          </Text>
          <Text> Installing {selectedItem}...</Text>
        </Box>
      </Box>
    );
  }

  if (view === 'SUCCESS') {
    return (
      <Box flexDirection="column" padding={1}>
        <Box 
          flexDirection="column" 
          borderStyle="round" 
          borderColor={THEME.primary}
          paddingX={2}
          paddingY={1}
        >
          <Text color={THEME.primary} bold>✔ Installation Complete!</Text>
          <Box marginTop={1}>
            <Text>{message}</Text>
          </Box>
          {category === 'mcp' && platform === 'github' && (
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>→ Added to .vscode/mcp.json</Text>
              <Text dimColor>→ Restart VS Code to activate</Text>
            </Box>
          )}
          {category === 'mcp' && platform === 'opencode' && (
            <Box marginTop={1} flexDirection="column">
              <Text dimColor>→ Added to opencode.json</Text>
              <Text dimColor>→ Restart OpenCode to activate</Text>
            </Box>
          )}
          {category !== 'mcp' && platform === 'github' && (
            <Box marginTop={1}>
              <Text dimColor>→ Installed to .github/{category}/{selectedItem}</Text>
            </Box>
          )}
          {category !== 'mcp' && platform === 'opencode' && (
            <Box marginTop={1}>
              <Text dimColor>→ Installed to .opencode/{category}/{selectedItem}</Text>
            </Box>
          )}
        </Box>
        <StatusBar hints={['⏎ Continue', 'Esc Home']} />
      </Box>
    );
  }

  if (view === 'ERROR') {
    return (
      <Box flexDirection="column" padding={1}>
        <Box 
          flexDirection="column" 
          borderStyle="round" 
          borderColor={THEME.error}
          paddingX={2}
          paddingY={1}
        >
          <Text color={THEME.error} bold>✘ Installation Failed</Text>
          <Box marginTop={1}>
            <Text>{error}</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Please check error above and try again.</Text>
          </Box>
        </Box>
        <StatusBar hints={['⏎ Continue', 'Esc Home']} />
      </Box>
    );
  }

  return <Text color={THEME.error}>Unknown application state</Text>;
};

export default App;
