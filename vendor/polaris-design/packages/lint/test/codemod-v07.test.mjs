/**
 * Smoke tests for the v0.6 → v0.7 codemod.
 *
 * Builds a temp directory with sample TSX / CSS / MDX, runs the codemod
 * with --apply, and asserts that the well-known v0.6 names are gone and
 * the v0.7 names appear. Stops short of asserting exact byte equivalence
 * to keep the fixture readable.
 *
 * Run via: node test/codemod-v07.test.mjs
 */
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const codemod = resolve(__dirname, '../bin/polaris-codemod-v07.mjs');

function runCodemod(dir, args = []) {
  return spawnSync('node', [codemod, ...args, dir], { encoding: 'utf8' });
}

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'polaris-codemod-'));
  return dir;
}

function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true });
}

test('rewrites Tailwind classes in JSX (v0.6 → rc.1)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'a.tsx'), `
      export const X = () => <div className="bg-surface-raised text-fg-primary border-surface-border-strong rounded-polaris-full" />;
    `);
    const r = runCodemod(dir, ['--apply']);
    assert.equal(r.status, 0, r.stderr);
    const out = readFileSync(join(dir, 'a.tsx'), 'utf8');
    // rc.1: surface-raised → layer-surface, fg-primary → label-normal,
    //       surface-border-strong → line-normal, full → pill.
    assert.match(out, /bg-layer-surface/);
    assert.match(out, /text-label-normal/);
    assert.match(out, /border-line-normal/);
    assert.match(out, /rounded-polaris-pill/);
    assert.doesNotMatch(out, /bg-surface-raised/);
    assert.doesNotMatch(out, /text-fg-primary/);
    assert.doesNotMatch(out, /rounded-polaris-full/);
  } finally { cleanup(dir); }
});

test('rewrites typography utility classes (rc.1 names)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'b.tsx'), `
      <h1 className="text-polaris-display-lg" />
      <h2 className="text-polaris-heading-lg" />
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
    // v0.6 → rc.1
    assert.match(out, /text-polaris-display\b/);
    assert.match(out, /text-polaris-heading2\b/); // heading-lg → heading2
    assert.match(out, /text-polaris-body1\b/);     // body-lg → body1
    assert.match(out, /text-polaris-caption1\b/);  // caption → caption1
    // rc.0 → rc.1
    assert.match(out, /text-polaris-display\b/);   // h1 → display
    assert.match(out, /text-polaris-heading3\b/);  // h5 → heading3
    assert.match(out, /text-polaris-body1\b/);     // body → body1
    assert.match(out, /text-polaris-caption1\b/);  // meta → caption1
    assert.match(out, /text-polaris-caption2\b/);  // tiny → caption2
    assert.doesNotMatch(out, /text-polaris-display-lg/);
    assert.doesNotMatch(out, /text-polaris-h1/);
    assert.doesNotMatch(out, /text-polaris-meta\b/);
    assert.doesNotMatch(out, /text-polaris-tiny\b/);
  } finally { cleanup(dir); }
});

test('rewrites primary-* (rc.0) → accent-brand-* (rc.1)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'p.tsx'), `
      <div className="bg-primary-normal text-primary-strong border-primary-normal" />
      const tone = primary.normal;
      const hot = primary.strong;
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'p.tsx'), 'utf8');
    assert.match(out, /bg-accent-brand-normal/);
    assert.match(out, /text-accent-brand-strong/);
    assert.match(out, /border-accent-brand-normal/);
    assert.match(out, /accentBrand\.normal/);
    assert.match(out, /accentBrand\.strong/);
  } finally { cleanup(dir); }
});

test('rewrites bare ramp step `5` → `05` (with negative lookahead)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'r.tsx'), `
      <div className="bg-blue-5 text-purple-5 ring-green-5 bg-blue-50 bg-blue-500" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'r.tsx'), 'utf8');
    assert.match(out, /bg-blue-05\b/);
    assert.match(out, /text-purple-05\b/);
    assert.match(out, /ring-green-05\b/);
    // 50 and 500 must be untouched
    assert.match(out, /bg-blue-50\b/);
    assert.match(out, /bg-blue-500\b/);
  } finally { cleanup(dir); }
});

test('rewrites TS member access on text/surface/brand', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'c.ts'), `
      const a = text.primary;
      const b = surface.canvas;
      const r = surface.raised;
      const c = brand.secondary;
      const d = brand.primaryHover;
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'c.ts'), 'utf8');
    assert.match(out, /label\.normal/);
    assert.match(out, /background\.base/);     // canvas → background.base
    assert.match(out, /layer\.surface/);        // raised → layer.surface
    assert.match(out, /ai\.normal/);
    assert.match(out, /accentBrand\.strong/);   // primaryHover → accentBrand.strong
  } finally { cleanup(dir); }
});

test('does NOT rewrite the bare word `caption` in TS — it overlaps with <caption>', () => {
  // Regression: the codemod used to blindly rewrite `caption` → `meta`,
  // which broke `<caption>` elements inside Table components.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'caption.tsx'), `
      export const X = () => <caption className="text-polaris-caption">Header</caption>;
      const c = textStyle.caption;
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'caption.tsx'), 'utf8');
    // <caption> stays a <caption>
    assert.match(out, /<caption /);
    // Tailwind utility is rewritten — rc.1 maps caption → caption1
    assert.match(out, /text-polaris-caption1/);
    // Member access stays as `caption` for safety — user fixes manually
    assert.match(out, /textStyle\.caption/);
  } finally { cleanup(dir); }
});

test('rewrites CSS custom properties (rc.1)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'd.css'), `
      .x {
        color: var(--polaris-text-primary);
        background: var(--polaris-surface-raised);
        border: 1px solid var(--polaris-surface-border-strong);
        accent: var(--polaris-primary-normal);
      }
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'd.css'), 'utf8');
    assert.match(out, /--polaris-label-normal/);
    assert.match(out, /--polaris-layer-surface/);          // surface-raised → layer-surface
    assert.match(out, /--polaris-line-normal/);
    assert.match(out, /--polaris-accent-brand-normal/);    // primary-normal → accent-brand-normal
    assert.doesNotMatch(out, /--polaris-text-primary/);
    assert.doesNotMatch(out, /--polaris-surface-raised/);
  } finally { cleanup(dir); }
});

test('--check exits non-zero when changes are needed', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'e.tsx'), `<div className="bg-surface-raised" />`);
    const r = runCodemod(dir, ['--check']);
    assert.equal(r.status, 1);
  } finally { cleanup(dir); }
});

test('--check exits zero when no changes needed (rc.1 names)', () => {
  const dir = setup();
  try {
    writeFileSync(join(dir, 'f.tsx'), `<div className="bg-layer-surface" />`);
    const r = runCodemod(dir, ['--check']);
    assert.equal(r.status, 0);
  } finally { cleanup(dir); }
});

test('skips ignored directories (node_modules)', () => {
  const dir = setup();
  try {
    mkdirSync(join(dir, 'node_modules'), { recursive: true });
    writeFileSync(join(dir, 'node_modules/skip.tsx'), `<div className="bg-surface-raised" />`);
    writeFileSync(join(dir, 'src.tsx'), `<div className="bg-surface-raised" />`);
    runCodemod(dir, ['--apply']);
    const skipped = readFileSync(join(dir, 'node_modules/skip.tsx'), 'utf8');
    const rewritten = readFileSync(join(dir, 'src.tsx'), 'utf8');
    assert.match(skipped, /bg-surface-raised/);   // untouched
    assert.match(rewritten, /bg-layer-surface/);
  } finally { cleanup(dir); }
});

test('does not rewrite arbitrary text in MDX prose', () => {
  // MDX path skips TS member rewrites — so prose like "the text"
  // doesn't get mangled. But Tailwind class names DO get rewritten.
  const dir = setup();
  try {
    writeFileSync(join(dir, 'g.mdx'), `
      Use the text primary color for headings.
      <Box className="bg-surface-raised" />
    `);
    runCodemod(dir, ['--apply']);
    const out = readFileSync(join(dir, 'g.mdx'), 'utf8');
    assert.match(out, /Use the text primary color/);   // prose untouched
    assert.match(out, /bg-layer-surface/);              // class rewritten
  } finally { cleanup(dir); }
});
