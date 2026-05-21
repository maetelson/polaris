#!/usr/bin/env node
/** Smoke test for the PostToolUse lint hook.
 *  Injects a fake event JSON via stdin and asserts the hook produces the right output.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');
const fixtureDir = resolve(repoRoot, 'packages/lint/test/fixtures');
const badFile = resolve(fixtureDir, 'bad.tsx');
const goodFile = resolve(fixtureDir, 'good.tsx');
const hookScript = resolve(__dirname, '..', 'scripts', 'post-edit-lint.mjs');

function runHook({ filePath, toolName = 'Edit', cwd = fixtureDir }) {
  const inputJSON = JSON.stringify({
    tool_name: toolName,
    tool_input: { file_path: filePath },
  });
  return spawnSync('node', [hookScript], {
    input: inputJSON,
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

let pass = 0;
let fail = 0;
const failures = [];
function check(name, cond, info = '') {
  if (cond) { console.log(`  ✓ ${name}`); pass++; }
  else { console.error(`  ✗ ${name}${info ? `: ${info}` : ''}`); fail++; failures.push(name); }
}

console.log('Test 1: clean file produces no output');
{
  const r = runHook({ filePath: goodFile });
  check('exit status 0', r.status === 0, `got ${r.status}, stderr: ${r.stderr}`);
  check('stdout is empty', r.stdout.trim() === '', `stdout: ${r.stdout}`);
}

console.log('\nTest 2: bad file produces additionalContext with violations');
{
  const r = runHook({ filePath: badFile });
  check('exit status 0', r.status === 0, `got ${r.status}, stderr: ${r.stderr}`);
  let parsed;
  try { parsed = JSON.parse(r.stdout); } catch (e) { /* swallow */ }
  check('stdout is valid JSON', !!parsed, `raw stdout: ${r.stdout.slice(0, 200)}`);
  check('JSON has hookSpecificOutput', !!parsed?.hookSpecificOutput);
  check('hookEventName is PostToolUse', parsed?.hookSpecificOutput?.hookEventName === 'PostToolUse');
  const ctx = parsed?.hookSpecificOutput?.additionalContext || '';
  check('additionalContext mentions polaris-design', /polaris-design/.test(ctx));
  check('additionalContext mentions hex/hardcoded', /hex|Hardcoded/i.test(ctx));
  check('additionalContext mentions arbitrary tailwind', /arbitrary|Tailwind/i.test(ctx));
  check('additionalContext mentions font-family', /font-family|fontFamily/i.test(ctx));
  check('additionalContext mentions the bad file path', ctx.includes('bad.tsx'));
}

console.log('\nTest 3: non-source extension is silently skipped');
{
  const r = runHook({ filePath: '/tmp/some-image.png' });
  check('exit status 0', r.status === 0);
  check('stdout is empty', r.stdout.trim() === '');
}

console.log('\nTest 4: missing file_path is silently handled');
{
  const r = spawnSync('node', [hookScript], {
    input: JSON.stringify({ tool_name: 'Edit', tool_input: {} }),
    cwd: fixtureDir,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  check('exit status 0', r.status === 0);
  check('stdout is empty', r.stdout.trim() === '');
}

console.log('\nTest 5: malformed stdin is silently handled');
{
  const r = spawnSync('node', [hookScript], {
    input: 'not json at all',
    cwd: fixtureDir,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  check('exit status 0', r.status === 0);
  check('stdout is empty', r.stdout.trim() === '');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.error(`\nFailed: ${failures.join(', ')}`);
  process.exit(1);
}
