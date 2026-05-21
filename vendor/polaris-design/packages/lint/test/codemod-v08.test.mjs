/**
 * Smoke tests for the v0.7 → v0.8 codemod.
 *
 * Builds a temp directory with sample TSX / CSS, runs the codemod with
 * --apply, and asserts that the v0.7 deprecated alias names are gone
 * and the v0.8 spec names appear. Stops short of asserting exact byte
 * equivalence to keep the fixture readable.
 *
 * Run via: node --test test/codemod-v08.test.mjs
 */
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const codemod = resolve(__dirname, '../bin/polaris-codemod-v08.mjs');

function runCodemod(dir, args = []) {
  return spawnSync('node', [codemod, ...args, dir], { encoding: 'utf8' });
}

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'polaris-codemod-v08-'));
  return dir;
}

function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true });
}

test('rewrites Tailwind classes (v0.7 deprecated → v0.8 spec)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'a.tsx'), `
      export const X = () => (
        <div className="bg-background-normal text-fg-primary border-surface-border-strong rounded-polaris-full bg-brand-primary text-brand-secondary bg-status-danger" />
      );
    `);
    const r = runCodemod(dir, ['--apply']);
    assert.equal(r.status, 0, r.stderr);
    const out = readFileSync(join(dir, 'a.tsx'), 'utf8');
    assert.match(out, /bg-background-base/);
    assert.match(out, /text-label-normal/);
    assert.match(out, /border-line-normal/);
    assert.match(out, /rounded-polaris-pill/);
    assert.match(out, /bg-accent-brand-normal/);
    assert.match(out, /text-ai-normal/);
    assert.match(out, /bg-state-error/);    // danger → error
    // legacy names must be gone
    assert.doesNotMatch(out, /bg-background-normal/);
    assert.doesNotMatch(out, /text-fg-primary/);
    assert.doesNotMatch(out, /rounded-polaris-full/);
    assert.doesNotMatch(out, /bg-brand-primary/);
    assert.doesNotMatch(out, /bg-status-danger/);
  } finally { cleanup(dir); }
});

test('rewrites typography utility classes (v0.7 → v0.8)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'b.tsx'), `
      <h1 className="text-polaris-display-lg" />
      <h2 className="text-polaris-heading-lg" />
      <h3 className="text-polaris-heading-sm" />
      <p className="text-polaris-body-lg" />
      <small className="text-polaris-caption" />
      <span className="text-polaris-h1" />
      <span className="text-polaris-h5" />
      <span className="text-polaris-body" />
      <span className="text-polaris-meta" />
      <span className="text-polaris-tiny" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'b.tsx'), 'utf8');
    assert.match(out, /text-polaris-display\b/);
    assert.match(out, /text-polaris-heading2\b/);   // heading-lg → heading2
    assert.match(out, /text-polaris-heading4\b/);   // heading-sm → heading4
    assert.match(out, /text-polaris-body1\b/);      // body-lg → body1
    assert.match(out, /text-polaris-caption1\b/);   // caption → caption1
    assert.match(out, /text-polaris-display\b/);    // h1 → display
    assert.match(out, /text-polaris-heading4\b/);   // h5 → heading4
    assert.match(out, /text-polaris-body1\b/);      // body → body1
    assert.match(out, /text-polaris-caption1\b/);   // meta → caption1
    assert.match(out, /text-polaris-caption2\b/);   // tiny → caption2
    assert.doesNotMatch(out, /text-polaris-display-lg/);
    assert.doesNotMatch(out, /text-polaris-heading-sm/);
    assert.doesNotMatch(out, /text-polaris-h1/);
    assert.doesNotMatch(out, /text-polaris-meta\b/);
    assert.doesNotMatch(out, /text-polaris-tiny\b/);
  } finally { cleanup(dir); }
});

test('rewrites status-* classes (danger → error, hover → base)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 's.tsx'), `
      <div className="bg-status-success bg-status-warning bg-status-danger bg-status-info" />
      <div className="text-status-success-hover text-status-danger-hover" />
      <div className="border-status-info border-status-warning-hover" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 's.tsx'), 'utf8');
    assert.match(out, /bg-state-success/);
    assert.match(out, /bg-state-warning/);
    assert.match(out, /bg-state-error/);   // danger → error
    assert.match(out, /bg-state-info/);
    assert.match(out, /text-state-success/);
    assert.match(out, /text-state-error/);
    assert.match(out, /border-state-info/);
    assert.match(out, /border-state-warning/);
    assert.doesNotMatch(out, /-status-/);
    assert.doesNotMatch(out, /-hover\b/); // hover variants folded
  } finally { cleanup(dir); }
});

test('rewrites TS member access on text/surface/brand/status/primary', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'c.ts'), `
      const a = text.primary;
      const b = surface.canvas;
      const r = surface.raised;
      const c = brand.secondary;
      const d = brand.primaryHover;
      const e = status.danger;
      const f = status.successHover;
      const g = primary.normal;
      const h = primary.strong;
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'c.ts'), 'utf8');
    assert.match(out, /label\.normal/);
    assert.match(out, /background\.base/);
    assert.match(out, /layer\.surface/);
    assert.match(out, /ai\.normal/);
    assert.match(out, /accentBrand\.strong/);
    assert.match(out, /state\.error/);            // status.danger → state.error
    assert.match(out, /state\.success/);          // hover folded
    assert.match(out, /accentBrand\.normal/);     // primary.normal
    assert.match(out, /accentBrand\.strong/);     // primary.strong
    assert.doesNotMatch(out, /\btext\.primary\b/);
    assert.doesNotMatch(out, /\bsurface\.canvas\b/);
  } finally { cleanup(dir); }
});

test('preserves surface.popover / surface.modal (v0.7.5 elevation tier)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'e.ts'), `
      const a = surface.popover;
      const b = surface.modal;
      const c = surface.canvas;
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'e.ts'), 'utf8');
    assert.match(out, /surface\.popover/);     // unchanged
    assert.match(out, /surface\.modal/);       // unchanged
    assert.match(out, /background\.base/);     // canvas → background.base
    assert.doesNotMatch(out, /surface\.canvas/);
  } finally { cleanup(dir); }
});

test('rewrites bare ramp step `5` → `05` (negative lookahead)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'r.tsx'), `
      <div className="bg-blue-5 text-purple-5 ring-green-5 bg-blue-50 bg-blue-500 mt-5 gap-5" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'r.tsx'), 'utf8');
    assert.match(out, /bg-blue-05\b/);
    assert.match(out, /text-purple-05\b/);
    assert.match(out, /ring-green-05\b/);
    // unrelated `5`s untouched
    assert.match(out, /bg-blue-50\b/);
    assert.match(out, /bg-blue-500\b/);
    assert.match(out, /\bmt-5\b/);
    assert.match(out, /\bgap-5\b/);
  } finally { cleanup(dir); }
});

test('rewrites CSS custom properties', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'd.css'), `
      .x {
        color: var(--polaris-text-primary);
        background: var(--polaris-surface-raised);
        border: 1px solid var(--polaris-surface-border-strong);
        accent: var(--polaris-brand-primary);
        box-shadow: 0 0 var(--polaris-status-danger);
        page: var(--polaris-background-normal);
        radius: var(--polaris-radius-full);
      }
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'd.css'), 'utf8');
    assert.match(out, /--polaris-label-normal/);
    assert.match(out, /--polaris-layer-surface/);
    assert.match(out, /--polaris-line-normal/);
    assert.match(out, /--polaris-accent-brand-normal/);
    assert.match(out, /--polaris-state-error/);
    assert.match(out, /--polaris-background-base/);
    assert.match(out, /--polaris-radius-pill/);
    assert.doesNotMatch(out, /--polaris-text-primary/);
    assert.doesNotMatch(out, /--polaris-surface-raised/);
    assert.doesNotMatch(out, /--polaris-radius-full/);
  } finally { cleanup(dir); }
});

test('idempotent — running twice produces no further changes', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'i.tsx'), `<div className="bg-layer-surface text-label-normal bg-state-error" />`);
    const r1 = runCodemod(dir, ['--apply']);
    assert.equal(r1.status, 0);
    const r2 = runCodemod(dir, ['--check']);
    assert.equal(r2.status, 0, '--check should pass on already-migrated code');
  } finally { cleanup(dir); }
});

test('--check exits non-zero when changes are needed', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'e.tsx'), `<div className="bg-background-normal" />`);
    const r = runCodemod(dir, ['--check']);
    assert.equal(r.status, 1);
  } finally { cleanup(dir); }
});

test('--check exits zero when no changes needed', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'f.tsx'), `<div className="bg-background-base" />`);
    const r = runCodemod(dir, ['--check']);
    assert.equal(r.status, 0);
  } finally { cleanup(dir); }
});

test('rewrites <Button variant="outline"> → variant="tertiary"', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'btn.tsx'), `
      <Button variant="outline">Cancel</Button>
      <Button variant='outline' size="lg">Discard</Button>
      <Button variant="primary">Save</Button>
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'btn.tsx'), 'utf8');
    assert.match(out, /<Button variant="tertiary">Cancel<\/Button>/);
    assert.match(out, /<Button variant="tertiary" size="lg">/);
    assert.match(out, /<Button variant="primary">Save<\/Button>/);  // untouched
    assert.doesNotMatch(out, /variant=["']outline["']/);
  } finally { cleanup(dir); }
});

test('rewrites hint → helperText (Input / Textarea / Switch / Checkbox / FileInput / DateTimeInput / TimeInput)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'forms.tsx'), `
      <Input label="이름" hint="2자 이상" />
      <Textarea label="메모" hint="최대 500자" rows={4} />
      <Switch label="알림" hint="중요한 변경만 푸시" />
      <Checkbox label="동의" hint="마케팅 수신" />
      <FileInput label="첨부" hint="최대 5MB" />
      <FileDropZone hint="이미지를 끌어다 놓으세요" />
      <DateTimeInput hint="브라우저 시간대" />
      <TimeInput hint="24시간 형식" />
      <CustomThing hint="should NOT change" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'forms.tsx'), 'utf8');
    assert.match(out, /<Input label="이름" helperText="2자 이상" \/>/);
    assert.match(out, /<Textarea[^>]*helperText="최대 500자"/);
    assert.match(out, /<Switch[^>]*helperText="중요한 변경만 푸시"/);
    assert.match(out, /<Checkbox[^>]*helperText="마케팅 수신"/);
    assert.match(out, /<FileInput[^>]*helperText="최대 5MB"/);
    assert.match(out, /<FileDropZone helperText="이미지를 끌어다 놓으세요"/);
    assert.match(out, /<DateTimeInput helperText="브라우저 시간대"/);
    assert.match(out, /<TimeInput helperText="24시간 형식"/);
    // Unknown components retain `hint=` (we only rewrite known ones)
    assert.match(out, /<CustomThing hint="should NOT change"/);
  } finally { cleanup(dir); }
});

test('rewrites <Progress tone=> → variant= and <Stat deltaTone=> → deltaVariant=', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'pg.tsx'), `
      <Progress value={40} tone="success" />
      <Stat label="조회" value={1234} delta="+12%" deltaTone="positive" />
      <Stat label="구독" value={42} deltaTone='accent' delta="+1" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'pg.tsx'), 'utf8');
    assert.match(out, /<Progress value=\{40\} variant="success"/);
    assert.match(out, /deltaVariant="positive"/);
    assert.match(out, /deltaVariant='accent'/);
    assert.doesNotMatch(out, /\btone=["']/);
    assert.doesNotMatch(out, /\bdeltaTone=/);
  } finally { cleanup(dir); }
});

test('rewrites <HStack> / <VStack> → <Stack direction="row"> / <Stack>', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'stk.tsx'), `
      import { HStack, VStack, Box } from '@polaris/ui';
      export const X = () => (
        <VStack gap="md">
          <HStack align="center" gap="sm">
            <Box />
            <Box />
          </HStack>
          <HStack />
          <VStack />
        </VStack>
      );
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'stk.tsx'), 'utf8');
    // Tag rewrites
    assert.match(out, /<Stack direction="row" align="center" gap="sm">/);
    assert.match(out, /<\/Stack>/);
    assert.match(out, /<Stack direction="row" \/>/);
    assert.match(out, /<Stack gap="md">/);
    assert.match(out, /<Stack \/>/);
    // Import rewrite
    assert.match(out, /import \{[^}]*Stack[^}]*\} from '@polaris\/ui'/);
    assert.doesNotMatch(out, /\bHStack\b/);
    assert.doesNotMatch(out, /\bVStack\b/);
  } finally { cleanup(dir); }
});

test('rewrites surface-border / -strong across all utility prefixes (bg / divide / ring / etc.)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'sb.tsx'), `
      <hr className="bg-surface-border" />
      <ul className="divide-y divide-surface-border" />
      <Switch className="data-[state=unchecked]:bg-surface-border-strong" />
      <div className="ring-1 ring-surface-border" />
      <div className="border border-surface-border-strong" />
      <span className="text-surface-border" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'sb.tsx'), 'utf8');
    assert.match(out, /bg-line-neutral/);
    assert.match(out, /divide-line-neutral/);
    assert.match(out, /bg-line-normal/);             // surface-border-strong
    assert.match(out, /ring-line-neutral/);
    assert.match(out, /border-line-normal/);
    // text-* prefix isn't in the prefix list (intentional — text colors
    // never used this token), so it's left for human review.
    assert.match(out, /text-surface-border/);
    // No residual surface-border / -strong in covered prefixes
    assert.doesNotMatch(out, /bg-surface-border\b/);
    assert.doesNotMatch(out, /divide-surface-border\b/);
    assert.doesNotMatch(out, /bg-surface-border-strong\b/);
    assert.doesNotMatch(out, /ring-surface-border\b/);
    assert.doesNotMatch(out, /border-surface-border-strong\b/);
  } finally { cleanup(dir); }
});

test('rewrites named-import bindings on @polaris/ui AND @polaris/ui/tokens', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'imp.ts'), [
      `import { text } from '@polaris/ui';`,
      `import { brand } from '@polaris/ui/tokens';`,
      `import { status, accentBrand } from '@polaris/ui/tokens';`,
      `import { text, label } from '@polaris/ui/tokens';`,
      `import { primary, line } from '@polaris/ui';`,
      // Non-polaris import — must NOT be touched
      `import { text } from 'some-other-pkg';`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'imp.ts'), 'utf8');
    // Single-name renames
    assert.match(out, /import \{ label \} from '@polaris\/ui'/);
    assert.match(out, /import \{ accentBrand \} from '@polaris\/ui\/tokens'/);
    // Mixed-import rename — leaves siblings intact
    assert.match(out, /import \{ state, accentBrand \} from '@polaris\/ui\/tokens'/);
    // The `text` (→ `label`) + `label` mixed-import case used to leave
    // a duplicate `{ label, label }` for TS to flag. rc.6 dedupes
    // in-place — the result is a single entry.
    assert.match(out, /import \{ label \} from '@polaris\/ui\/tokens'/);
    assert.doesNotMatch(out, /\{ label, label \}/);
    assert.match(out, /import \{ accentBrand, line \} from '@polaris\/ui'/);
    // Non-polaris untouched
    assert.match(out, /import \{ text \} from 'some-other-pkg'/);
  } finally { cleanup(dir); }
});

test('brand.secondary* → ai.* member access AUTO-ADDS the `ai` import (rc.1 regression)', () => {
  // The bug: TS_TOKEN_RENAMES rewrites `brand.secondary` → `ai.normal`
  // and `brand.secondaryHover` → `ai.strong`, but the import-binding
  // rename only swaps `brand` → `accentBrand`. Result before fix:
  //   import { accentBrand } from '@polaris/ui';
  //   const x = ai.normal;       // ← undefined, build breaks
  // The post-pass `normalizePolarisImports` scans the file body for
  // `\b<ns>\.` usage and appends missing namespaces to the first
  // polaris import.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'mix.ts'), [
      `import { brand } from '@polaris/ui/tokens';`,
      `const a = brand.primary;       // → accentBrand.normal`,
      `const b = brand.secondary;     // → ai.normal (this is the broken case)`,
      `const c = brand.secondaryHover;// → ai.strong`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'mix.ts'), 'utf8');
    assert.match(out, /accentBrand\.normal/);
    assert.match(out, /ai\.normal/);
    assert.match(out, /ai\.strong/);
    // Both namespaces must end up in the import — that's the whole point.
    assert.match(out, /import\s*\{[^}]*\baccentBrand\b[^}]*\}\s*from\s*['"]@polaris\/ui\/tokens['"]/);
    assert.match(out, /import\s*\{[^}]*\bai\b[^}]*\}\s*from\s*['"]@polaris\/ui\/tokens['"]/);
    // No bare `brand` left
    assert.doesNotMatch(out, /\bbrand\.\w/);
  } finally { cleanup(dir); }
});

test('does NOT re-add an already-imported namespace (idempotent)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'idem.ts'), [
      `import { accentBrand, ai } from '@polaris/ui/tokens';`,
      `const a = ai.normal;`,
      `const b = accentBrand.normal;`,
    ].join('\n'));
    const r1 = runCodemod(dir, ['--apply']);
    assert.equal(r1.status, 0);
    const r2 = runCodemod(dir, ['--check']);
    assert.equal(r2.status, 0, '--check should pass on already-correct code');
    const out = readFileSync(join(dir, 'idem.ts'), 'utf8');
    // Single ai import — no duplicate
    const aiCount = (out.match(/\bai\b/g) ?? []).length;
    assert.ok(aiCount >= 2, 'ai still referenced in body');
    const aiInImports = (out.match(/import\s*\{[^}]*\bai\b/g) ?? []).length;
    assert.equal(aiInImports, 1, 'exactly one import has `ai`');
  } finally { cleanup(dir); }
});

test('does NOT add value namespaces to `import type { ... }` lines (typecheck preservation)', () => {
  // Bug Codex caught: prior code blindly appended `ai` to the first
  // polaris import, even if it was `import type { … }`. Result:
  //   import type { ButtonProps, ai } from '@polaris/ui';
  //   const x = ai.normal;  // TS2693 — ai is a type, not a value
  // The fix splits matches into (type-only, value) and only ever
  // appends to a value import. If none exists, a fresh value import
  // is synthesized at the position of the first existing polaris import.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'mix.ts'), [
      `import type { ButtonProps } from '@polaris/ui';`,
      `import { brand } from '@polaris/ui/tokens';`,
      `const x = brand.secondary;     // → ai.normal (post-pass adds ai import)`,
      `export type Props = ButtonProps;`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'mix.ts'), 'utf8');
    // Type-only import must remain type-only and NOT pick up `ai`
    assert.match(out, /import type \{ ButtonProps \} from '@polaris\/ui'/);
    assert.doesNotMatch(out, /import type \{[^}]*\bai\b/);
    // ai must end up in a VALUE import (the existing /tokens one)
    assert.match(out, /import \{[^}]*\bai\b[^}]*\} from '@polaris\/ui\/tokens'/);
    // Member access still rewritten
    assert.match(out, /ai\.normal/);
    assert.doesNotMatch(out, /\bbrand\./);
  } finally { cleanup(dir); }
});

test('synthesizes a fresh value import when only type imports exist (with active rewrite)', () => {
  // Edge case: file imports ONLY types from @polaris/ui, AND has a
  // v0.7 member-access pattern that rewrites to a v0.8 destination
  // namespace. We can't append the new value binding to a type-only
  // import (TS2693) — must synthesize a fresh `import { label } from
  // …` line.
  //
  // The rewrite trigger here is `text.primary` → `label.normal`. The
  // gate (`changes > 0`) needs an actual rewrite to activate the
  // post-pass, so this fixture must contain something that rewrites.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'typesonly.ts'), [
      `import type { ColorPair } from '@polaris/ui/tokens';`,
      `// text.primary is a v0.7 member-access that flips to label.normal.`,
      `// Pretend "text" was previously imported as a value somewhere upstream;`,
      `// codemod rewrites the pattern and trusts post-pass to fix imports.`,
      `export const myColor: ColorPair = text.primary as unknown as ColorPair;`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'typesonly.ts'), 'utf8');
    // text.primary rewritten to label.normal — confirms post-pass ran
    assert.match(out, /label\.normal/);
    // Original type import preserved verbatim
    assert.match(out, /import type \{ ColorPair \} from '@polaris\/ui\/tokens'/);
    // New synthesized value import for `label`, on the same subpath
    // as the first existing polaris import (here: /tokens).
    assert.match(out, /^import \{ label \} from '@polaris\/ui\/tokens';/m);
    // No type-pollution — label must NOT be inside an `import type {...}` block
    assert.doesNotMatch(out, /import type \{[^}]*\blabel\b/);
  } finally { cleanup(dir); }
});

test('surface.* rewrite ALSO adds the destination namespace import (rc.3 regression)', () => {
  // Codex caught: `surface.raised` → `layer.surface`, `surface.border`
  // → `line.neutral`, `surface.canvas` → `background.base` rewrite the
  // member access but if the file imports `{ surface }` without
  // `{ layer, line, background }`, consumer build breaks with
  // "layer is not defined". The fix: NAMESPACES_TO_CHECK now includes
  // every destination namespace of TS_TOKEN_RENAMES, not just the
  // `brand`-family ones.
  const dir = setup();
  try {
    writeFileSync(join(dir, 's.ts'), [
      `import { surface } from '@polaris/ui/tokens';`,
      `export const a = surface.raised;`,
      `export const b = surface.border;`,
      `export const c = surface.canvas;`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 's.ts'), 'utf8');
    // Member access rewrites
    assert.match(out, /export const a = layer\.surface;/);
    assert.match(out, /export const b = line\.neutral;/);
    assert.match(out, /export const c = background\.base;/);
    // Import normalize: layer + line + background must be added
    assert.match(out, /import\s*\{[^}]*\blayer\b/);
    assert.match(out, /import\s*\{[^}]*\bline\b/);
    assert.match(out, /import\s*\{[^}]*\bbackground\b/);
    // No surface.<destroyed> left over
    assert.doesNotMatch(out, /\bsurface\.(raised|border|canvas)\b/);
  } finally { cleanup(dir); }
});

test('background.normal/alternative member access → background.base / fill.neutral', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'bg.ts'), [
      `import { background } from '@polaris/ui/tokens';`,
      `const a = background.normal;`,
      `const b = background.alternative;`,
      `const c = background.base;       // unchanged — kept in v0.8`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'bg.ts'), 'utf8');
    assert.match(out, /const a = background\.base;/);
    assert.match(out, /const b = fill\.neutral;/);
    assert.match(out, /const c = background\.base;\s*\/\/ unchanged/);
    // fill must be auto-imported (since `fill.neutral` now appears)
    assert.match(out, /import\s*\{[^}]*\bfill\b/);
  } finally { cleanup(dir); }
});

test('radius.full → radius.pill member access', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'r.ts'), [
      `import { radius } from '@polaris/ui/tokens';`,
      `const r = radius.full;`,
      `const s = radius.md;     // unchanged`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'r.ts'), 'utf8');
    assert.match(out, /const r = radius\.pill;/);
    assert.match(out, /const s = radius\.md;/);
    // radius already imported — no new import needed (idempotent)
    const radiusImports = (out.match(/import\s*\{[^}]*\bradius\b/g) ?? []).length;
    assert.equal(radiusImports, 1);
  } finally { cleanup(dir); }
});

test('does NOT add namespace import to files with no v0.8 rewrite (rc.4 regression)', () => {
  // Codex caught: previous version invoked `normalizePolarisImports`
  // unconditionally, so a file that already used `line.normal` for a
  // local object — without ANY v0.7 token / class / variable that
  // would trigger a rewrite — would still get `import { Button, line }
  // from '@polaris/ui'` injected, conflicting with the local
  // `const line = { normal: 1 }` declaration. The fix gates the
  // post-pass on `changes > 0` AND skips namespaces that have a
  // local declaration in the file.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'noop.ts'), [
      `import { Button } from '@polaris/ui';`,
      `const line = { normal: 1 };`,
      `export const x = line.normal;`,
      `export const b = Button;`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'noop.ts'), 'utf8');
    // Import line should be UNCHANGED — no v0.7 alias to rewrite anywhere.
    assert.match(out, /^import \{ Button \} from '@polaris\/ui';/m);
    assert.doesNotMatch(out, /import\s*\{[^}]*\bline\b[^}]*\}\s*from\s*['"]@polaris/);
    // local `line` declaration intact, member access intact.
    assert.match(out, /const line = \{ normal: 1 \};/);
    assert.match(out, /export const x = line\.normal;/);
  } finally { cleanup(dir); }
});

test('SKIPS adding a namespace whose name shadows a local declaration', () => {
  // Even when the file IS a migration target (some v0.7 rewrite fires
  // elsewhere), if the destination namespace name collides with a
  // local `const | let | var | function | class`, do not append.
  // Otherwise we'd write `import { Button, line }` next to
  // `const line = …` and trip a duplicate-declaration error.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'shadow.ts'), [
      // v0.7-era class that triggers a rewrite (forces the post-pass
      // to run via the changes>0 gate)
      `import { Button } from '@polaris/ui';`,
      `const line = { normal: 1 };       // shadows the v0.8 'line' namespace`,
      `const cls = "bg-fg-primary";      // → bg-label-normal (rewrite fires)`,
      `export const x = line.normal;     // local member access`,
      `export const b = Button;`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'shadow.ts'), 'utf8');
    // The v0.7 alias rewrite happened — confirms post-pass was reached
    assert.match(out, /bg-label-normal/);
    // But the local-shadowed `line` was NOT auto-imported
    assert.match(out, /^import \{ Button \} from '@polaris\/ui';/m);
    assert.doesNotMatch(out, /import\s*\{[^}]*\bline\b[^}]*\}\s*from\s*['"]@polaris/);
  } finally { cleanup(dir); }
});

test('dedupes Stack import after HStack/VStack → Stack rewrite (rc.5 regression)', () => {
  // Codex caught: a file that imported BOTH `Stack` (already used) and
  // `HStack` / `VStack` (legacy) ends up with three `Stack` entries
  // after the JSX_RENAMES rewrite renames the H/VStack identifiers
  // inside imports — leading to "Identifier 'Stack' has already been
  // declared" at TS compile.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'dup.tsx'), [
      `import { Stack, Input, HStack, VStack } from '@polaris/ui';`,
      `export const x = (`,
      `  <Stack gap={2}>`,
      `    <HStack><Input /></HStack>`,
      `    <VStack><Input /></VStack>`,
      `  </Stack>`,
      `);`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'dup.tsx'), 'utf8');
    // Single `Stack` entry in import — no duplicates
    const stackInImports = (out.match(/import\s*\{[^}]*\bStack\b[^}]*\}/g) ?? [])
      .reduce((n, m) => n + (m.match(/\bStack\b/g) ?? []).length, 0);
    assert.equal(stackInImports, 1, 'Stack should appear exactly once across all polaris imports');
    // No HStack / VStack identifiers anywhere
    assert.doesNotMatch(out, /\bHStack\b/);
    assert.doesNotMatch(out, /\bVStack\b/);
    // JSX still rewritten to <Stack direction="row"> / <Stack>
    assert.match(out, /<Stack direction="row"/);
  } finally { cleanup(dir); }
});

test('preserves multi-line import body when adding missing namespace (rc.5 regression)', () => {
  // Codex caught: rc.5 `appendToImportBody` did `body.trim()` then
  // jammed the missing namespace at the end:
  //   body = "\n  Badge,\n  TableSkeleton,\n  VStack,\n"
  //   trimmed.trim() = "Badge,\n  TableSkeleton,\n  VStack,"
  //   result = "{ ... VStack,, state }"   ←  comma jam + line collapse
  // After fix: parse entries, dedupe, rebuild with line-per-entry.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'ml.tsx'), [
      `import {`,
      `  Badge,`,
      `  TableSkeleton,`,
      `  VStack,`,
      `} from '@polaris/ui';`,
      `import { brand } from '@polaris/ui/tokens';`,
      `export const x = brand.secondary;     // → ai.normal — needs ai import`,
      `export const y = (`,
      `  <VStack gap={2}>`,
      `    <Badge tone="success">ok</Badge>`,
      `    <TableSkeleton />`,
      `  </VStack>`,
      `);`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'ml.tsx'), 'utf8');
    // Multi-line shape preserved AND `ai` appended as its own indented
    // line (not jammed onto the previous one). The codemod picks the
    // FIRST value polaris import (here: the multi-line `@polaris/ui`)
    // as the destination, per the documented "first value import" rule.
    assert.match(
      out,
      /import \{\n  Badge,\n  TableSkeleton,\n  Stack,\n  ai,\n\} from '@polaris\/ui';/,
    );
    // `accentBrand` import is unchanged (single-line shape preserved)
    assert.match(out, /import \{ accentBrand \} from '@polaris\/ui\/tokens'/);
    // Member access rewritten
    assert.match(out, /ai\.normal/);
    // No `state` jammed in (the specific corruption Codex hit on collection-builder)
    assert.doesNotMatch(out, /\bstate\b\s*\}/);
    // No `VStack` residue, no double commas
    assert.doesNotMatch(out, /\bVStack\b/);
    assert.doesNotMatch(out, /,,/);
  } finally { cleanup(dir); }
});

test('ABORTS the file when rewrite would shadow a local declaration (rc.6 silent-bug fix)', () => {
  // Codex's real-consumer regression: previous rc.5 safeguard SKIPPED
  // adding the import while still applying the rewrite — so
  // `surface.border` became `line.neutral`, which then bound to the
  // local `const line = …`, build passed, runtime value was wrong.
  // The fix: detect upfront, leave file untouched, exit non-zero with
  // explicit warning so the consumer fixes by hand.
  const dir = setup();
  try {
    const original = [
      `import { surface } from '@polaris/ui/tokens';`,
      `const line = { normal: 1 };`,
      `export const x = surface.border;`,
    ].join('\n');
    writeFileSync(join(dir, 'shadow.ts'), original);
    const r = runCodemod(dir, ['--apply']);
    // Conflict path → exit 1
    assert.equal(r.status, 1);
    // Stderr names the file and explains the conflict
    assert.match(r.stderr, /shadow\.ts/);
    assert.match(r.stderr, /local 'line'/);
    // File untouched — original content intact, no rewrite, no import added
    const out = readFileSync(join(dir, 'shadow.ts'), 'utf8');
    assert.equal(out, original);
  } finally { cleanup(dir); }
});

test('ABORTS the file when an aliased polaris import shadows the destination namespace', () => {
  // `import { ai as aiToken }` means the bare `ai` binding is NOT in
  // scope. If codemod rewrote `brand.secondary` → `ai.normal`, the
  // result would reference an undefined `ai`. Detect upstream, abort.
  const dir = setup();
  try {
    const original = [
      `import { brand, ai as aiToken } from '@polaris/ui/tokens';`,
      `const _stay = aiToken;`,
      `export const x = brand.secondary;`,
    ].join('\n');
    writeFileSync(join(dir, 'aliased.ts'), original);
    const r = runCodemod(dir, ['--apply']);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /aliased\.ts/);
    assert.match(r.stderr, /'ai as <alias>'/);
    const out = readFileSync(join(dir, 'aliased.ts'), 'utf8');
    assert.equal(out, original);
  } finally { cleanup(dir); }
});

test('ABORTS the file when HStack/VStack are imported with an alias (JSX tag rewrite gap)', () => {
  // `<Row>` won't match the codemod's `<HStack>` / `<VStack>` JSX-tag
  // pattern, so `direction="row"` would be silently dropped from the
  // rewrite — a layout-semantics regression. Treat as conflict.
  const dir = setup();
  try {
    const original = [
      `import { Stack, HStack as Row } from '@polaris/ui';`,
      `export const x = <Row gap={2} />;`,
    ].join('\n');
    writeFileSync(join(dir, 'alias-stack.tsx'), original);
    const r = runCodemod(dir, ['--apply']);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /alias-stack\.tsx/);
    assert.match(r.stderr, /HStack\/VStack with an alias/);
    const out = readFileSync(join(dir, 'alias-stack.tsx'), 'utf8');
    assert.equal(out, original);
  } finally { cleanup(dir); }
});

test('dedupe by BINDING preserves `Stack as Row` even when bare `Stack` exists', () => {
  // Sibling concern: when an aliased-stack-import survives because the
  // user fixed it manually before re-running, the dedupe pass must NOT
  // drop the alias. Codex caught this on the previous rc — dedupe was
  // matching on specifier (`Stack`) and dropping `Stack as Row`.
  // (We can't trigger this through HStack since it's now caught as a
  // conflict; use a synthetic case where both Stack and `Stack as Row`
  // appear with no alias-stack import to test the dedupe primitive.)
  const dir = setup();
  try {
    // Use a pure-rewrite trigger that doesn't touch the imports.
    writeFileSync(join(dir, 'd.tsx'), [
      `import { Stack, Stack as RenamedStack } from '@polaris/ui';`,
      `// rewrite trigger: bg-fg-primary → bg-label-normal`,
      `const cls = "bg-fg-primary";`,
      `export const x = <Stack /><RenamedStack /> as any;`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'd.tsx'), 'utf8');
    // Both bindings preserved (binding=Stack and binding=RenamedStack)
    assert.match(out, /import \{ Stack, Stack as RenamedStack \}/);
  } finally { cleanup(dir); }
});

test('does NOT touch files without an existing @polaris/ui import', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'unrelated.ts'), [
      `// File doesn't import from @polaris/ui — codemod must NOT add one.`,
      `function getColor() { return ai.normal; } // local variable named 'ai'`,
      `const ai = { normal: '#fff' };`,
    ].join('\n'));
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'unrelated.ts'), 'utf8');
    assert.doesNotMatch(out, /from\s*['"]@polaris\/ui/);
  } finally { cleanup(dir); }
});

test('skips ignored directories (node_modules)', () => {
  const dir = setup();
  try {
    mkdirSync(join(dir, 'node_modules'), { recursive: true });
    writeFileSync(join(dir, 'node_modules/skip.tsx'), `<div className="bg-background-normal" />`);
    writeFileSync(join(dir, 'src.tsx'), `<div className="bg-background-normal" />`);
    runCodemod(dir, ['--apply']);
    const skipped = readFileSync(join(dir, 'node_modules/skip.tsx'), 'utf8');
    const rewritten = readFileSync(join(dir, 'src.tsx'), 'utf8');
    assert.match(skipped, /bg-background-normal/);   // untouched
    assert.match(rewritten, /bg-background-base/);
  } finally { cleanup(dir); }
});
