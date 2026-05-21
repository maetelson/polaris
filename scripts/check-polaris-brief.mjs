#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const REQUIRED = [
  '- 화면 목적:',
  '- 사용자/상황:',
  '- 톤앤매너:',
  '- Polaris signature asset:',
  '- 컴포넌트 매핑:',
  '- 토큰/색상 원칙:',
  '- 금지할 선택:',
  '- 검증 방법:',
];

const TARGETS = ['docs/design/ui-brief-template.md', '.github/pull_request_template.md', 'AGENTS.md'];

async function main() {
  const failures = [];
  for (const target of TARGETS) {
    if (!existsSync(target)) {
      failures.push(`Missing ${target}`);
      continue;
    }
    const text = await readFile(target, 'utf8');
    for (const marker of REQUIRED) {
      if (!text.includes(marker)) failures.push(`${target} missing marker: ${marker}`);
    }
  }

  if (failures.length > 0) {
    console.error('Polaris UI Brief contract check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Polaris UI Brief contract check passed.');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
