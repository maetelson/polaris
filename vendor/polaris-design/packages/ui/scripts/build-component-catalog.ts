#!/usr/bin/env tsx
/**
 * build-component-catalog — generate `packages/ui/COMPONENTS.md` (SSoT
 * for the component list).
 *
 * Inputs:
 *   - `packages/ui/src/components/index.ts` (Tier comments + re-exports)
 *   - each component file's leading JSDoc (one-line description)
 *
 * Outputs:
 *   - `packages/ui/COMPONENTS.md` — table of {Tier, Name, Description}
 *
 * Run:
 *   pnpm --filter @polaris/ui exec tsx scripts/build-component-catalog.ts
 *
 * Also invoked from the `build` script so dist + COMPONENTS.md stay in sync.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COMPONENTS_DIR = join(ROOT, 'src', 'components');
const INDEX_FILE = join(COMPONENTS_DIR, 'index.ts');
const OUT_FILE = join(ROOT, 'COMPONENTS.md');

interface Entry {
  tier: string;            // e.g., "Tier 0 — basic blocks"
  componentFile: string;   // e.g., "Button"
  description: string;     // one-line, stripped of JSDoc syntax
}

/** Extract the JSDoc block immediately preceding the export of `componentName`.
 *  Falls back to the first JSDoc in the file if no matching export found. */
function extractComponentJSDoc(filePath: string, componentName: string): string {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }

  // Try targeted match: `/** ... */` immediately before
  // `export const <ComponentName>` or `export function <ComponentName>`
  // or `export const <ComponentName> = forwardRef(...)`.
  const exportRe = new RegExp(
    `\\/\\*\\*\\s*([\\s\\S]*?)\\*\\/\\s*export\\s+(?:const|function)\\s+${componentName}\\b`,
  );
  let match = content.match(exportRe);

  // Fallback: first JSDoc anywhere in the file (legacy / for tiny components).
  if (!match) match = content.match(/\/\*\*\s*([\s\S]*?)\*\//);
  if (!match) return '';

  // Strip leading ` * `, collect first paragraph (until blank line or @tag)
  const lines = match[1].split('\n').map((line) => line.replace(/^\s*\*\s?/, ''));
  const paragraph: string[] = [];
  let started = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (started) break;
      continue;
    }
    if (trimmed.startsWith('@')) break;
    started = true;
    paragraph.push(trimmed);
  }
  if (paragraph.length === 0) return '';

  const joined = paragraph.join(' ');
  // First sentence (until `.` `?` `!` followed by space or end)
  const sentenceMatch = joined.match(/^(.+?[.!?])(\s|$)/);
  const sentence = (sentenceMatch ? sentenceMatch[1] : joined).trim();
  // Strip trailing dash-style version refs (e.g., "Button — v0.7-rc.1 spec")
  return sentence.replace(/\s+—\s+v\d+\.\d+[^.]*\.?$/i, '.').trim();
}

function parseIndex(): Entry[] {
  const lines = readFileSync(INDEX_FILE, 'utf8').split('\n');
  const entries: Entry[] = [];
  let currentTier = 'Tier 0 — basic blocks';

  for (const line of lines) {
    const trimmed = line.trim();
    // Tier section header — `// Tier 0 — basic blocks` or similar
    const tierMatch = trimmed.match(/^\/\/\s*(Tier\s+[0-9.]+.*)$/);
    if (tierMatch) {
      currentTier = tierMatch[1].trim();
      continue;
    }
    // Component re-export — `export * from './Button';`
    const exportMatch = trimmed.match(/^export\s+\*\s+from\s+['"]\.\/([\w.-]+)['"];?$/);
    if (exportMatch) {
      const componentFile = exportMatch[1];
      const description = extractComponentJSDoc(
        join(COMPONENTS_DIR, `${componentFile}.tsx`),
        componentFile,  // assume primary exported component shares filename
      );
      entries.push({ tier: currentTier, componentFile, description });
    }
  }
  return entries;
}

function buildMarkdown(entries: Entry[]): string {
  const grouped = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!grouped.has(e.tier)) grouped.set(e.tier, []);
    grouped.get(e.tier)!.push(e);
  }

  const lines: string[] = [];
  lines.push('# `@polaris/ui` — 컴포넌트 카탈로그');
  lines.push('');
  lines.push(
    '> **AUTO-GENERATED** — `pnpm --filter @polaris/ui build:component-catalog` 또는 매 `pnpm build` 시 자동 갱신. 본문 직접 수정 금지 — `packages/ui/src/components/*.tsx` 의 JSDoc 또는 `components/index.ts` 의 Tier 주석을 수정하세요.',
  );
  lines.push('');
  lines.push(
    `현재 ${entries.length} family export. 자세한 spec / variant axis 는 [\`/DESIGN.md\`](../../DESIGN.md) §4 참조.`,
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const [tier, items] of grouped) {
    lines.push(`## ${tier}`);
    lines.push('');
    lines.push('| Component | 설명 |');
    lines.push('|---|---|');
    for (const item of items) {
      lines.push(`| \`<${item.componentFile}>\` | ${item.description || '—'} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Subpath imports');
  lines.push('');
  lines.push('루트 barrel 외에 다음 subpath 가 9개 운영 중입니다:');
  lines.push('');
  lines.push('| Subpath | 내용 | server-safe? |');
  lines.push('|---|---|---|');
  lines.push('| `@polaris/ui` (root) | 모든 컴포넌트 + 토큰 + `cn` | client (use client) |');
  lines.push('| `@polaris/ui/tokens` | 토큰 객체 (`label`, `accentBrand`, …) | ✓ server-safe |');
  lines.push('| `@polaris/ui/tailwind` | Tailwind preset | ✓ server-safe |');
  lines.push('| `@polaris/ui/utils` | 순수 함수 (`pageNumberItems`, …) — v0.8.0-rc.8 신규 | ✓ server-safe |');
  lines.push('| `@polaris/ui/form` | `<Form>` + react-hook-form 통합 | client |');
  lines.push('| `@polaris/ui/ribbon` | Ribbon family (25+ subcomponents) | client |');
  lines.push('| `@polaris/ui/icons` | 65 UI 아이콘 (18/24/32 px) | client |');
  lines.push('| `@polaris/ui/file-icons` | 29 파일 타입 SVG | client |');
  lines.push('| `@polaris/ui/logos` | PolarisLogo + NovaLogo | client |');
  lines.push('| `@polaris/ui/ribbon-icons` | 91 ribbon-icons (57 big × 32 + 34 small × 16) | client |');
  lines.push('');
  lines.push('RSC 환경 사용 시 server-safe subpath 우선. 자세히 → [`/docs/for-consumers/migration/rsc-patterns.md`](../../docs/for-consumers/migration/rsc-patterns.md).');
  lines.push('');

  return lines.join('\n');
}

const entries = parseIndex();
const md = buildMarkdown(entries);
writeFileSync(OUT_FILE, md);

console.log(`✓ wrote ${entries.length} components → ${OUT_FILE}`);
