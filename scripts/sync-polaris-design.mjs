#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const UPSTREAM_REPO = 'https://github.com/PolarisOffice/PolarisDesign';
const RAW_REPO = 'https://raw.githubusercontent.com/PolarisOffice/PolarisDesign';
const DEFAULT_REF = '1d0e2460de63eb634c979855f183c2b18d688b1e';
const DEFAULT_RELEASE_TAG = 'v0.8.0-rc.8';
const UI_TARBALL =
  'https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.8.0-rc.8/polaris-ui-0.8.0-rc.8.tgz';
const LINT_TARBALL =
  'https://github.com/PolarisOffice/PolarisDesign/releases/download/v0.8.0-rc.8/polaris-lint-0.8.0-rc.8.tgz';

const SYNC_FILES = [
  { source: 'DESIGN.md', destinations: ['DESIGN.md', 'vendor/polaris-design/DESIGN.md'] },
  { source: 'tokens.md', destinations: ['vendor/polaris-design/tokens.md'] },
  { source: 'packages/ui/COMPONENTS.md', destinations: ['vendor/polaris-design/packages/ui/COMPONENTS.md'] },
  { source: 'packages/lint/RULES.md', destinations: ['vendor/polaris-design/packages/lint/RULES.md'] },
  {
    source: 'packages/plugin/skills/polaris-web/SKILL.md',
    destinations: ['vendor/polaris-design/packages/plugin/skills/polaris-web/SKILL.md'],
  },
  {
    source: 'packages/plugin/commands/polaris-check.md',
    destinations: ['vendor/polaris-design/packages/plugin/commands/polaris-check.md'],
  },
  {
    source: 'packages/plugin/commands/polaris-component.md',
    destinations: ['vendor/polaris-design/packages/plugin/commands/polaris-component.md'],
  },
  {
    source: 'packages/plugin/commands/polaris-brand-audit.md',
    destinations: ['vendor/polaris-design/packages/plugin/commands/polaris-brand-audit.md'],
  },
  { source: 'packages/ui/src/tokens/index.ts', destinations: ['vendor/polaris-design/packages/ui/src/tokens/index.ts'] },
  { source: 'packages/ui/src/tokens/colors.ts', destinations: ['vendor/polaris-design/packages/ui/src/tokens/colors.ts'] },
  {
    source: 'packages/ui/src/tokens/typography.ts',
    destinations: ['vendor/polaris-design/packages/ui/src/tokens/typography.ts'],
  },
  { source: 'packages/ui/src/tokens/spacing.ts', destinations: ['vendor/polaris-design/packages/ui/src/tokens/spacing.ts'] },
  { source: 'packages/ui/src/tokens/radius.ts', destinations: ['vendor/polaris-design/packages/ui/src/tokens/radius.ts'] },
  { source: 'packages/ui/src/tokens/shadow.ts', destinations: ['vendor/polaris-design/packages/ui/src/tokens/shadow.ts'] },
  { source: 'packages/ui/src/tokens/motion.ts', destinations: ['vendor/polaris-design/packages/ui/src/tokens/motion.ts'] },
  { source: 'packages/ui/src/tokens/zIndex.ts', destinations: ['vendor/polaris-design/packages/ui/src/tokens/zIndex.ts'] },
  {
    source: 'packages/ui/src/styles/tokens.css',
    destinations: ['vendor/polaris-design/packages/ui/src/styles/tokens.css'],
  },
  {
    source: 'packages/ui/src/styles/v4-theme.css',
    destinations: ['vendor/polaris-design/packages/ui/src/styles/v4-theme.css'],
  },
  {
    source: 'packages/ui/src/tailwind/index.ts',
    destinations: ['vendor/polaris-design/packages/ui/src/tailwind/index.ts'],
  },
];

const SIGNATURE_ASSET_FALLBACK = [
  {
    id: 'ai-cta',
    signal: 'AI, NOVA, 자동화, 생성, 분석, 요약',
    requiredExpression: 'ai.* token, NOVA purple, NovaLogo, Button variant="ai"',
  },
  {
    id: 'file-icon',
    signal: 'DOCX, HWP, PDF, XLSX, PPTX, TXT, CSV, ZIP',
    requiredExpression: 'FileIcon or @polaris/ui/file-icons',
  },
  {
    id: 'document-ribbon',
    signal: '문서 편집, 보고서, 제안서, 문서 작성',
    requiredExpression: '@polaris/ui/ribbon and ribbon-icons',
  },
  {
    id: 'prompt-chip',
    signal: '필터, 카테고리, 빠른 액션, 추천 질문',
    requiredExpression: 'PromptChip',
  },
  {
    id: 'sidebar-active',
    signal: 'navigation active state',
    requiredExpression: 'bg-accent-brand-bg text-accent-brand-normal',
  },
  {
    id: 'nova-gradient',
    signal: 'AI, 자동, NOVA headline emphasis',
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

async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function readExisting(filePath) {
  if (!existsSync(filePath)) return null;
  return readFile(filePath, 'utf8');
}

async function writeText(filePath, text, { check }) {
  const current = await readExisting(filePath);
  if (check) {
    return current === text;
  }
  await ensureParent(filePath);
  await writeFile(filePath, text, 'utf8');
  return true;
}

async function fetchText(ref, source) {
  const url = `${RAW_REPO}/${encodeURIComponent(ref).replaceAll('%2F', '/')}/${source}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'maetelson-polaris-sync' } });
  if (!response.ok) throw new Error(`Failed to fetch ${source}: ${response.status} ${response.statusText}`);
  return response.text();
}

async function resolveCommit(ref) {
  if (/^[0-9a-f]{40}$/i.test(ref)) return ref;
  const response = await fetch(`https://api.github.com/repos/PolarisOffice/PolarisDesign/commits/${ref}`, {
    headers: { 'User-Agent': 'maetelson-polaris-sync' },
  });
  if (!response.ok) return ref;
  const json = await response.json();
  return json.sha || ref;
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
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
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

function buildTokensJson(files, ref, commit, generatedAt) {
  const design = files.get('DESIGN.md');
  const tokensCss = files.get('packages/ui/src/styles/tokens.css');
  const designFrontmatterRaw = extractFrontmatter(design);
  const designFrontmatter = parseSimpleYaml(designFrontmatterRaw);
  const lightVars = parseCssVariables(extractCssBlock(tokensCss, ':root'));
  const darkVars = parseCssVariables(extractCssBlock(tokensCss, '[data-theme="dark"]'));
  const cssVariableLineCount = (tokensCss.match(/^\s*--polaris-/gm) || []).length;

  return {
    schemaVersion: 1,
    source: {
      repo: UPSTREAM_REPO,
      ref,
      commit,
      releaseTag: DEFAULT_RELEASE_TAG,
    },
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
  const markdown = files.get('packages/ui/COMPONENTS.md');
  const familyCountMatch = markdown.match(/현재\s+(\d+)\s+family export/);
  const components = Array.from(new Set([...markdown.matchAll(/<([A-Z][A-Za-z0-9]+)>/g)].map((m) => m[1]))).sort();
  const subpaths = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s+`([^`]+)`\s+\|\s+([^|]+)\|\s+([^|]+)\|/);
    if (match && match[1].startsWith('@polaris/')) {
      subpaths.push({
        path: match[1],
        description: match[2].trim(),
        serverSafe: match[3].trim(),
      });
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

function buildLintRulesJson(files, ref, commit, generatedAt) {
  const markdown = files.get('packages/lint/RULES.md');
  const rules = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s+`(@polaris\/[^`]+)`\s+\|\s+([^|]+)\|\s+([^|]+)\|/);
    if (match) {
      rules.push({
        name: match[1],
        type: match[2].trim(),
        description: match[3].trim(),
      });
    }
  }
  return {
    schemaVersion: 1,
    source: { repo: UPSTREAM_REPO, ref, commit, file: 'packages/lint/RULES.md' },
    generatedAt,
    ruleCount: rules.length,
    rules,
  };
}

function buildSignatureAssetsJson(files, ref, commit, generatedAt) {
  const markdown = files.get('packages/plugin/commands/polaris-brand-audit.md');
  const heuristics = [];
  const pattern = /###\s+\d+\.\s+(.+?)\r?\n([\s\S]*?)(?=\r?\n###\s+\d+\.|\r?\n## 보고 형식)/g;
  for (const match of markdown.matchAll(pattern)) {
    const body = match[2];
    const codeMatch = body.match(/```sh\r?\n([\s\S]*?)```/);
    const suggestionMatch = body.match(/\*\*제안\*\*:\s+(.+)/);
    heuristics.push({
      name: match[1].trim(),
      command: codeMatch ? codeMatch[1].trim() : null,
      suggestion: suggestionMatch ? suggestionMatch[1].trim() : null,
    });
  }
  return {
    schemaVersion: 1,
    source: {
      repo: UPSTREAM_REPO,
      ref,
      commit,
      file: 'packages/plugin/commands/polaris-brand-audit.md',
    },
    generatedAt,
    requiredAssets: SIGNATURE_ASSET_FALLBACK,
    heuristics,
  };
}

async function writeJson(filePath, value, options) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  const ok = await writeText(filePath, text, options);
  return { filePath, text, ok, checksum: sha256(text) };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const commit = await resolveCommit(options.ref);
  const existingManifest = options.check && existsSync('polaris.design-sync.json')
    ? JSON.parse(await readFile('polaris.design-sync.json', 'utf8'))
    : null;
  const syncedAt = existingManifest?.syncedAt || new Date().toISOString();
  const fetched = new Map();
  const fileChecksums = {};
  const drift = [];

  for (const item of SYNC_FILES) {
    const text = await fetchText(options.ref, item.source);
    fetched.set(item.source, text);
    for (const destination of item.destinations) {
      const ok = await writeText(destination, text, options);
      fileChecksums[destination] = sha256(text);
      if (!ok) drift.push(destination);
    }
  }

  const generated = [
    await writeJson('docs/design/generated/polaris.tokens.json', buildTokensJson(fetched, options.ref, commit, syncedAt), options),
    await writeJson(
      'docs/design/generated/polaris.components.json',
      buildComponentsJson(fetched, options.ref, commit, syncedAt),
      options
    ),
    await writeJson(
      'docs/design/generated/polaris.lint-rules.json',
      buildLintRulesJson(fetched, options.ref, commit, syncedAt),
      options
    ),
    await writeJson(
      'docs/design/generated/polaris.signature-assets.json',
      buildSignatureAssetsJson(fetched, options.ref, commit, syncedAt),
      options
    ),
  ];
  for (const artifact of generated) {
    if (!artifact.ok) drift.push(artifact.filePath);
  }

  const manifest = {
    schemaVersion: 1,
    upstream: {
      repo: UPSTREAM_REPO,
      ref: options.ref,
      commit,
      releaseTag: DEFAULT_RELEASE_TAG,
      releaseUrl: `${UPSTREAM_REPO}/releases/tag/${DEFAULT_RELEASE_TAG}`,
      tarballs: {
        ui: UI_TARBALL,
        lint: LINT_TARBALL,
      },
    },
    syncedAt,
    syncedFiles: SYNC_FILES.flatMap((item) =>
      item.destinations.map((destination) => ({
        source: item.source,
        destination,
        sha256: fileChecksums[destination],
      }))
    ),
    generatedArtifacts: generated.map((artifact) => ({
      destination: artifact.filePath,
      sha256: artifact.checksum,
    })),
  };
  const manifestResult = await writeJson('polaris.design-sync.json', manifest, options);
  if (!manifestResult.ok) drift.push('polaris.design-sync.json');

  if (options.check && drift.length > 0) {
    console.error('Polaris design sync drift detected:');
    for (const file of drift) console.error(`- ${file}`);
    process.exit(1);
  }

  if (options.check) {
    console.log('Polaris design sync is up to date.');
  } else {
    console.log(`Synced PolarisDesign ${commit} into ${process.cwd()}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
