#!/usr/bin/env tsx
/**
 * build-rules-md — generate `packages/lint/RULES.md` (SSoT for the lint
 * rule list).
 *
 * Inputs: every `packages/lint/src/rules/*.ts` file's exported
 * `rule.meta.docs.description` string.
 *
 * Output: `packages/lint/RULES.md` — table of {Rule, Severity hint,
 * Description}.
 *
 * Run:
 *   pnpm --filter @polaris/lint exec tsx scripts/build-rules-md.ts
 *
 * Also runs from `pnpm --filter @polaris/lint build` so dist + RULES.md
 * stay in sync.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RULES_DIR = join(ROOT, 'src', 'rules');
const OUT_FILE = join(ROOT, 'RULES.md');

interface RuleEntry {
  name: string;
  type: string;      // problem / suggestion / layout
  description: string;
}

function extractRuleMeta(filePath: string): { type: string; description: string } | null {
  const content = readFileSync(filePath, 'utf8');
  // Match: `meta: { type: 'problem', docs: { description: '...' }, ... }`
  // We grab the first occurrence of meta.docs.description in the file.
  const typeMatch = content.match(/type:\s*['"]([\w-]+)['"]/);
  const descMatch = content.match(/description:\s*['"`]((?:[^'"`\\]|\\.)*)['"`]/);
  if (!typeMatch || !descMatch) return null;
  return {
    type: typeMatch[1],
    description: descMatch[1].replace(/\\'/g, "'"),
  };
}

function buildMarkdown(rules: RuleEntry[]): string {
  const lines: string[] = [];
  lines.push('# `@polaris/lint` — ESLint 룰 목록');
  lines.push('');
  lines.push(
    '> **AUTO-GENERATED** — `pnpm --filter @polaris/lint build` 시 자동 갱신. 본문 직접 수정 금지 — 각 룰의 `meta.docs.description` (in `src/rules/*.ts`) 을 수정하세요.',
  );
  lines.push('');
  lines.push(
    `현재 ${rules.length} 룰 — \`recommended\` 프리셋에 모두 포함됩니다. 자세한 설정 / 사용: [\`./README.md\`](README.md).`,
  );
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('| 룰 | type | 설명 |');
  lines.push('|---|---|---|');
  for (const r of rules) {
    lines.push(`| \`@polaris/${r.name}\` | ${r.type} | ${r.description} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 추가 도구');
  lines.push('');
  lines.push('lint 룰 외에 같은 패키지에서 제공:');
  lines.push('');
  lines.push('| 명령 | 용도 |');
  lines.push('|---|---|');
  lines.push('| `pnpm dlx @polaris/lint polaris-audit` | 위반 통계 — top hex / 임의값 / 위반 파일 분석 리포트 |');
  lines.push('| `pnpm dlx @polaris/lint polaris-codemod-v07` | v0.6/rc.0/rc.1 → v0.7 자동 변환 |');
  lines.push('| `pnpm dlx @polaris/lint polaris-codemod-v08` | v0.7 → v0.8 자동 변환 (token / Tailwind / CSS 변수 / JSX prop / `<HStack>`·`<VStack>` 일괄) |');
  lines.push('');
  lines.push('마이그레이션 절차: [`/docs/for-consumers/migration/README.md`](../../docs/for-consumers/migration/README.md).');
  lines.push('');

  return lines.join('\n');
}

const ruleFiles = readdirSync(RULES_DIR).filter((f) => f.endsWith('.ts'));
const rules: RuleEntry[] = [];
for (const file of ruleFiles) {
  const name = file.replace(/\.ts$/, '');
  const meta = extractRuleMeta(join(RULES_DIR, file));
  if (!meta) {
    console.warn(`  ⚠ skipped ${file} — meta.docs.description not found`);
    continue;
  }
  rules.push({ name, ...meta });
}

const md = buildMarkdown(rules);
writeFileSync(OUT_FILE, md);
console.log(`✓ wrote ${rules.length} lint rules → ${OUT_FILE}`);
