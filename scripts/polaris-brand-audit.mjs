#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const SOURCE_DIRS = ['app', 'src', 'components', 'pages', 'apps'];
const EXTENSIONS = new Set(['.tsx', '.jsx', '.ts', '.js']);
const REQUIRED_FIXTURE_IDS = new Set([
  'ai-cta',
  'file-icon',
  'document-ribbon',
  'raw-hex',
  'tailwind-arbitrary',
  'tailwind-default-palette',
  'native-control',
]);

async function walk(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) files.push(...(await walk(full)));
    else if (EXTENSIONS.has(path.extname(full))) files.push(full);
  }
  return files;
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function add(findings, id, priority, file, line, current, suggestion, impact) {
  findings.push({ id, priority, file, line, current: current.trim().slice(0, 140), suggestion, impact });
}

function auditText(file, text, findings) {
  const aiCtaPattern =
    /<Button\b(?![^>]*variant=["']ai["'])[^>]*>[^<]*(AI|NOVA|자동|생성|분석|요약|Chat|Analyze)[^<]*<\/Button>/g;
  for (const match of text.matchAll(aiCtaPattern)) {
    add(
      findings,
      'ai-cta',
      'high',
      file,
      lineNumber(text, match.index),
      match[0],
      '<Button variant="ai"><NovaLogo tone="white" /> ...</Button>',
      'AI actions must carry the NOVA signature.'
    );
  }

  const fileTextPattern = /\b(DOCX|HWP|HWPX|PDF|XLSX|PPTX|TXT|CSV|ZIP)\b/g;
  if (!text.includes('FileIcon')) {
    for (const match of text.matchAll(fileTextPattern)) {
      add(
        findings,
        'file-icon',
        'medium',
        file,
        lineNumber(text, match.index),
        match[0],
        '<FileIcon type="..." />',
        'File types need the Polaris file icon signal, not extension text only.'
      );
    }
  }

  if (/(문서|보고서|제안서).*(편집|작성|캔버스|도구)/.test(text) && !text.includes('@polaris/ui/ribbon')) {
    add(
      findings,
      'document-ribbon',
      'high',
      file,
      1,
      'document editing surface',
      'Import @polaris/ui/ribbon and use ribbon/ribbon-icons.',
      'Document tools should feel like Polaris Office, not generic SaaS.'
    );
  }

  const rawHexPattern = /(?:className=["'][^"']*#(?:[0-9a-fA-F]{3,8})|style=\{\{[^}]*#(?:[0-9a-fA-F]{3,8})|["'`](?:#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8}))["'`])/g;
  for (const match of text.matchAll(rawHexPattern)) {
    add(
      findings,
      'raw-hex',
      'high',
      file,
      lineNumber(text, match.index),
      match[0],
      'Use Polaris tokens from @polaris/ui or CSS variables.',
      'Hardcoded colors bypass the PolarisDesign token contract.'
    );
  }

  const arbitraryPattern = /className=["'][^"']*(?:bg|text|border|ring|shadow|rounded|p|m|gap|w|h|min-w|max-w)-\[[^\]]+\][^"']*["']/g;
  for (const match of text.matchAll(arbitraryPattern)) {
    add(
      findings,
      'tailwind-arbitrary',
      'high',
      file,
      lineNumber(text, match.index),
      match[0],
      'Use Polaris Tailwind preset tokens such as bg-fill-normal or rounded-polaris-md.',
      'Arbitrary values make repeated Polaris output drift.'
    );
  }

  const defaultPalettePattern =
    /className=["'][^"']*\b(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b[^"']*["']/g;
  for (const match of text.matchAll(defaultPalettePattern)) {
    if (match[0].includes('polaris-')) continue;
    add(
      findings,
      'tailwind-default-palette',
      'high',
      file,
      lineNumber(text, match.index),
      match[0],
      'Use Polaris semantic classes/tokens instead of the default Tailwind palette.',
      'Default Tailwind palettes break the Polaris tone and color semantics.'
    );
  }

  const nativeControlPattern = /<(button|input|textarea|select|dialog)\b/g;
  for (const match of text.matchAll(nativeControlPattern)) {
    add(
      findings,
      'native-control',
      'medium',
      file,
      lineNumber(text, match.index),
      match[0],
      'Use @polaris/ui components such as Button, Input, Textarea, Select, Dialog.',
      'Feature UI should use Polaris components before native controls.'
    );
  }

  if (/<(button|div|span)\b[^>]*rounded-polaris-(pill|full)[^>]*>/.test(text) && !text.includes('PromptChip')) {
    add(
      findings,
      'prompt-chip',
      'low',
      file,
      1,
      'pill chip/button cluster',
      'Consider PromptChip.',
      'Quick actions and prompts need the Polaris prompt signature.'
    );
  }

  if (/active.*text-accent-brand|active.*text-brand/.test(text) && !text.includes('bg-accent-brand-bg')) {
    add(
      findings,
      'active-state',
      'medium',
      file,
      1,
      'active text-only nav state',
      'Use bg-accent-brand-bg with text-accent-brand-normal.',
      'State communication must not rely on color-only text.'
    );
  }

  if (/<(h1|h2)\b[^>]*>[^<]*(AI|NOVA|자동)/.test(text) && !text.includes('bg-clip-text')) {
    add(
      findings,
      'nova-gradient',
      'low',
      file,
      1,
      'AI/NOVA headline',
      'Use a restrained NOVA gradient keyword emphasis.',
      'AI surfaces need a clear but limited NOVA distinction.'
    );
  }
}

async function auditFile(file, findings) {
  auditText(file, await readFile(file, 'utf8'), findings);
}

function printFindings(findings) {
  console.log('| priority | location | rule | current | suggestion | impact |');
  console.log('| --- | --- | --- | --- | --- | --- |');
  for (const item of findings) {
    console.log(
      `| ${item.priority} | ${item.file}:${item.line} | ${item.id} | ${item.current} | ${item.suggestion} | ${item.impact} |`
    );
  }
}

function runFixtures() {
  const findings = [];
  auditText(
    'fixture.tsx',
    `
      export function Fixture() {
        return (
          <section className="bg-blue-500 p-[13px]">
            <Button>AI 요약</Button>
            <span>PDF</span>
            <button style={{ color: "#123456" }}>Native</button>
            <input />
            <p>문서 편집 도구</p>
          </section>
        );
      }
    `,
    findings
  );
  const foundIds = new Set(findings.map((item) => item.id));
  const missing = [...REQUIRED_FIXTURE_IDS].filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    console.error(`Polaris brand audit fixture check failed: ${missing.join(', ')}`);
    printFindings(findings);
    process.exit(1);
  }
  console.log('Polaris brand audit fixture check passed.');
}

async function main() {
  if (process.argv.includes('--fixtures')) {
    runFixtures();
    return;
  }

  const files = (await Promise.all(SOURCE_DIRS.map(walk))).flat();
  const findings = [];
  for (const file of files) await auditFile(file, findings);

  if (files.length === 0) {
    console.log('Polaris brand audit skipped: no app/source files found yet.');
    return;
  }

  if (findings.length === 0) {
    console.log('Polaris brand audit passed: no signature/token/component gaps found.');
    return;
  }

  printFindings(findings);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
