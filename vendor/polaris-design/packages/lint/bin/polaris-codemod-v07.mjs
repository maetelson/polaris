#!/usr/bin/env node
/**
 * polaris-codemod-v07 — rewrites v0.6 tokens / Tailwind classes / CSS
 * variables to their v0.7 spec names.
 *
 * Usage:
 *   pnpm dlx @polaris/lint polaris-codemod-v07 [paths...]              # dry run
 *   pnpm dlx @polaris/lint polaris-codemod-v07 --apply [paths...]      # write
 *   pnpm dlx @polaris/lint polaris-codemod-v07 --check [paths...]      # CI mode
 *
 * Defaults to scanning the current directory. Skips node_modules, dist,
 * .turbo, .next and any path matching .gitignore-style patterns by
 * never recursing into directories with names listed in IGNORED_DIRS.
 *
 * The script is regex-based (no AST). It targets the high-volume
 * patterns documented in `docs/for-consumers/migration/v0.6-to-v0.7.md`. Dynamic
 * class strings (`text-${tone}-primary`) and prop-passed token names
 * are NOT rewritten — flag them in CR.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, extname, relative } from 'node:path';

const IGNORED_DIRS = new Set([
  'node_modules', 'dist', '.next', '.turbo', '.git', 'coverage',
  'build', 'out', '.cache', '.vercel', 'storybook-static',
]);
const SOURCE_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.scss', '.mdx',
]);

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const targets = args.filter((a) => !a.startsWith('--'));
const APPLY = flags.has('--apply');
const CHECK = flags.has('--check');
const VERBOSE = flags.has('--verbose');

if (flags.has('--help') || flags.has('-h')) {
  console.log(`polaris-codemod-v07 — v0.6 → v0.7 token rewriter

Usage:
  polaris-codemod-v07 [paths...]            Dry-run (default). Reports planned changes.
  polaris-codemod-v07 --apply [paths...]    Apply changes in place.
  polaris-codemod-v07 --check [paths...]    Exit non-zero if any change is needed (CI).
  polaris-codemod-v07 --verbose             Print every per-file change.

Paths default to '.' (current directory).
`);
  process.exit(0);
}

if (targets.length === 0) targets.push('.');

// ───── Rewrite tables ────────────────────────────────────────────────

/** TS/TSX/JS — token member access. Word-boundary aware so we don't
 *  rewrite `someText.primary` (only `text.primary`).
 *
 *  Targets v0.7-rc.1 spec names. Handles BOTH v0.6 → rc.1 and rc.0 → rc.1
 *  in a single pass; renames are ordered so rc.0-named tokens (e.g.
 *  `primary.normal`) match before they might be hit by a generic
 *  pattern. */
const TS_TOKEN_RENAMES = [
  // ───── v0.6 → rc.1 ─────
  // text.* → label.*
  [/\btext\.primary\b/g,        'label.normal'],
  [/\btext\.secondary\b/g,      'label.neutral'],
  [/\btext\.muted\b/g,          'label.alternative'],
  [/\btext\.onBrand\b/g,        'label.inverse'],
  [/\btext\.onStatus\b/g,       'label.inverse'],
  // surface.* → layer.* / background.* / line.* / fill.*
  // (rc.1 splits surface concerns: page bg = background.base,
  //  raised cards = layer.surface, dividers = line.*)
  [/\bsurface\.canvas\b/g,       'background.base'],
  [/\bsurface\.raised\b/g,       'layer.surface'],
  [/\bsurface\.sunken\b/g,       'fill.neutral'],
  [/\bsurface\.borderStrong\b/g, 'line.normal'],
  [/\bsurface\.border\b/g,       'line.neutral'],
  // brand.* → accentBrand.* / ai.*
  [/\bbrand\.primaryHover\b/g,    'accentBrand.strong'],
  [/\bbrand\.primarySubtle\b/g,   'accentBrand.bg'],
  [/\bbrand\.primary\b/g,         'accentBrand.normal'],
  [/\bbrand\.secondaryHover\b/g,  'ai.strong'],
  [/\bbrand\.secondarySubtle\b/g, 'ai.hover'],
  [/\bbrand\.secondary\b/g,       'ai.normal'],

  // ───── rc.0 → rc.1 ─────
  // primary.* (rc.0 alias) → accentBrand.*
  [/\bprimary\.normal\b/g, 'accentBrand.normal'],
  [/\bprimary\.strong\b/g, 'accentBrand.strong'],
  // background.normal/alternative (rc.0) → rc.1 split. We pick the most
  // common usage: `normal` was the raised card color → `layer.surface`,
  // `alternative` was the tinted page → `fill.neutral`. Page-level base
  // bg cases need manual fixup to `background.base`.
  // (NOT auto-renamed — both names still work in rc.1 as deprecated
  // aliases. Manual rewrite in PRs is safer than a guess.)

  // typography keys — rc.0 → rc.1 spec names
  [/\bdisplayLg\b/g, 'display'],     // v0.6 → rc.1 display (40, was rc.0 60)
  [/\bdisplayMd\b/g, 'title'],       // v0.6 → rc.1 title (32)
  [/\bheadingLg\b/g, 'heading2'],    // v0.6 → rc.1 heading2 (24)
  [/\bheadingMd\b/g, 'heading3'],    // v0.6 → rc.1 heading3 (20)
  // headingSm intentionally NOT renamed — no clean spec equivalent
  [/\bbodyLg\b/g,    'body1'],
  // rc.0 spec-ish keys → rc.1 spec keys
  [/\btextStyle\.h1\b/g,    'textStyle.display'],
  [/\btextStyle\.h2\b/g,    'textStyle.title'],
  [/\btextStyle\.h3\b/g,    'textStyle.heading1'],
  [/\btextStyle\.h4\b/g,    'textStyle.heading2'],
  [/\btextStyle\.h5\b/g,    'textStyle.heading3'],
  [/\btextStyle\.body\b/g,  'textStyle.body1'],
  [/\btextStyle\.bodySm\b/g, 'textStyle.body2'],
  [/\btextStyle\.meta\b/g,  'textStyle.caption1'],
  [/\btextStyle\.tiny\b/g,  'textStyle.caption2'],
  // bodySm (rc.0 v0.7) stays as deprecated alias; not auto-renamed
  // because consumers also use `bodySm` for prop-passed style names.
  // `caption` is intentionally NOT renamed in TS — the word also names
  // the HTML <caption> element and the React `caption` JSX intrinsic,
  // so a blind `\bcaption\b` rewrite would mangle table components.
  // The Tailwind utility `text-polaris-caption` IS rewritten below.
];

/** Tailwind class renames. Match on full class names with hyphenated
 *  prefixes so we don't accidentally rewrite substrings inside larger
 *  identifiers.
 *
 *  Single pass handles v0.6 + rc.0 → rc.1. */
const TAILWIND_RENAMES = [
  // ───── v0.6 → rc.1 ─────
  // foreground (text) tokens — class form `text-fg-*`
  [/\btext-fg-primary\b/g,    'text-label-normal'],
  [/\btext-fg-secondary\b/g,  'text-label-neutral'],
  [/\btext-fg-muted\b/g,      'text-label-alternative'],
  [/\btext-fg-on-brand\b/g,   'text-label-inverse'],
  [/\btext-fg-on-status\b/g,  'text-label-inverse'],
  // surface → layer / fill / line / background
  [/\bbg-surface-canvas\b/g,            'bg-background-base'],
  [/\bbg-surface-raised\b/g,            'bg-layer-surface'],
  [/\bbg-surface-sunken\b/g,            'bg-fill-neutral'],
  [/\bborder-surface-border-strong\b/g, 'border-line-normal'],
  [/\bborder-surface-border\b/g,        'border-line-neutral'],
  // brand → accent-brand / ai
  [/\bbg-brand-primary-hover\b/g,    'bg-accent-brand-strong'],
  [/\btext-brand-primary-hover\b/g,  'text-accent-brand-strong'],
  [/\bbg-brand-primary-subtle\b/g,   'bg-accent-brand-bg'],
  [/\bbg-brand-primary\b/g,          'bg-accent-brand-normal'],
  [/\btext-brand-primary\b/g,        'text-accent-brand-normal'],
  [/\bbg-brand-secondary-hover\b/g,  'bg-ai-strong'],
  [/\btext-brand-secondary-hover\b/g,'text-ai-strong'],
  [/\bbg-brand-secondary-subtle\b/g, 'bg-ai-hover'],
  [/\bbg-brand-secondary\b/g,        'bg-ai-normal'],
  [/\btext-brand-secondary\b/g,      'text-ai-normal'],

  // ───── rc.0 → rc.1 ─────
  // primary-* (rc.0 alias) → accent-brand-*
  [/\bbg-primary-normal\b/g,     'bg-accent-brand-normal'],
  [/\bbg-primary-strong\b/g,     'bg-accent-brand-strong'],
  [/\btext-primary-normal\b/g,   'text-accent-brand-normal'],
  [/\btext-primary-strong\b/g,   'text-accent-brand-strong'],
  [/\bborder-primary-normal\b/g, 'border-accent-brand-normal'],
  // background.normal/alternative — most common usage was raised cards
  // / tinted page bg. NOT auto-renamed because page-level base cases
  // need `background-base`. Both rc.0 names still work as aliases.

  // typography — rc.0 spec-ish keys → rc.1 spec keys
  [/\btext-polaris-h1\b/g,         'text-polaris-display'],
  [/\btext-polaris-h2\b/g,         'text-polaris-title'],
  [/\btext-polaris-h3\b/g,         'text-polaris-heading1'],
  [/\btext-polaris-h4\b/g,         'text-polaris-heading2'],
  [/\btext-polaris-h5\b/g,         'text-polaris-heading3'],
  [/\btext-polaris-body\b(?!-)/g,  'text-polaris-body1'], // not body-sm
  [/\btext-polaris-body-sm\b/g,    'text-polaris-body2'],
  [/\btext-polaris-meta\b/g,       'text-polaris-caption1'],
  [/\btext-polaris-tiny\b/g,       'text-polaris-caption2'],
  // detail (14/Medium) stays — no rc.1 spec equivalent

  // ───── v0.6 typography (also handle here for direct v0.6 → rc.1) ─────
  [/\btext-polaris-display-lg\b/g, 'text-polaris-display'],
  [/\btext-polaris-display-md\b/g, 'text-polaris-title'],
  [/\btext-polaris-heading-lg\b/g, 'text-polaris-heading2'],
  [/\btext-polaris-heading-md\b/g, 'text-polaris-heading3'],
  // text-polaris-heading-sm intentionally NOT renamed (no clean equivalent)
  [/\btext-polaris-body-lg\b/g,    'text-polaris-body1'],
  [/\btext-polaris-caption\b/g,    'text-polaris-caption1'],

  // radius
  [/\brounded-polaris-full\b/g, 'rounded-polaris-pill'],

  // primitive ramp step — `bg-blue-5` → `bg-blue-05` etc. (ramp10 alias
  // means both work, but spec uses leading-zero form). Negative
  // lookahead ensures we don't match `bg-blue-50`, `bg-blue-500`.
  [/\b(bg|text|border|fill|stroke|outline|ring|shadow|from|via|to|caret|accent|placeholder|divide)-(blue|dark-blue|green|orange|red|purple|sky-blue|blue-supplementary|violet|cyan|yellow)-5\b(?!\d)/g,
    '$1-$2-05'],
];

/** CSS custom property renames. Apply to *.css / *.scss only. */
const CSS_VAR_RENAMES = [
  // ───── v0.6 → rc.1 ─────
  [/--polaris-text-primary\b/g,           '--polaris-label-normal'],
  [/--polaris-text-secondary\b/g,         '--polaris-label-neutral'],
  [/--polaris-text-muted\b/g,             '--polaris-label-alternative'],
  [/--polaris-text-on-brand\b/g,          '--polaris-label-inverse'],
  [/--polaris-text-on-status\b/g,         '--polaris-label-inverse'],
  [/--polaris-surface-canvas\b/g,         '--polaris-background-base'],
  [/--polaris-surface-raised\b/g,         '--polaris-layer-surface'],
  [/--polaris-surface-sunken\b/g,         '--polaris-fill-neutral'],
  [/--polaris-surface-border-strong\b/g,  '--polaris-line-normal'],
  [/--polaris-surface-border\b/g,         '--polaris-line-neutral'],
  [/--polaris-brand-primary-hover\b/g,    '--polaris-accent-brand-strong'],
  [/--polaris-brand-primary-subtle\b/g,   '--polaris-accent-brand-bg'],
  [/--polaris-brand-primary\b/g,          '--polaris-accent-brand-normal'],
  [/--polaris-brand-secondary-hover\b/g,  '--polaris-ai-strong'],
  [/--polaris-brand-secondary-subtle\b/g, '--polaris-ai-hover'],
  [/--polaris-brand-secondary\b/g,        '--polaris-ai-normal'],
  // ───── rc.0 → rc.1 ─────
  [/--polaris-primary-normal\b/g,         '--polaris-accent-brand-normal'],
  [/--polaris-primary-strong\b/g,         '--polaris-accent-brand-strong'],
];

// ───── Walker ────────────────────────────────────────────────────────

function* walk(start) {
  const stack = [resolve(start)];
  while (stack.length) {
    const path = stack.pop();
    let stat;
    try { stat = statSync(path); } catch { continue; }
    if (stat.isDirectory()) {
      const base = path.split('/').pop();
      if (IGNORED_DIRS.has(base)) continue;
      for (const child of readdirSync(path)) stack.push(join(path, child));
    } else if (stat.isFile()) {
      const ext = extname(path);
      if (SOURCE_EXTS.has(ext)) yield path;
    }
  }
}

function transform(content, filePath) {
  const ext = extname(filePath);
  let out = content;
  let changes = 0;
  const apply = (table) => {
    for (const [re, repl] of table) {
      const before = out;
      out = out.replace(re, repl);
      if (out !== before) changes += (before.match(re) ?? []).length;
    }
  };
  // CSS / SCSS: only the var renames + the Tailwind set if the file is
  // imported as a class string (rare). Apply both to be safe; the
  // Tailwind regexes are non-overlapping with raw CSS hex values.
  if (ext === '.css' || ext === '.scss') {
    apply(CSS_VAR_RENAMES);
    apply(TAILWIND_RENAMES);
  } else if (ext === '.mdx') {
    // MDX may contain JSX class names AND plain prose. Apply
    // Tailwind renames; skip TS token renames to avoid rewriting
    // similarly-spelled words inside prose.
    apply(TAILWIND_RENAMES);
  } else {
    // .ts / .tsx / .js / .jsx / .mjs / .cjs — both tables.
    apply(TS_TOKEN_RENAMES);
    apply(TAILWIND_RENAMES);
  }
  return { out, changes };
}

// ───── Main ──────────────────────────────────────────────────────────

let totalChanges = 0;
let totalFiles = 0;
const changedFiles = [];

for (const target of targets) {
  for (const file of walk(target)) {
    let content;
    try { content = readFileSync(file, 'utf8'); } catch { continue; }
    const { out, changes } = transform(content, file);
    if (changes === 0) continue;
    totalChanges += changes;
    totalFiles += 1;
    changedFiles.push({ file, changes });
    if (APPLY) writeFileSync(file, out);
    if (VERBOSE) {
      console.log(`  ${relative(process.cwd(), file)} — ${changes} ${changes === 1 ? 'rename' : 'renames'}`);
    }
  }
}

const verb = APPLY ? 'rewrote' : (CHECK ? 'would rewrite' : 'would rewrite');
console.log(`\npolaris-codemod-v07: ${verb} ${totalChanges} occurrences in ${totalFiles} files.`);

if (!APPLY && !CHECK && totalFiles > 0) {
  console.log('\nDry run. Re-run with --apply to write changes.');
  console.log('Top files:');
  changedFiles
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 10)
    .forEach(({ file, changes }) => {
      console.log(`  ${changes.toString().padStart(4)} · ${relative(process.cwd(), file)}`);
    });
}

if (CHECK && totalChanges > 0) {
  console.error('\n--check: codemod is needed. Re-run with --apply.');
  process.exit(1);
}
