#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook: lint files edited by the model.
 *
 * Reads hook event JSON from stdin, runs eslint on the edited file, and
 * surfaces violations back to the model via additionalContext so it can
 * self-correct on the next turn.
 *
 * Behaviors:
 *   - Non-source extensions: silent skip
 *   - eslint exit=0 (clean): silent
 *   - eslint exit=1 (violations): emit additionalContext with details
 *   - eslint exit=2 (config error): emit ONE-time-per-cwd-per-hour notice
 *     telling the model to run /polaris-init, so projects without setup
 *     don't silently miss feedback forever
 */
import { readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extname } from 'node:path';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const SUPPORTED_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const NOTICE_TTL_MS = 60 * 60 * 1000; // 1 hour

function readStdin() {
  try {
    return JSON.parse(readFileSync(0, 'utf-8'));
  } catch {
    return null;
  }
}

function getFilePaths(input) {
  if (!input) return [];
  const ti = input.tool_input ?? {};
  if (typeof ti.file_path === 'string') return [ti.file_path];
  if (Array.isArray(ti.edits) && ti.edits.length > 0 && typeof ti.file_path === 'string') {
    return [ti.file_path];
  }
  return [];
}

function lintFile(filePath) {
  const result = spawnSync(
    'npx',
    ['--no-install', 'eslint', '--no-warn-ignored', filePath],
    { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  return {
    status: result.status,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function shouldEmitConfigNotice() {
  const cwdHash = createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12);
  const marker = join(tmpdir(), `polaris-hook-config-notice-${cwdHash}`);
  if (existsSync(marker)) {
    const age = Date.now() - statSync(marker).mtimeMs;
    if (age < NOTICE_TTL_MS) return false;
  }
  try {
    writeFileSync(marker, '');
  } catch {
    // Marker write failures shouldn't block — just don't dedupe.
  }
  return true;
}

function emitContext(message) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: message,
    },
  };
  process.stdout.write(JSON.stringify(output));
}

function main() {
  const input = readStdin();
  const filePaths = getFilePaths(input);
  if (filePaths.length === 0) process.exit(0);

  const violationReports = [];
  let configErrorSeen = false;
  for (const fp of filePaths) {
    if (!SUPPORTED_EXTS.has(extname(fp))) continue;
    const r = lintFile(fp);
    if (r.status === 0 || r.status === null) continue;
    if (r.status === 2) {
      configErrorSeen = true;
      continue;
    }
    if (r.stdout) violationReports.push({ file: fp, output: r.stdout });
  }

  if (violationReports.length > 0) {
    const blocks = violationReports.map((v) => `📄 ${v.file}\n${v.output}`).join('\n\n');
    emitContext(
      `[polaris-design] 디자인 토큰 위반이 감지되었습니다:

${blocks}

수정 가이드 (v0.8 spec):
- hex 색상 → 시맨틱 토큰 클래스. 예: bg-accent-brand-normal · text-label-normal · border-line-normal · bg-state-error-bg · bg-layer-surface · bg-ai-normal
- Tailwind 임의값 (bg-[#xxx], p-[13px], z-[숫자]) → 토큰 기반 클래스 (p-4 또는 p-polaris-md, z-polaris-modal)
- font-family 직접 지정 → var(--polaris-font-sans) 또는 font-polaris
- font-['...'] Tailwind 임의값 → font-polaris
- native <button>/<input>/<textarea>/<select>/<dialog> → @polaris/ui 컴포넌트로 교체
- inline style 색상 named-color → 토큰
- v0.8에서 제거된 alias (bg-brand-primary, text-fg-primary, bg-surface-{canvas,raised,sunken,border}, bg-status-danger, bg-background-{normal,alternative}, text-polaris-{display-lg,h1~h5,body,meta,tiny}, rounded-polaris-full, bg-blue-5 등)이 남아 있으면: pnpm dlx @polaris/lint polaris-codemod-v08 --apply src
- 컴포넌트 prop 변경: <Input/Textarea/Switch/Checkbox/FileInput/DateTimeInput hint=> → helperText=, <Button variant="outline"> → variant="tertiary", <Progress tone=> → variant=, <Stat deltaTone=> → deltaVariant=, <HStack/VStack> → <Stack direction="row"|""> (codemod v08가 모두 처리)

자동 수정 가능 항목은 프로젝트의 lint --fix 명령으로 처리 (예: pnpm lint --fix 또는 pnpm --filter <pkg> lint --fix). 자세한 토큰 매핑: /polaris-component 또는 docs/for-consumers/migration/v0.7-to-v0.8.md.

이 위반들이 모두 해결될 때까지 작업 완료를 보고하지 마세요.`
    );
    process.exit(0);
  }

  if (configErrorSeen && shouldEmitConfigNotice()) {
    emitContext(
      `[polaris-design] 이 프로젝트에 ESLint(@polaris/lint) 설정이 보이지 않습니다.

폴라리스 디자인 시스템 검증이 비활성화된 상태로 작업이 진행 중입니다. 새 프로젝트라면 \`/polaris-init\`을 먼저 실행해서 토큰·컴포넌트·린트를 세팅한 뒤 코드를 작성하세요. 기존 프로젝트에 온보딩 중이면 사용자에게 폴라리스 적용 여부를 확인하세요.

(이 안내는 한 시간에 한 번만 표시됩니다.)`
    );
    process.exit(0);
  }

  process.exit(0);
}

main();
