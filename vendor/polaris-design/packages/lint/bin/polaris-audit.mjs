#!/usr/bin/env node
/**
 * polaris-audit — measures how far a project is from polaris-token compliance.
 *
 * Runs ESLint with @polaris/lint recommended preset and summarizes:
 *   - total violations
 *   - count per rule
 *   - top recurring hex colors (likely brand-color candidates)
 *   - top recurring Tailwind arbitrary values
 *   - file count and worst-offender files
 *
 * Usage:
 *   npx polaris-audit [target-dir]
 *
 * Requires the project to have @polaris/lint installed and an eslint.config.mjs
 * that uses polaris.configs.recommended (or this script auto-creates a temp config).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(process.argv[2] || '.');
const requireFromHere = createRequire(import.meta.url);

const RULE_LABELS = {
  '@polaris/no-hardcoded-color': '하드코딩 색상 (hex/rgb/named)',
  '@polaris/no-arbitrary-tailwind': 'Tailwind 임의값',
  '@polaris/no-direct-font-family': '직접 font-family',
  '@polaris/prefer-polaris-component': 'native HTML 요소',
};

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const ARBITRARY_RE = /\b[a-z][a-z0-9-]*-\[[^\]]+\]/g;

function color(s, code) {
  if (!process.stdout.isTTY) return s;
  return `\x1b[${code}m${s}\x1b[0m`;
}
const dim = (s) => color(s, 90);
const bold = (s) => color(s, 1);
const red = (s) => color(s, 31);
const green = (s) => color(s, 32);
const yellow = (s) => color(s, 33);

function resolvePolarisLint() {
  // Resolve @polaris/lint to an absolute path so a temp config (which has no
  // adjacent node_modules) can still import it. Try the target project first,
  // then fall back to this script's own location (works when this script is
  // installed inside node_modules/@polaris/lint/bin/).
  const tries = [
    () => requireFromHere.resolve('@polaris/lint', { paths: [target] }),
    () => requireFromHere.resolve('@polaris/lint'),
  ];
  for (const t of tries) {
    try {
      return t();
    } catch {
      /* try next */
    }
  }
  return null;
}

function buildTempConfig() {
  // If user already has eslint.config.{js,mjs,cjs,ts}, use it.
  const candidates = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts'];
  for (const c of candidates) {
    if (existsSync(join(target, c))) return null;
  }
  // Otherwise, create a temp config that just uses recommended.
  // The temp dir has no node_modules, so we must inject an absolute file URL
  // for @polaris/lint instead of a bare specifier.
  const polarisLintPath = resolvePolarisLint();
  if (!polarisLintPath) {
    console.error('polaris-audit: @polaris/lint is not installed in the target project.');
    console.error('  Install it first:  npm i -D @polaris/lint   (or pnpm add -D)');
    process.exit(2);
  }
  const polarisLintUrl = pathToFileURL(polarisLintPath).href;
  const dir = mkdtempSync(join(tmpdir(), 'polaris-audit-'));
  const cfg = `import polaris from ${JSON.stringify(polarisLintUrl)};
export default [...polaris.configs.recommended, { ignores: ['node_modules/**', 'dist/**', '.next/**', '.turbo/**', 'build/**'] }];
`;
  const cfgPath = join(dir, 'eslint.config.mjs');
  writeFileSync(cfgPath, cfg);
  return { cfgPath, dir };
}

function runEslint(cfgPath) {
  const args = ['--no-install', 'eslint', target, '--no-warn-ignored', '--format', 'json'];
  if (cfgPath) args.push('--config', cfgPath);
  const result = spawnSync('npx', args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: target,
  });
  return result;
}

function summarize(eslintResults) {
  const ruleCount = new Map();
  const hexCount = new Map();
  const arbitraryCount = new Map();
  const fileCount = new Map();
  let total = 0;
  let scannedFiles = 0;
  let dirtyFiles = 0;

  for (const file of eslintResults) {
    scannedFiles++;
    if (file.errorCount + file.warningCount === 0) continue;
    dirtyFiles++;
    fileCount.set(file.filePath, (file.errorCount || 0) + (file.warningCount || 0));
    for (const m of file.messages) {
      total++;
      if (m.ruleId) ruleCount.set(m.ruleId, (ruleCount.get(m.ruleId) || 0) + 1);
      const text = m.message || '';
      const hexMatches = text.match(HEX_RE);
      if (hexMatches) {
        for (const h of hexMatches) hexCount.set(h.toLowerCase(), (hexCount.get(h.toLowerCase()) || 0) + 1);
      }
      const arbMatches = text.match(ARBITRARY_RE);
      if (arbMatches) {
        for (const a of arbMatches) arbitraryCount.set(a, (arbitraryCount.get(a) || 0) + 1);
      }
    }
  }

  return { total, scannedFiles, dirtyFiles, ruleCount, hexCount, arbitraryCount, fileCount };
}

function topN(map, n = 10) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function printReport(s) {
  console.log();
  console.log(bold('━'.repeat(60)));
  console.log(bold('  Polaris Design System — Compliance Audit'));
  console.log(bold('━'.repeat(60)));
  console.log();
  console.log(`  Target: ${dim(target)}`);
  console.log(`  Files scanned: ${bold(String(s.scannedFiles))}`);
  console.log(`  Files with violations: ${s.dirtyFiles > 0 ? red(String(s.dirtyFiles)) : green('0')}`);
  console.log(`  Total violations: ${s.total > 0 ? red(String(s.total)) : green('0')}`);
  console.log();

  if (s.total === 0) {
    console.log(green('  ✓ Fully compliant. No migration needed.'));
    console.log();
    return;
  }

  console.log(bold('  Violations by rule'));
  for (const [rule, count] of topN(s.ruleCount, 10)) {
    const label = RULE_LABELS[rule] || rule;
    console.log(`    ${yellow(String(count).padStart(5))} ${label} ${dim(`(${rule})`)}`);
  }
  console.log();

  if (s.hexCount.size > 0) {
    console.log(bold('  Top recurring hex colors (likely brand candidates)'));
    for (const [hex, count] of topN(s.hexCount, 10)) {
      console.log(`    ${yellow(String(count).padStart(5))} ${hex}`);
    }
    console.log();
  }

  if (s.arbitraryCount.size > 0) {
    console.log(bold('  Top recurring Tailwind arbitrary values'));
    for (const [arb, count] of topN(s.arbitraryCount, 10)) {
      console.log(`    ${yellow(String(count).padStart(5))} ${arb}`);
    }
    console.log();
  }

  console.log(bold('  Worst offender files'));
  for (const [file, count] of topN(s.fileCount, 10)) {
    const rel = file.startsWith(target) ? file.slice(target.length + 1) : file;
    console.log(`    ${yellow(String(count).padStart(5))} ${rel}`);
  }
  console.log();

  console.log(dim('  Next: try `eslint . --fix` for auto-fixable issues, then run /polaris-migrate.'));
  console.log();
}

function main() {
  if (!existsSync(target)) {
    console.error(`polaris-audit: target not found: ${target}`);
    process.exit(2);
  }

  const cfg = buildTempConfig();
  const cfgPath = cfg ? cfg.cfgPath : null;
  const result = runEslint(cfgPath);
  if (cfg) rmSync(cfg.dir, { recursive: true, force: true });

  if (result.status === 2) {
    console.error('polaris-audit: eslint config error.');
    if (result.stderr) console.error(result.stderr);
    process.exit(2);
  }

  let parsed = [];
  try {
    parsed = JSON.parse(result.stdout || '[]');
  } catch {
    console.error('polaris-audit: failed to parse eslint JSON output.');
    if (result.stderr) console.error(result.stderr);
    process.exit(2);
  }

  const summary = summarize(parsed);
  printReport(summary);

  // Exit code: 0 if compliant, 1 if violations exist
  process.exit(summary.total > 0 ? 1 : 0);
}

main();
