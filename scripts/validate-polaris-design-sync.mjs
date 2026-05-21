#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_FILES = [
  'DESIGN.md',
  'assets/figma-spec/foundation/color.png',
  'vendor/polaris-design/DESIGN.md',
  'vendor/polaris-design/assets/figma-spec/foundation/color.png',
  'vendor/polaris-design/docs/for-consumers/migration/rsc-patterns.md',
  'vendor/polaris-design/docs/archive/design-assets-v07.md',
  'vendor/polaris-design/packages/ui/src/styles/tokens.css',
  'vendor/polaris-design/packages/ui/src/tailwind/index.ts',
  'vendor/polaris-design/packages/ui/scripts/build-tokens.ts',
  'vendor/polaris-design/packages/ui/COMPONENTS.md',
  'vendor/polaris-design/packages/lint/README.md',
  'vendor/polaris-design/packages/lint/RULES.md',
  'vendor/polaris-design/packages/plugin/skills/polaris-web/SKILL.md',
  'vendor/polaris-design/packages/plugin/commands/polaris-check.md',
  'vendor/polaris-design/packages/plugin/commands/polaris-component.md',
  'vendor/polaris-design/packages/plugin/commands/polaris-brand-audit.md',
  'docs/design/generated/polaris.tokens.json',
  'docs/design/generated/polaris.components.json',
  'docs/design/generated/polaris.lint-rules.json',
  'docs/design/generated/polaris.signature-assets.json',
  'docs/design/generated/polaris.assets.json',
  'polaris.design-sync.json',
  'figma/sync-polaris-figma.js',
];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function readBuffer(filePath) {
  return readFile(filePath);
}

async function readText(filePath) {
  return (await readBuffer(filePath)).toString('utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath));
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
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

async function validateManifestChecksums(manifest, failures) {
  for (const item of [...manifest.syncedFiles, ...manifest.generatedArtifacts]) {
    const buffer = await readBuffer(item.destination);
    assert(sha256(buffer) === item.sha256, `${item.destination} checksum does not match manifest`, failures);
  }
}

async function validateManagedPrefixes(manifest, failures) {
  const desired = new Set(manifest.syncedFiles.map((item) => item.destination));
  for (const prefix of manifest.managedPrefixes || []) {
    const files = await walkFiles(prefix);
    for (const file of files) {
      assert(desired.has(file), `Stale managed file not present in manifest: ${file}`, failures);
    }
  }
}

async function validateOptionalAppWiring(failures) {
  if (!existsSync('app') && !existsSync('src') && !existsSync('apps')) return;

  if (existsSync('package.json')) {
    const packageJson = await readJson('package.json');
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };
    assert(Boolean(allDeps['@polaris/ui']), 'App code exists but @polaris/ui is not declared', failures);
    assert(Boolean(allDeps['@polaris/lint']), 'App code exists but @polaris/lint is not declared', failures);
  }

  const cssCandidates = ['app/globals.css', 'src/globals.css', 'src/index.css', 'apps/web/app/globals.css'];
  const hasTokenImport = (
    await Promise.all(
      cssCandidates
        .filter((candidate) => existsSync(candidate))
        .map(async (candidate) => (await readText(candidate)).includes('@polaris/ui/styles/tokens.css'))
    )
  ).some(Boolean);
  assert(hasTokenImport, 'App code exists but no global CSS imports @polaris/ui/styles/tokens.css', failures);
}

async function main() {
  const failures = [];
  for (const file of REQUIRED_FILES) {
    assert(existsSync(file), `Missing required file: ${file}`, failures);
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  const manifest = await readJson('polaris.design-sync.json');
  const tokens = await readJson('docs/design/generated/polaris.tokens.json');
  const components = await readJson('docs/design/generated/polaris.components.json');
  const lintRules = await readJson('docs/design/generated/polaris.lint-rules.json');
  const signatureAssets = await readJson('docs/design/generated/polaris.signature-assets.json');
  const assets = await readJson('docs/design/generated/polaris.assets.json');

  await validateManifestChecksums(manifest, failures);
  await validateManagedPrefixes(manifest, failures);

  assert(manifest.schemaVersion === 2, 'Manifest schemaVersion must be 2', failures);
  assert(manifest.syncProfile === 'design-source', 'Manifest syncProfile must be design-source', failures);
  assert(manifest.includedPrefixes.includes('assets/'), 'Manifest must include upstream assets in vendor snapshot', failures);
  assert(manifest.includedPrefixes.includes('packages/ui/'), 'Manifest must include packages/ui', failures);
  assert(manifest.excludedPrefixes.includes('apps/'), 'Manifest must explicitly exclude apps/demo', failures);
  assert(manifest.excludedPrefixes.includes('e2e/'), 'Manifest must explicitly exclude e2e screenshots', failures);
  assert(manifest.syncedFiles.length >= 500, 'Design-source snapshot should include 500+ synced files', failures);

  const rootDesign = await readBuffer('DESIGN.md');
  const vendorDesign = await readBuffer('vendor/polaris-design/DESIGN.md');
  assert(rootDesign.equals(vendorDesign), 'Root DESIGN.md must match vendor upstream DESIGN.md byte-for-byte', failures);

  assert(manifest.upstream.commit === tokens.source.commit, 'Token JSON commit does not match manifest', failures);
  assert(tokens.counts.cssVariableLines >= 300, 'Token JSON must include 300+ CSS variable lines', failures);
  assert(tokens.cssVariables.light['--polaris-accent-brand-normal'] === '#1D7FF9', 'Missing Polaris blue token', failures);
  assert(tokens.cssVariables.light['--polaris-ai-normal'] === '#6F3AD0', 'Missing NOVA purple token', failures);
  assert(tokens.designFrontmatter.typography?.display?.fontSize === '40px', 'Missing DESIGN.md display type token', failures);
  assert(tokens.cssVariables.categorizedLight.radius.md === '12px', 'Missing radius md token', failures);
  assert(Boolean(tokens.cssVariables.categorizedLight.shadow.ai), 'Missing AI shadow token', failures);
  assert(Boolean(tokens.cssVariables.categorizedLight.motion['duration-fast']), 'Missing motion duration token', failures);
  assert(tokens.cssVariables.categorizedLight.zIndex.modal === '400', 'Missing z-index modal token', failures);

  assert(components.familyCount >= 45, 'Component catalog should include 45+ families', failures);
  assert(components.components.includes('Button'), 'Component catalog missing Button', failures);
  assert(components.components.includes('FileIcon'), 'Component catalog missing FileIcon', failures);
  assert(components.subpaths.some((item) => item.path === '@polaris/ui/ribbon'), 'Component catalog missing ribbon subpath', failures);

  assert(lintRules.ruleCount >= 9, 'Lint rules JSON should include 9+ rules', failures);
  assert(lintRules.rules.some((rule) => rule.name === '@polaris/no-hardcoded-color'), 'Lint rules missing no-hardcoded-color', failures);
  assert(
    lintRules.rules.some((rule) => rule.name === '@polaris/prefer-polaris-component'),
    'Lint rules missing prefer-polaris-component',
    failures
  );

  assert(signatureAssets.requiredAssets.length >= 7, 'Signature asset JSON should include required assets', failures);
  assert(signatureAssets.heuristics.length >= 7, 'Signature asset JSON should include brand-audit heuristics', failures);
  assert(assets.counts.figmaSpec >= 10, 'Asset catalog missing Figma spec images', failures);
  assert(assets.counts.fileIcons >= 25, 'Asset catalog missing file icons', failures);
  assert(assets.counts.logos >= 5, 'Asset catalog missing logos', failures);
  assert(assets.counts.ribbonBig >= 50, 'Asset catalog missing big ribbon icons', failures);
  assert(assets.counts.ribbonSmall >= 30, 'Asset catalog missing small ribbon icons', failures);

  await validateOptionalAppWiring(failures);

  if (failures.length > 0) {
    console.error('Polaris design validation failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Polaris design validation passed.');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
