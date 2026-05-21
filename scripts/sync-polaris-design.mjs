#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const UPSTREAM_REPO = 'https://github.com/PolarisOffice/PolarisDesign';
const RAW_REPO = 'https://raw.githubusercontent.com/PolarisOffice/PolarisDesign';
const API_REPO = 'https://api.github.com/repos/PolarisOffice/PolarisDesign';
const DEFAULT_REF = '1d0e2460de63eb634c979855f183c2b18d688b1e';
const DEFAULT_RELEASE_TAG = 'v0.8.0-rc.8';
const UI_TARBALL =
  'https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.8.0-rc.8/polaris-ui-0.8.0-rc.8.tgz';
const LINT_TARBALL =
  'https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.8.0-rc.8/polaris-lint-0.8.0-rc.8.tgz';

const ROOT_DESIGN_FILE = 'DESIGN.md';
const ROOT_ASSET_PREFIXES = ['assets/figma-spec/'];
const VENDOR_ROOT = 'vendor/polaris-design';
const VENDOR_ROOT_FILES = [
  'AGENTS.md',
  'CHANGELOG.md',
  'DESIGN.md',
  'LICENSE',
  'README.md',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tokens.md',
  'tsconfig.base.json',
  'turbo.json',
];
const VENDOR_PREFIXES = [
  '.claude-plugin/',
  'apps/demo/',
  'assets/',
  'docs/',
  'packages/ui/',
  'packages/lint/',
  'packages/plugin/',
  'packages/template-next/',
];
const EXCLUDED_PREFIXES = ['e2e/', '.github/', '.changeset/'];
const MANAGED_PREFIXES = ['assets/figma-spec/', 'vendor/polaris-design/'];

const REQUIRED_SOURCE_FILES = [
  'DESIGN.md',
  'tokens.md',
  'packages/ui/COMPONENTS.md',
  'packages/lint/RULES.md',
  'packages/plugin/commands/polaris-brand-audit.md',
  'packages/ui/src/styles/tokens.css',
  'packages/ui/src/styles/v4-theme.css',
  'packages/ui/src/tailwind/index.ts',
  'packages/ui/src/tokens/colors.ts',
  'packages/ui/src/tokens/typography.ts',
  'packages/ui/src/tokens/spacing.ts',
  'packages/ui/src/tokens/radius.ts',
  'packages/ui/src/tokens/shadow.ts',
  'packages/ui/src/tokens/motion.ts',
  'packages/ui/src/tokens/zIndex.ts',
  'apps/demo/src/App.tsx',
  'apps/demo/src/pages/Components.tsx',
  'apps/demo/src/pages/Tokens.tsx',
  'apps/demo/src/pages/Icons.tsx',
  'apps/demo/src/pages/Assets.tsx',
];

const SIGNATURE_ASSET_FALLBACK = [
  {
    id: 'ai-cta',
    signal: 'AI, NOVA, automation, generation, analysis, summary',
    requiredExpression: 'ai.* token, NOVA purple, NovaLogo, Button variant="ai"',
  },
  {
    id: 'file-icon',
    signal: 'DOCX, HWP, PDF, XLSX, PPTX, TXT, CSV, ZIP',
    requiredExpression: 'FileIcon or @polaris/ui/file-icons',
  },
  {
    id: 'document-ribbon',
    signal: 'document editing, proposal, report, office tools',
    requiredExpression: '@polaris/ui/ribbon and ribbon-icons',
  },
  {
    id: 'prompt-chip',
    signal: 'filter, category, quick action, suggested prompt',
    requiredExpression: 'PromptChip',
  },
  {
    id: 'sidebar-active',
    signal: 'navigation active state',
    requiredExpression: 'bg-accent-brand-bg text-accent-brand-normal',
  },
  {
    id: 'nova-gradient',
    signal: 'AI, automation, NOVA headline emphasis',
    requiredExpression: 'NOVA gradient text for one keyword only',
  },
  {
    id: 'brand-mark',
    signal: 'footer, login, product shell, NOVA panel',
    requiredExpression: 'PolarisLogo or NovaLogo',
  },
];

function parseArgs(argv) {
  const args = { ref: DEFAULT_REF, check: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--check') args.check = true;
    else if (arg === '--ref') args.ref = argv[++i];
    else if (arg.startsWith('--ref=')) args.ref = arg.slice('--ref='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}

function encodeSourcePath(source) {
  return source.split('/').map(encodeURIComponent).join('/');
}

function isIncludedSource(source) {
  if (VENDOR_ROOT_FILES.includes(source)) return true;
  if (ROOT_ASSET_PREFIXES.some((prefix) => source.startsWith(prefix))) return true;
  return VENDOR_PREFIXES.some((prefix) => source.startsWith(prefix));
}

function destinationsForSource(source) {
  const destinations = [];
  if (source === ROOT_DESIGN_FILE) destinations.push(ROOT_DESIGN_FILE);
  if (ROOT_ASSET_PREFIXES.some((prefix) => source.startsWith(prefix))) destinations.push(source);
  if (VENDOR_ROOT_FILES.includes(source) || VENDOR_PREFIXES.some((prefix) => source.startsWith(prefix))) {
    destinations.push(`${VENDOR_ROOT}/${source}`);
  }
  return destinations;
}

function normalizeVendorMarkdown(source, textValue) {
  if (!source.endsWith('.md')) return textValue;
  let text = textValue;
  if (source === 'README.md') {
    text = text.replaceAll('(docs/migration/)', '(docs/for-consumers/migration/)');
  }
  if (source === 'docs/archive/migration-checklist.md') {
    text = text
      .replaceAll('(tailwind-v4-migration.md)', '(../for-contributors/architecture/tailwind-v4.md)')
      .replaceAll('(internal-consumer-setup.md)', '(../for-consumers/install.md)')
      .replaceAll('(nextjs-app-router.md', '(../for-contributors/architecture/nextjs-app-router.md');
  }
  if (source === 'docs/for-consumers/migration/rsc-patterns.md') {
    text = text.replaceAll('(../roadmap.md)', '(../../for-contributors/roadmap.md)');
  }
  if (source === 'docs/for-contributors/architecture/nextjs-app-router.md') {
    text = text
      .replaceAll('(tailwind-v4-migration.md)', '(tailwind-v4.md)')
      .replaceAll('(internal-consumer-setup.md)', '(../../for-consumers/install.md)');
  }
  if (source === 'docs/for-contributors/architecture/tailwind-v4.md') {
    text = text.replaceAll('(migration/v0.7-to-v0.8.md)', '(../../for-consumers/migration/v0.7-to-v0.8.md)');
  }
  if (source === 'docs/for-contributors/component-history.md') {
    text = text.replaceAll('(migration/v0.7-to-v0.8.md)', '(../for-consumers/migration/v0.7-to-v0.8.md)');
  }
  if (source === 'docs/for-contributors/docs-architecture.md') {
    text = text.replaceAll('](...)', '](../for-consumers/migration/v0.7-to-v0.8.md)');
  }
  if (source === 'docs/for-contributors/roadmap.md') {
    text = text
      .replaceAll('(migration/v0.6-to-v0.7.md)', '(../for-consumers/migration/v0.6-to-v0.7.md)')
      .replaceAll('(migration/v0.7-to-v0.8.md)', '(../for-consumers/migration/v0.7-to-v0.8.md)');
  }
  if (source.startsWith('packages/')) {
    text = text.replaceAll('(docs/for-design-team/followup.md)', '(../../docs/for-design-team/followup.md)');
  }
  if (source === 'apps/demo/CHANGELOG.md') {
    text = text.replaceAll('(docs/for-design-team/followup.md)', '(../../docs/for-design-team/followup.md)');
  }
  return text;
}

function bufferForDestination(source, destination, buffer) {
  if (!destination.startsWith(`${VENDOR_ROOT}/`) || !source.endsWith('.md')) return buffer;
  return Buffer.from(normalizeVendorMarkdown(source, buffer.toString('utf8')), 'utf8');
}

async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function readExistingBuffer(filePath) {
  if (!existsSync(filePath)) return null;
  return readFile(filePath);
}

async function writeBuffer(filePath, buffer, { check }) {
  const current = await readExistingBuffer(filePath);
  if (check) return Boolean(current && current.equals(buffer));
  await ensureParent(filePath);
  await writeFile(filePath, buffer);
  return true;
}

async function writeText(filePath, text, options) {
  return writeBuffer(filePath, Buffer.from(text, 'utf8'), options);
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'maetelson-polaris-sync' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchBuffer(ref, source) {
  const url = `${RAW_REPO}/${encodeURIComponent(ref).replaceAll('%2F', '/')}/${encodeSourcePath(source)}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'maetelson-polaris-sync' } });
  if (!response.ok) throw new Error(`Failed to fetch ${source}: ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

async function resolveCommit(ref) {
  if (/^[0-9a-f]{40}$/i.test(ref)) return ref;
  const json = await fetchJson(`${API_REPO}/commits/${encodeURIComponent(ref)}`);
  return json.sha || ref;
}

async function listUpstreamFiles(commit) {
  const json = await fetchJson(`${API_REPO}/git/trees/${commit}?recursive=1`);
  if (json.truncated) throw new Error('GitHub tree response was truncated.');
  return json.tree
    .filter((item) => item.type === 'blob')
    .map((item) => ({ path: item.path, size: item.size || 0 }))
    .filter((item) => isIncludedSource(item.path))
    .sort((a, b) => a.path.localeCompare(b.path));
}

async function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(full)));
    else files.push(normalizePath(full));
  }
  return files;
}

async function listManagedFiles() {
  const all = [];
  for (const prefix of MANAGED_PREFIXES) {
    all.push(...(await walkFiles(prefix)));
  }
  return all.sort();
}

async function removeStaleFiles(staleFiles, { check }) {
  if (check || staleFiles.length === 0) return;
  const repoRoot = process.cwd();
  for (const file of staleFiles) {
    const resolved = path.resolve(file);
    if (!resolved.startsWith(repoRoot)) throw new Error(`Refusing to remove outside repo: ${file}`);
    await unlink(file);
  }
  for (const prefix of MANAGED_PREFIXES) {
    if (existsSync(prefix)) await rm(prefix, { recursive: true, force: true });
  }
}

function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('DESIGN.md frontmatter not found');
  return match[1];
}

function parseScalar(rawValue) {
  let value = rawValue.trim();
  if (!value) return '';
  const commentIndex = value.search(/\s#/);
  if (commentIndex >= 0) value = value.slice(0, commentIndex).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function parseSimpleYaml(yaml) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  for (const line of yaml.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(/^(\s*)([^:]+):(.*)$/);
    if (!match) continue;
    const indent = match[1].length;
    const key = match[2].trim();
    const rawValue = match[3];
    while (stack.length > 1 && stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).value;
    if (!rawValue.trim()) {
      parent[key] = {};
      stack.push({ indent, value: parent[key] });
    } else {
      parent[key] = parseScalar(rawValue);
    }
  }
  return root;
}

function extractCssBlock(css, selectorNeedle) {
  const start = css.indexOf(selectorNeedle);
  if (start < 0) return '';
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') depth -= 1;
    if (depth === 0) return css.slice(open + 1, i);
  }
  return '';
}

function parseCssVariables(block) {
  const vars = {};
  const pattern = /(--polaris-[\w-]+)\s*:\s*([^;]+);/g;
  for (const match of block.matchAll(pattern)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

function categorizeCssVariables(vars) {
  const categories = {
    colors: {},
    radius: {},
    font: {},
    shadow: {},
    spacing: {},
    motion: {},
    zIndex: {},
    other: {},
  };
  for (const [name, value] of Object.entries(vars)) {
    const key = name.replace('--polaris-', '');
    if (/^#|^rgba?\(/.test(value)) categories.colors[key] = value;
    else if (key.startsWith('radius-')) categories.radius[key.replace('radius-', '')] = value;
    else if (key.startsWith('font-')) categories.font[key.replace('font-', '')] = value;
    else if (key.startsWith('shadow-')) categories.shadow[key.replace('shadow-', '')] = value;
    else if (key.startsWith('spacing-')) categories.spacing[key.replace('spacing-', '')] = value;
    else if (key.startsWith('duration-') || key.startsWith('ease-')) categories.motion[key] = value;
    else if (key.startsWith('z-')) categories.zIndex[key.replace('z-', '')] = value;
    else categories.other[key] = value;
  }
  return categories;
}

function parseSimpleConstMap(ts, exportName) {
  const match = ts.match(new RegExp(`export const ${exportName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s+as const`));
  if (!match) return {};
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const clean = line.replace(/\/\/.*$/, '').trim();
    const entry = clean.match(/^['"]?([\w.-]+)['"]?\s*:\s*['"]([^'"]+)['"]/);
    if (entry) values[entry[1]] = entry[2];
  }
  return values;
}

function extractDemoRoutes(appTsx) {
  const imports = {};
  for (const match of appTsx.matchAll(/^import\s+([A-Z][A-Za-z0-9]+)\s+from\s+'\.\/pages\/([^']+)'/gm)) {
    imports[match[1]] = `apps/demo/src/pages/${match[2]}.tsx`;
  }
  const routes = [{ path: '/', component: 'Home', source: imports.Home }];
  for (const match of appTsx.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<([A-Z][A-Za-z0-9]+)\s*\/>\}/g)) {
    if (match[1] === '*') continue;
    routes.push({ path: `/${match[1]}`, component: match[2], source: imports[match[2]] || null });
  }
  return routes;
}

function extractDemoComponentSections(componentsTsx) {
  const categories = {};
  for (const match of componentsTsx.matchAll(/<Section\s+cat="([^"]+)"\s+current=\{catTab\}\s+title="([^"]+)"/g)) {
    const [, category, title] = match;
    if (!categories[category]) categories[category] = [];
    categories[category].push({
      title,
      primaryComponentHint: title.replace(/^\d+\.\s*/, '').split(' — ')[0],
    });
  }
  return categories;
}

function extractDemoUiImports(componentsTsx) {
  const match = componentsTsx.match(/import\s+\{([\s\S]*?)\}\s+from\s+'@polaris\/ui';/);
  if (!match) return [];
  return Array.from(
    new Set(
      match[1]
        .replace(/\/\/.*$/gm, '')
        .split(',')
        .map((part) => part.trim().replace(/^type\s+/, ''))
        .filter((part) => /^[A-Z][A-Za-z0-9]+$/.test(part))
    )
  ).sort();
}

function extractTokenPageSections(tokensTsx) {
  return [...tokensTsx.matchAll(/<Section\s+title="([^"]+)"/g)].map((match) => match[1]);
}

function extractComponentExports(files) {
  const exportsByFile = {};
  const all = new Set();
  for (const [source, buffer] of [...files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (!source.startsWith('packages/ui/src/components/') || !source.endsWith('.tsx')) continue;
    const tsx = buffer.toString('utf8');
    const names = new Set();
    for (const match of tsx.matchAll(/export\s+(?:const|function)\s+([A-Z][A-Za-z0-9]+)/g)) names.add(match[1]);
    for (const match of tsx.matchAll(/^([A-Z][A-Za-z0-9]+)\.displayName\s*=/gm)) names.add(match[1]);
    if (names.size > 0) {
      const list = [...names].sort();
      exportsByFile[source] = list;
      list.forEach((name) => all.add(name));
    }
  }
  return {
    count: all.size,
    exports: [...all].sort(),
    byFile: exportsByFile,
  };
}

function extractSubpathExports(files, source) {
  const index = files.get(source);
  if (!index) return [];
  const textValue = index.toString('utf8');
  const names = new Set();
  for (const match of textValue.matchAll(/export\s+(?:const|function|class)\s+([A-Z][A-Za-z0-9]+)/g)) names.add(match[1]);
  for (const match of textValue.matchAll(/export\s+\{\s*([^}]+)\s*\}/g)) {
    match[1]
      .split(',')
      .map((part) => part.trim().split(/\s+as\s+/).pop())
      .filter((part) => /^[A-Z][A-Za-z0-9]+$/.test(part))
      .forEach((name) => names.add(name));
  }
  return [...names].sort();
}

function groupColorTokens(lightVars, darkVars) {
  const groupOf = (cssName) => {
    const name = cssName.replace('--polaris-', '');
    if (/^(blue|green|orange|red|purple)$/.test(name) || name.startsWith('file-')) return 'brandIdentity';
    if (
      name.startsWith('label-') ||
      name.startsWith('background-') ||
      name.startsWith('layer-') ||
      name.startsWith('surface-') ||
      name.startsWith('interaction-') ||
      name.startsWith('fill-') ||
      name.startsWith('line-') ||
      name.startsWith('accent-') ||
      name.startsWith('focus-') ||
      name.startsWith('static-') ||
      name.startsWith('state-') ||
      name.startsWith('ai-')
    ) {
      return 'semantic';
    }
    if (/^(blue|dark-blue|green|orange|red|purple)-/.test(name)) return 'brandRamps';
    if (/^(sky-blue|blue-supplementary|violet|cyan|yellow)-/.test(name)) return 'supplementaryRamps';
    if (/^(neutral|gray)-/.test(name)) return 'neutralAndGray';
    return 'other';
  };

  const groups = {};
  for (const [cssVariable, light] of Object.entries(lightVars)) {
    const group = groupOf(cssVariable);
    if (!groups[group]) groups[group] = [];
    groups[group].push({
      name: cssVariable.replace('--polaris-', ''),
      cssVariable,
      figmaVariable: cssVariable.replace('--polaris-', '').replaceAll('-', '/'),
      light,
      dark: darkVars[cssVariable] || light,
    });
  }
  return groups;
}

function text(files, source) {
  const value = files.get(source);
  if (!value) throw new Error(`Missing fetched file for generated artifact: ${source}`);
  return value.toString('utf8');
}

function buildTokensJson(files, ref, commit, generatedAt) {
  const design = text(files, 'DESIGN.md');
  const tokensCss = text(files, 'packages/ui/src/styles/tokens.css');
  const designFrontmatterRaw = extractFrontmatter(design);
  const designFrontmatter = parseSimpleYaml(designFrontmatterRaw);
  const lightVars = parseCssVariables(extractCssBlock(tokensCss, ':root'));
  const darkVars = parseCssVariables(extractCssBlock(tokensCss, '[data-theme="dark"]'));
  const cssVariableLineCount = (tokensCss.match(/^\s*--polaris-/gm) || []).length;

  return {
    schemaVersion: 1,
    source: { repo: UPSTREAM_REPO, ref, commit, releaseTag: DEFAULT_RELEASE_TAG },
    generatedAt,
    designFrontmatter,
    counts: {
      cssVariableLines: cssVariableLineCount,
      designColorTokens: Object.keys(designFrontmatter.colors || {}).length,
      textStyles: Object.keys(designFrontmatter.typography || {}).length,
      componentAtoms: Object.keys(designFrontmatter.components || {}).length,
    },
    cssVariables: {
      light: lightVars,
      dark: darkVars,
      categorizedLight: categorizeCssVariables(lightVars),
      categorizedDark: categorizeCssVariables(darkVars),
    },
    upstreamFiles: {
      tokens: [
        'packages/ui/src/tokens/colors.ts',
        'packages/ui/src/tokens/typography.ts',
        'packages/ui/src/tokens/spacing.ts',
        'packages/ui/src/tokens/radius.ts',
        'packages/ui/src/tokens/shadow.ts',
        'packages/ui/src/tokens/motion.ts',
        'packages/ui/src/tokens/zIndex.ts',
      ],
      styles: ['packages/ui/src/styles/tokens.css', 'packages/ui/src/styles/v4-theme.css'],
      tailwindPreset: 'packages/ui/src/tailwind/index.ts',
    },
  };
}

function buildComponentsJson(files, ref, commit, generatedAt) {
  const markdown = text(files, 'packages/ui/COMPONENTS.md');
  const familyCountMatch = markdown.match(/(\d+)\s+family export/);
  const components = Array.from(new Set([...markdown.matchAll(/<([A-Z][A-Za-z0-9]+)>/g)].map((m) => m[1]))).sort();
  const subpaths = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s+`([^`]+)`\s+\|\s+([^|]+)\|\s+([^|]+)\|/);
    if (match && match[1].startsWith('@polaris/')) {
      subpaths.push({ path: match[1], description: match[2].trim(), serverSafe: match[3].trim() });
    }
  }
  return {
    schemaVersion: 1,
    source: { repo: UPSTREAM_REPO, ref, commit, file: 'packages/ui/COMPONENTS.md' },
    generatedAt,
    familyCount: familyCountMatch ? Number(familyCountMatch[1]) : components.length,
    components,
    subpaths,
  };
}

function buildComponentRegistryJson(files, ref, commit, generatedAt, componentsJson) {
  const componentExports = extractComponentExports(files);
  const demoImports = extractDemoUiImports(text(files, 'apps/demo/src/pages/Components.tsx'));
  const familySet = new Set(componentsJson.components);
  const demoMissingFromFamilyCatalog = demoImports.filter((name) => !familySet.has(name));
  return {
    schemaVersion: 1,
    source: {
      repo: UPSTREAM_REPO,
      ref,
      commit,
      files: [
        'packages/ui/src/components/index.ts',
        'packages/ui/src/components/*.tsx',
        'apps/demo/src/pages/Components.tsx',
      ],
    },
    generatedAt,
    summary: {
      familyCount: componentsJson.familyCount,
      rootExportCount: componentExports.count,
      demoImportCount: demoImports.length,
      demoSectionCount: Object.values(extractDemoComponentSections(text(files, 'apps/demo/src/pages/Components.tsx'))).flat()
        .length,
      demoSecondaryExportsMissingFromFamilyCatalog: demoMissingFromFamilyCatalog.length,
    },
    families: componentsJson.components,
    rootExports: componentExports.exports,
    exportsByFile: componentExports.byFile,
    demo: {
      route: '/components',
      source: 'apps/demo/src/pages/Components.tsx',
      importsFromRoot: demoImports,
      categories: extractDemoComponentSections(text(files, 'apps/demo/src/pages/Components.tsx')),
      secondaryExportsMissingFromFamilyCatalog: demoMissingFromFamilyCatalog,
    },
    subpaths: [
      ...componentsJson.subpaths,
      {
        path: '@polaris/ui/ribbon',
        source: 'packages/ui/src/ribbon/index.ts',
        exports: extractSubpathExports(files, 'packages/ui/src/ribbon/index.ts'),
      },
      {
        path: '@polaris/ui/form',
        source: 'packages/ui/src/form/index.ts',
        exports: extractSubpathExports(files, 'packages/ui/src/form/index.ts'),
      },
    ],
  };
}

function buildTokenRegistryJson(files, ref, commit, generatedAt, tokensJson) {
  const spacingTs = text(files, 'packages/ui/src/tokens/spacing.ts');
  const tokenPageSections = extractTokenPageSections(text(files, 'apps/demo/src/pages/Tokens.tsx'));
  return {
    schemaVersion: 1,
    source: {
      repo: UPSTREAM_REPO,
      ref,
      commit,
      files: [
        'packages/ui/src/styles/tokens.css',
        'packages/ui/src/tokens/typography.ts',
        'packages/ui/src/tokens/spacing.ts',
        'apps/demo/src/pages/Tokens.tsx',
      ],
    },
    generatedAt,
    pagesReference: {
      route: '/tokens',
      source: 'apps/demo/src/pages/Tokens.tsx',
      sections: tokenPageSections,
      requiredVisualAxes: ['color', 'typography', 'spacing/grid', 'radius', 'shadow', 'motion', 'z-index', 'breakpoint', 'iconography'],
    },
    colors: {
      groups: groupColorTokens(tokensJson.cssVariables.light, tokensJson.cssVariables.dark),
      counts: Object.fromEntries(
        Object.entries(groupColorTokens(tokensJson.cssVariables.light, tokensJson.cssVariables.dark)).map(([key, value]) => [
          key,
          value.length,
        ])
      ),
    },
    typography: {
      source: 'DESIGN.md frontmatter + packages/ui/src/tokens/typography.ts',
      styles: tokensJson.designFrontmatter.typography || {},
      count: Object.keys(tokensJson.designFrontmatter.typography || {}).length,
      rule: 'Pretendard Variable, no letter-spacing, 700 for headings/captions, 400 for body.',
      figmaSpecImage: 'assets/figma-spec/foundation/typography.png',
    },
    grid: {
      spacing: tokensJson.cssVariables.categorizedLight.spacing,
      spacingNamed: parseSimpleConstMap(spacingTs, 'spacingNamed'),
      breakpoint: parseSimpleConstMap(spacingTs, 'breakpoint'),
      container: parseSimpleConstMap(spacingTs, 'container'),
      figmaSpecImage: 'assets/figma-spec/foundation/grid.png',
    },
    relatedTokenGroups: {
      radius: tokensJson.cssVariables.categorizedLight.radius,
      shadow: tokensJson.cssVariables.categorizedLight.shadow,
      motion: tokensJson.cssVariables.categorizedLight.motion,
      zIndex: tokensJson.cssVariables.categorizedLight.zIndex,
    },
  };
}

function buildPagesJson(files, ref, commit, generatedAt) {
  const appTsx = text(files, 'apps/demo/src/App.tsx');
  const routes = extractDemoRoutes(appTsx);
  return {
    schemaVersion: 1,
    source: {
      repo: UPSTREAM_REPO,
      ref,
      commit,
      githubPages: 'https://polarisoffice.github.io/PolarisDesign/',
      app: 'apps/demo',
    },
    generatedAt,
    routeCount: routes.length,
    routes,
    requiredReferenceRoutes: ['/components', '/tokens', '/icons', '/assets'],
    referenceCoverage: {
      components: {
        route: '/components',
        source: 'apps/demo/src/pages/Components.tsx',
        sectionCount: Object.values(extractDemoComponentSections(text(files, 'apps/demo/src/pages/Components.tsx'))).flat()
          .length,
      },
      tokens: {
        route: '/tokens',
        source: 'apps/demo/src/pages/Tokens.tsx',
        sections: extractTokenPageSections(text(files, 'apps/demo/src/pages/Tokens.tsx')),
      },
      icons: { route: '/icons', source: 'apps/demo/src/pages/Icons.tsx' },
      assets: { route: '/assets', source: 'apps/demo/src/pages/Assets.tsx' },
    },
  };
}

function buildLintRulesJson(files, ref, commit, generatedAt) {
  const markdown = text(files, 'packages/lint/RULES.md');
  const rules = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s+`(@polaris\/[^`]+)`\s+\|\s+([^|]+)\|\s+([^|]+)\|/);
    if (match) rules.push({ name: match[1], type: match[2].trim(), description: match[3].trim() });
  }
  return {
    schemaVersion: 1,
    source: { repo: UPSTREAM_REPO, ref, commit, file: 'packages/lint/RULES.md' },
    generatedAt,
    ruleCount: rules.length,
    rules,
  };
}

function buildAssetCatalog(files, ref, commit, generatedAt, syncedFiles) {
  const assetFiles = syncedFiles.filter((item) => item.source.startsWith('assets/'));
  const byKind = {
    figmaSpec: assetFiles.filter((item) => item.source.startsWith('assets/figma-spec/')),
    fileIcons: assetFiles.filter((item) => item.source.startsWith('assets/svg/file-icons/')),
    uiIcons: assetFiles.filter((item) => item.source.startsWith('assets/svg/icons/')),
    logos: assetFiles.filter((item) => item.source.startsWith('assets/svg/logos/')),
    ribbonBig: assetFiles.filter((item) => item.source.startsWith('assets/ribbon/big/')),
    ribbonSmall: assetFiles.filter((item) => item.source.startsWith('assets/ribbon/small/')),
  };
  return {
    schemaVersion: 1,
    source: { repo: UPSTREAM_REPO, ref, commit },
    generatedAt,
    counts: Object.fromEntries(Object.entries(byKind).map(([key, value]) => [key, value.length])),
    assets: Object.fromEntries(
      Object.entries(byKind).map(([key, value]) => [
        key,
        value.map((item) => ({ source: item.source, destination: item.destination, sha256: item.sha256 })),
      ])
    ),
  };
}

function buildSignatureAssetsJson(files, ref, commit, generatedAt, assetCatalog) {
  const markdown = text(files, 'packages/plugin/commands/polaris-brand-audit.md');
  const headings = [...markdown.matchAll(/^###\s+\d+\.\s+(.+)$/gm)].map((match) => match[1].trim());
  return {
    schemaVersion: 1,
    source: { repo: UPSTREAM_REPO, ref, commit, file: 'packages/plugin/commands/polaris-brand-audit.md' },
    generatedAt,
    requiredAssets: SIGNATURE_ASSET_FALLBACK,
    heuristics: headings.map((name) => ({ name })),
    assetCatalog: {
      figmaSpec: assetCatalog.counts.figmaSpec,
      fileIcons: assetCatalog.counts.fileIcons,
      uiIcons: assetCatalog.counts.uiIcons,
      logos: assetCatalog.counts.logos,
      ribbonBig: assetCatalog.counts.ribbonBig,
      ribbonSmall: assetCatalog.counts.ribbonSmall,
    },
  };
}

async function writeJson(filePath, value, options) {
  const buffer = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
  const ok = await writeBuffer(filePath, buffer, options);
  return { filePath, ok, sha256: sha256(buffer) };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const commit = await resolveCommit(options.ref);
  const existingManifest =
    options.check && existsSync('polaris.design-sync.json')
      ? JSON.parse((await readFile('polaris.design-sync.json')).toString('utf8'))
      : null;
  const syncedAt = existingManifest?.syncedAt || new Date().toISOString();
  const upstreamFiles = await listUpstreamFiles(commit);
  const missingRequired = REQUIRED_SOURCE_FILES.filter((file) => !upstreamFiles.some((item) => item.path === file));
  if (missingRequired.length > 0) throw new Error(`Missing required upstream files: ${missingRequired.join(', ')}`);

  const fetched = new Map();
  const desiredDestinations = new Set();
  const syncedFiles = [];
  const drift = [];

  await mapWithConcurrency(upstreamFiles, 8, async (file) => {
    const buffer = await fetchBuffer(commit, file.path);
    fetched.set(file.path, buffer);
    for (const destination of destinationsForSource(file.path)) {
      const destinationBuffer = bufferForDestination(file.path, destination, buffer);
      desiredDestinations.add(destination);
      const ok = await writeBuffer(destination, destinationBuffer, options);
      if (!ok) drift.push(destination);
      syncedFiles.push({
        source: file.path,
        destination,
        size: destinationBuffer.byteLength,
        sha256: sha256(destinationBuffer),
      });
    }
  });
  syncedFiles.sort((a, b) => a.destination.localeCompare(b.destination));

  const managedFiles = await listManagedFiles();
  const staleFiles = managedFiles.filter((file) => !desiredDestinations.has(file));
  if (staleFiles.length > 0) drift.push(...staleFiles.map((file) => `stale:${file}`));
  await removeStaleFiles(staleFiles, options);

  if (!options.check) {
    for (const file of upstreamFiles) {
      for (const destination of destinationsForSource(file.path)) {
        const buffer = fetched.get(file.path);
        await writeBuffer(destination, bufferForDestination(file.path, destination, buffer), options);
      }
    }
  }

  const assetCatalog = buildAssetCatalog(fetched, options.ref, commit, syncedAt, syncedFiles);
  const tokensJson = buildTokensJson(fetched, options.ref, commit, syncedAt);
  const componentsJson = buildComponentsJson(fetched, options.ref, commit, syncedAt);
  const generatedArtifacts = [
    await writeJson('docs/design/generated/polaris.tokens.json', tokensJson, options),
    await writeJson(
      'docs/design/generated/polaris.components.json',
      componentsJson,
      options
    ),
    await writeJson(
      'docs/design/generated/polaris.component-registry.json',
      buildComponentRegistryJson(fetched, options.ref, commit, syncedAt, componentsJson),
      options
    ),
    await writeJson(
      'docs/design/generated/polaris.token-registry.json',
      buildTokenRegistryJson(fetched, options.ref, commit, syncedAt, tokensJson),
      options
    ),
    await writeJson('docs/design/generated/polaris.pages.json', buildPagesJson(fetched, options.ref, commit, syncedAt), options),
    await writeJson(
      'docs/design/generated/polaris.lint-rules.json',
      buildLintRulesJson(fetched, options.ref, commit, syncedAt),
      options
    ),
    await writeJson('docs/design/generated/polaris.assets.json', assetCatalog, options),
    await writeJson(
      'docs/design/generated/polaris.signature-assets.json',
      buildSignatureAssetsJson(fetched, options.ref, commit, syncedAt, assetCatalog),
      options
    ),
  ];
  for (const artifact of generatedArtifacts) {
    if (!artifact.ok) drift.push(artifact.filePath);
  }

  const manifest = {
    schemaVersion: 3,
    syncProfile: 'design-source',
    upstream: {
      repo: UPSTREAM_REPO,
      ref: options.ref,
      commit,
      releaseTag: DEFAULT_RELEASE_TAG,
      releaseUrl: `${UPSTREAM_REPO}/releases/tag/${DEFAULT_RELEASE_TAG}`,
      tarballs: { ui: UI_TARBALL, lint: LINT_TARBALL },
    },
    includedRootFiles: VENDOR_ROOT_FILES,
    includedPrefixes: [...ROOT_ASSET_PREFIXES, ...VENDOR_PREFIXES],
    excludedPrefixes: EXCLUDED_PREFIXES,
    managedPrefixes: MANAGED_PREFIXES,
    syncedAt,
    syncedFiles,
    generatedArtifacts: generatedArtifacts.map((artifact) => ({
      destination: artifact.filePath,
      sha256: artifact.sha256,
    })),
  };
  const manifestResult = await writeJson('polaris.design-sync.json', manifest, options);
  if (!manifestResult.ok) drift.push('polaris.design-sync.json');

  if (options.check && drift.length > 0) {
    console.error('Polaris design sync drift detected:');
    for (const file of drift) console.error(`- ${file}`);
    process.exit(1);
  }

  if (options.check) console.log('Polaris design sync is up to date.');
  else console.log(`Synced PolarisDesign ${commit} (${syncedFiles.length} files) into ${process.cwd()}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
