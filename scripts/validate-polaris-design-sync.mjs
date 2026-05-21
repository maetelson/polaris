#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import process from 'node:process';

const REQUIRED_FILES = [
  'DESIGN.md',
  'vendor/polaris-design/DESIGN.md',
  'vendor/polaris-design/packages/ui/src/styles/tokens.css',
  'vendor/polaris-design/packages/ui/src/tailwind/index.ts',
  'vendor/polaris-design/packages/ui/COMPONENTS.md',
  'vendor/polaris-design/packages/lint/RULES.md',
  'vendor/polaris-design/packages/plugin/skills/polaris-web/SKILL.md',
  'vendor/polaris-design/packages/plugin/commands/polaris-check.md',
  'vendor/polaris-design/packages/plugin/commands/polaris-component.md',
  'vendor/polaris-design/packages/plugin/commands/polaris-brand-audit.md',
  'docs/design/generated/polaris.tokens.json',
  'docs/design/generated/polaris.components.json',
  'docs/design/generated/polaris.lint-rules.json',
  'docs/design/generated/polaris.signature-assets.json',
  'polaris.design-sync.json',
  'figma/sync-polaris-figma.js',
];

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function readText(filePath) {
  return readFile(filePath, 'utf8');
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath));
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

async function validateManifestChecksums(manifest, failures) {
  for (const item of [...manifest.syncedFiles, ...manifest.generatedArtifacts]) {
    const text = await readText(item.destination);
    assert(sha256(text) === item.sha256, `${item.destination} checksum does not match manifest`, failures);
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

  await validateManifestChecksums(manifest, failures);

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
  assert(
    lintRules.rules.some((rule) => rule.name === '@polaris/no-hardcoded-color'),
    'Lint rules missing no-hardcoded-color',
    failures
  );
  assert(
    lintRules.rules.some((rule) => rule.name === '@polaris/prefer-polaris-component'),
    'Lint rules missing prefer-polaris-component',
    failures
  );

  assert(signatureAssets.requiredAssets.length >= 7, 'Signature asset JSON should include required assets', failures);
  assert(signatureAssets.heuristics.length >= 7, 'Signature asset JSON should include brand-audit heuristics', failures);

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
