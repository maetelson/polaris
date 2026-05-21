#!/usr/bin/env node
/**
 * polaris-codemod-v08 — rewrites v0.7 deprecated alias tokens / Tailwind
 * classes / CSS variables to their v0.8 spec names.
 *
 * Usage:
 *   pnpm dlx @polaris/lint polaris-codemod-v08 [paths...]              # dry run
 *   pnpm dlx @polaris/lint polaris-codemod-v08 --apply [paths...]      # write
 *   pnpm dlx @polaris/lint polaris-codemod-v08 --check [paths...]      # CI mode
 *
 * Defaults to scanning the current directory. Skips node_modules, dist,
 * .turbo, .next and other build / vendor directories.
 *
 * What v0.8 removes (all targets covered here):
 *   - `text.*` namespace            → `label.*`
 *   - `surface.canvas/raised/sunken/border/borderStrong` → `background.base`
 *     / `layer.surface` / `fill.neutral` / `line.neutral` / `line.normal`.
 *     `surface.popover` / `surface.modal` (v0.7.5 elevation tier) STAY.
 *   - `brand.*` namespace           → `accentBrand.*` / `ai.*`
 *   - `primary.*` namespace         → `accentBrand.*`
 *   - `status.*` namespace          → `state.*` (`danger` → `error`)
 *   - `background.normal/alternative` → `background.base` / `fill.neutral`
 *   - typography legacy keys (`displayLg/Md`, `headingLg/Md/Sm`, `body`,
 *     `meta`, `tiny`, `bodyLg`, h1-h5) → spec keys.
 *   - `radius.full` / Tailwind `rounded-polaris-full` → `pill`.
 *   - bare ramp step `5` → `05` on every brand + supplementary palette.
 *
 * Component / prop renames (BREAKING in v0.8):
 *   - `<Button variant="outline">` → `<Button variant="tertiary">`
 *   - `hint` prop → `helperText` (Input / Textarea / Switch / Checkbox /
 *     FileInput / FileDropZone / DateTimeInput / TimeInput)
 *   - `<Progress tone=>` → `<Progress variant=>`
 *   - `<Stat deltaTone=>` → `<Stat deltaVariant=>`
 *   - `<HStack>` → `<Stack direction="row">`
 *   - `<VStack>` → `<Stack>` (column is the default)
 *
 * Idempotent: running twice on already-migrated v0.8 code is a no-op.
 *
 * The script is regex-based (no AST). It targets the high-volume
 * patterns documented in `docs/for-consumers/migration/v0.7-to-v0.8.md`. Dynamic
 * class strings (`text-${tone}-primary`), prop-passed token names,
 * and JSX tags spread across many lines may need manual review.
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
  console.log(`polaris-codemod-v08 — v0.7 → v0.8 token rewriter

Usage:
  polaris-codemod-v08 [paths...]            Dry-run (default). Reports planned changes.
  polaris-codemod-v08 --apply [paths...]    Apply changes in place.
  polaris-codemod-v08 --check [paths...]    Exit non-zero if any change is needed (CI).
  polaris-codemod-v08 --verbose             Print every per-file change.

Paths default to '.' (current directory).
`);
  process.exit(0);
}

if (targets.length === 0) targets.push('.');

// ───── Rewrite tables ────────────────────────────────────────────────

/** TS / TSX / JS — token member access. Word-boundary aware so we don't
 *  rewrite e.g. `someText.primary` (only bare `text.primary`). Order
 *  matters — longer specific keys first, then short ones, so `brand.
 *  primaryHover` matches before `brand.primary`. */
const TS_TOKEN_RENAMES = [
  // ───── text.* → label.* ─────
  [/\btext\.primary\b/g,        'label.normal'],
  [/\btext\.secondary\b/g,      'label.neutral'],
  [/\btext\.muted\b/g,          'label.alternative'],
  [/\btext\.onBrand\b/g,        'label.inverse'],
  [/\btext\.onStatus\b/g,       'label.inverse'],

  // ───── surface.* → split (deprecated keys only — popover/modal stay) ─────
  [/\bsurface\.canvas\b/g,       'background.base'],
  [/\bsurface\.raised\b/g,       'layer.surface'],
  [/\bsurface\.sunken\b/g,       'fill.neutral'],
  [/\bsurface\.borderStrong\b/g, 'line.normal'],
  [/\bsurface\.border\b/g,       'line.neutral'],
  // surface.popover / surface.modal — intentionally NOT rewritten.

  // ───── brand.* → accentBrand.* / ai.* ─────
  [/\bbrand\.primaryHover\b/g,    'accentBrand.strong'],
  [/\bbrand\.primarySubtle\b/g,   'accentBrand.bg'],
  [/\bbrand\.primary\b/g,         'accentBrand.normal'],
  [/\bbrand\.secondaryHover\b/g,  'ai.strong'],
  [/\bbrand\.secondarySubtle\b/g, 'ai.hover'],
  [/\bbrand\.secondary\b/g,       'ai.normal'],

  // ───── primary.* (rc.0 alias) → accentBrand.* ─────
  [/\bprimary\.normal\b/g, 'accentBrand.normal'],
  [/\bprimary\.strong\b/g, 'accentBrand.strong'],

  // ───── background.normal/alternative (v0.8 split) ─────
  // background.base / background.disabled stay; only the two removed
  // alias keys flip to their split destinations.
  [/\bbackground\.normal\b/g,      'background.base'],
  [/\bbackground\.alternative\b/g, 'fill.neutral'],

  // ───── radius.full → radius.pill ─────
  [/\bradius\.full\b/g, 'radius.pill'],

  // ───── status.* → state.* (danger → error, *Hover folded into base) ─────
  [/\bstatus\.successHover\b/g, 'state.success'],
  [/\bstatus\.warningHover\b/g, 'state.warning'],
  [/\bstatus\.dangerHover\b/g,  'state.error'],
  [/\bstatus\.infoHover\b/g,    'state.info'],
  [/\bstatus\.danger\b/g,       'state.error'],
  [/\bstatus\.success\b/g,      'state.success'],
  [/\bstatus\.warning\b/g,      'state.warning'],
  [/\bstatus\.info\b/g,         'state.info'],

  // ───── typography legacy keys → spec keys ─────
  // (e.g. inside `textStyle.<key>` member-access or destructured imports)
  // displayLg/Md and headingLg/Md/Sm have no other meaning, safe to global-
  // replace. `body` / `meta` / `tiny` are unsafe as bare words (overlap with
  // HTML tags / variable names), so we only touch them inside `textStyle.`.
  [/\bdisplayLg\b/g, 'display'],
  [/\bdisplayMd\b/g, 'title'],
  [/\bheadingLg\b/g, 'heading2'],
  [/\bheadingMd\b/g, 'heading3'],
  [/\bheadingSm\b/g, 'heading4'],
  [/\btextStyle\.body\b(?!\d|Sm|Lg)/g, 'textStyle.body1'],
  [/\btextStyle\.bodySm\b/g,           'textStyle.body2'],
  [/\btextStyle\.bodyLg\b/g,           'textStyle.body1'],
  [/\btextStyle\.meta\b/g,             'textStyle.caption1'],
  [/\btextStyle\.tiny\b/g,             'textStyle.caption2'],
  [/\btextStyle\.h1\b/g,               'textStyle.display'],
  [/\btextStyle\.h2\b/g,               'textStyle.title'],
  [/\btextStyle\.h3\b/g,               'textStyle.heading1'],
  [/\btextStyle\.h4\b/g,               'textStyle.heading2'],
  [/\btextStyle\.h5\b/g,               'textStyle.heading3'],
  [/\btextStyle\.detail\b/g,           'textStyle.body2'],
  [/\btextStyle\.caption\b(?!\d)/g,    'textStyle.caption1'],

  // ───── named-imports cleanup — { brand } / { status } / { text } / { primary } ─────
  // Runs last so the member-access rewrites above have already landed.
  // Targets both `@polaris/ui` (root barrel) and `@polaris/ui/tokens`
  // (the recommended path for token namespaces). Walks the named-import
  // list so mixed imports (`import { text, label } from '@polaris/ui'`)
  // are partially rewritten without false-positives on `text` / `brand` /
  // `status` / `primary` identifiers used elsewhere in the file.
  //
  // NOTE on `brand` — rc.0 `brand.primary` (→ `accentBrand.normal`) and
  // `brand.secondary` (→ `ai.normal`) split into TWO namespaces. The
  // import rename only adds `accentBrand`; if the consumer used
  // `brand.secondary`, member-access rewrites will reference `ai.*`,
  // and TypeScript will flag the missing `ai` import on the next build.
  // Reviewers add `, ai` by hand. This is documented in the migration
  // guide caveat list.
  [/(import\s*(?:type\s+)?\{)([^}]+)(\}\s*from\s*['"]@polaris\/ui(?:\/tokens)?['"])/g,
    rewritePolarisTokenImport],
];

/** Renames inside a `@polaris/ui` / `@polaris/ui/tokens` named-import list.
 *  Replaces deprecated namespace bindings (`text` / `brand` / `status` /
 *  `primary`) with their v0.8 names. Per-identifier so mixed imports
 *  rewrite cleanly. */
const TOKEN_IMPORT_IDENT_RENAMES = {
  text:    'label',
  brand:   'accentBrand',
  status:  'state',
  primary: 'accentBrand',
};

function rewritePolarisTokenImport(_match, p1Open, body, p3Close) {
  const renamedBody = body
    .split(',')
    .map((part) => {
      // Match the leading identifier (preserves leading whitespace +
      // any trailing `as Alias` / type-only modifiers).
      const ident = part.match(/^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\b/);
      if (!ident) return part;
      const next = TOKEN_IMPORT_IDENT_RENAMES[ident[2]];
      if (!next) return part;
      return ident[1] + next + part.slice(ident[0].length);
    })
    .join(',');
  return `${p1Open}${renamedBody}${p3Close}`;
}

/** Tailwind class renames. Match on full class names with hyphenated
 *  prefixes so we don't accidentally rewrite substrings inside larger
 *  identifiers. Idempotent on already-migrated classes. */
const TAILWIND_RENAMES = [
  // ───── foreground (text) tokens ─────
  [/\btext-fg-primary\b/g,    'text-label-normal'],
  [/\btext-fg-secondary\b/g,  'text-label-neutral'],
  [/\btext-fg-muted\b/g,      'text-label-alternative'],
  [/\btext-fg-on-brand\b/g,   'text-label-inverse'],
  [/\btext-fg-on-status\b/g,  'text-label-inverse'],

  // ───── surface utilities → background / layer / fill / line ─────
  [/\bbg-surface-canvas\b/g,            'bg-background-base'],
  [/\bbg-surface-raised\b/g,            'bg-layer-surface'],
  [/\bbg-surface-sunken\b/g,            'bg-fill-neutral'],
  // `surface-border-strong` / `surface-border` show up across more
  // utility prefixes than border-* (v0.7 components used `bg-` for thin
  // separators, `divide-` for table dividers, `ring-` for focus halos).
  // Catch them all in one sweep — the line-* family takes the same set
  // of utility prefixes downstream so a single rewrite is safe.
  [/\b(bg|border|divide|ring|outline|fill|stroke|caret|accent|placeholder|from|via|to)-surface-border-strong\b/g,
    '$1-line-normal'],
  [/\b(bg|border|divide|ring|outline|fill|stroke|caret|accent|placeholder|from|via|to)-surface-border\b/g,
    '$1-line-neutral'],
  // surface-popover / surface-modal stay (v0.7.5 elevation tier).

  // ───── brand-* family (incl. all utility prefixes) → accent-brand-* / ai-* ─────
  [/\bbg-brand-primary-hover\b/g,        'bg-accent-brand-strong'],
  [/\btext-brand-primary-hover\b/g,      'text-accent-brand-strong'],
  [/\bborder-brand-primary-hover\b/g,    'border-accent-brand-strong'],
  [/\bring-brand-primary-hover\b/g,      'ring-accent-brand-strong'],
  [/\boutline-brand-primary-hover\b/g,   'outline-accent-brand-strong'],
  [/\bfill-brand-primary-hover\b/g,      'fill-accent-brand-strong'],
  [/\bstroke-brand-primary-hover\b/g,    'stroke-accent-brand-strong'],
  [/\bbg-brand-primary-subtle\b/g,       'bg-accent-brand-bg'],
  [/\btext-brand-primary-subtle\b/g,     'text-accent-brand-bg'],
  [/\bborder-brand-primary-subtle\b/g,   'border-accent-brand-bg'],
  [/\bbg-brand-primary\b/g,              'bg-accent-brand-normal'],
  [/\btext-brand-primary\b/g,            'text-accent-brand-normal'],
  [/\bborder-brand-primary\b/g,          'border-accent-brand-normal'],
  [/\bring-brand-primary\b/g,            'ring-accent-brand-normal'],
  [/\boutline-brand-primary\b/g,         'outline-accent-brand-normal'],
  [/\bfill-brand-primary\b/g,            'fill-accent-brand-normal'],
  [/\bstroke-brand-primary\b/g,          'stroke-accent-brand-normal'],
  [/\bbg-brand-secondary-hover\b/g,      'bg-ai-strong'],
  [/\btext-brand-secondary-hover\b/g,    'text-ai-strong'],
  [/\bborder-brand-secondary-hover\b/g,  'border-ai-strong'],
  [/\bbg-brand-secondary-subtle\b/g,     'bg-ai-hover'],
  [/\btext-brand-secondary-subtle\b/g,   'text-ai-hover'],
  [/\bborder-brand-secondary-subtle\b/g, 'border-ai-hover'],
  [/\bbg-brand-secondary\b/g,            'bg-ai-normal'],
  [/\btext-brand-secondary\b/g,          'text-ai-normal'],
  [/\bborder-brand-secondary\b/g,        'border-ai-normal'],
  [/\bring-brand-secondary\b/g,          'ring-ai-normal'],
  [/\boutline-brand-secondary\b/g,       'outline-ai-normal'],

  // ───── status-* → state-* (danger → error, hover variants folded in) ─────
  [/\bbg-status-success-hover\b/g,   'bg-state-success'],
  [/\bbg-status-warning-hover\b/g,   'bg-state-warning'],
  [/\bbg-status-danger-hover\b/g,    'bg-state-error'],
  [/\bbg-status-info-hover\b/g,      'bg-state-info'],
  [/\btext-status-success-hover\b/g, 'text-state-success'],
  [/\btext-status-warning-hover\b/g, 'text-state-warning'],
  [/\btext-status-danger-hover\b/g,  'text-state-error'],
  [/\btext-status-info-hover\b/g,    'text-state-info'],
  [/\bborder-status-success-hover\b/g, 'border-state-success'],
  [/\bborder-status-warning-hover\b/g, 'border-state-warning'],
  [/\bborder-status-danger-hover\b/g,  'border-state-error'],
  [/\bborder-status-info-hover\b/g,    'border-state-info'],
  [/\bbg-status-success\b/g,    'bg-state-success'],
  [/\bbg-status-warning\b/g,    'bg-state-warning'],
  [/\bbg-status-danger\b/g,     'bg-state-error'],
  [/\bbg-status-info\b/g,       'bg-state-info'],
  [/\btext-status-success\b/g,  'text-state-success'],
  [/\btext-status-warning\b/g,  'text-state-warning'],
  [/\btext-status-danger\b/g,   'text-state-error'],
  [/\btext-status-info\b/g,     'text-state-info'],
  [/\bborder-status-success\b/g, 'border-state-success'],
  [/\bborder-status-warning\b/g, 'border-state-warning'],
  [/\bborder-status-danger\b/g,  'border-state-error'],
  [/\bborder-status-info\b/g,    'border-state-info'],

  // ───── background-{normal,alternative} → split ─────
  // `background-normal` was the de-facto raised/card surface in rc.0 +
  // some v0.7 code. v0.8 spec uses `background-base` for the page root,
  // and components that lifted off the page use `layer-surface`. The
  // most-common usage in our workspace is "card-like elevation on white",
  // so `background-base` is the safer default; reviewers should spot-
  // check elevated cards and switch them to `bg-layer-surface` manually.
  [/\bbg-background-normal\b/g,      'bg-background-base'],
  [/\bbg-background-alternative\b/g, 'bg-fill-neutral'],

  // ───── primary-* (rc.0 alias) → accent-brand-* ─────
  [/\bbg-primary-normal\b/g,     'bg-accent-brand-normal'],
  [/\bbg-primary-strong\b/g,     'bg-accent-brand-strong'],
  [/\btext-primary-normal\b/g,   'text-accent-brand-normal'],
  [/\btext-primary-strong\b/g,   'text-accent-brand-strong'],
  [/\bborder-primary-normal\b/g, 'border-accent-brand-normal'],
  [/\bborder-primary-strong\b/g, 'border-accent-brand-strong'],

  // ───── typography utilities → spec names ─────
  [/\btext-polaris-display-lg\b/g, 'text-polaris-display'],
  [/\btext-polaris-display-md\b/g, 'text-polaris-title'],
  [/\btext-polaris-heading-lg\b/g, 'text-polaris-heading2'],
  [/\btext-polaris-heading-md\b/g, 'text-polaris-heading3'],
  [/\btext-polaris-heading-sm\b/g, 'text-polaris-heading4'],
  [/\btext-polaris-h1\b/g,         'text-polaris-display'],
  [/\btext-polaris-h2\b/g,         'text-polaris-title'],
  [/\btext-polaris-h3\b/g,         'text-polaris-heading1'],
  [/\btext-polaris-h4\b/g,         'text-polaris-heading2'],
  [/\btext-polaris-h5\b/g,         'text-polaris-heading4'], // h5 absorbed into h4 (no spec equivalent for 20px elsewhere; closest by role)
  [/\btext-polaris-body-lg\b/g,    'text-polaris-body1'],
  [/\btext-polaris-body-sm\b/g,    'text-polaris-body2'],
  [/\btext-polaris-body\b(?!-|\d)/g, 'text-polaris-body1'],
  [/\btext-polaris-meta\b/g,       'text-polaris-caption1'],
  [/\btext-polaris-tiny\b/g,       'text-polaris-caption2'],
  [/\btext-polaris-caption\b(?!\d)/g, 'text-polaris-caption1'],

  // ───── radius ─────
  [/\brounded-polaris-full\b/g, 'rounded-polaris-pill'],

  // ───── primitive ramp step `5` → `05` ─────
  // (bg|text|...)-(blue|green|orange|red|purple|sky-blue|blue-supplementary|
  // violet|cyan|yellow|dark-blue)-5 → -05. Negative lookahead avoids
  // matching `-50`, `-500`, etc. Gray ramp is 10–90 only (no 5 or 05),
  // so it's excluded.
  [/\b(bg|text|border|fill|stroke|outline|ring|shadow|from|via|to|caret|accent|placeholder|divide)-(blue|dark-blue|green|orange|red|purple|sky-blue|blue-supplementary|violet|cyan|yellow)-5\b(?!\d)/g,
    '$1-$2-05'],
];

/** CSS custom property renames. Apply to *.css / *.scss only. */
const CSS_VAR_RENAMES = [
  // text-* → label-*
  [/--polaris-text-primary\b/g,           '--polaris-label-normal'],
  [/--polaris-text-secondary\b/g,         '--polaris-label-neutral'],
  [/--polaris-text-muted\b/g,             '--polaris-label-alternative'],
  [/--polaris-text-on-brand\b/g,          '--polaris-label-inverse'],
  [/--polaris-text-on-status\b/g,         '--polaris-label-inverse'],
  // surface-* → background / layer / fill / line
  [/--polaris-surface-canvas\b/g,         '--polaris-background-base'],
  [/--polaris-surface-raised\b/g,         '--polaris-layer-surface'],
  [/--polaris-surface-sunken\b/g,         '--polaris-fill-neutral'],
  [/--polaris-surface-border-strong\b/g,  '--polaris-line-normal'],
  [/--polaris-surface-border\b/g,         '--polaris-line-neutral'],
  // surface-popover / surface-modal stay.
  // brand-* → accent-brand-* / ai-*
  [/--polaris-brand-primary-hover\b/g,    '--polaris-accent-brand-strong'],
  [/--polaris-brand-primary-subtle\b/g,   '--polaris-accent-brand-bg'],
  [/--polaris-brand-primary\b/g,          '--polaris-accent-brand-normal'],
  [/--polaris-brand-secondary-hover\b/g,  '--polaris-ai-strong'],
  [/--polaris-brand-secondary-subtle\b/g, '--polaris-ai-hover'],
  [/--polaris-brand-secondary\b/g,        '--polaris-ai-normal'],
  // primary-* (rc.0) → accent-brand-*
  [/--polaris-primary-normal\b/g,         '--polaris-accent-brand-normal'],
  [/--polaris-primary-strong\b/g,         '--polaris-accent-brand-strong'],
  // status-* → state-* (danger → error, hover folded in)
  [/--polaris-status-success-hover\b/g,   '--polaris-state-success'],
  [/--polaris-status-warning-hover\b/g,   '--polaris-state-warning'],
  [/--polaris-status-danger-hover\b/g,    '--polaris-state-error'],
  [/--polaris-status-info-hover\b/g,      '--polaris-state-info'],
  [/--polaris-status-success\b/g,         '--polaris-state-success'],
  [/--polaris-status-warning\b/g,         '--polaris-state-warning'],
  [/--polaris-status-danger\b/g,          '--polaris-state-error'],
  [/--polaris-status-info\b/g,            '--polaris-state-info'],
  // background-normal/alternative → background-base / fill-neutral
  [/--polaris-background-normal\b/g,      '--polaris-background-base'],
  [/--polaris-background-alternative\b/g, '--polaris-fill-neutral'],
  // radius-full → radius-pill
  [/--polaris-radius-full\b/g,            '--polaris-radius-pill'],
  // ramp `5` → `05`
  [/--polaris-(blue|dark-blue|green|orange|red|purple|sky-blue|blue-supplementary|violet|cyan|yellow)-5\b(?!\d)/g,
    '--polaris-$1-05'],
];

/** JSX prop / component renames. Applied to .tsx / .jsx / .mdx only —
 *  these patterns target opening-tag attributes and component identifiers,
 *  which only appear in JSX-bearing files.
 *
 *  Caveats (regex limitations, not AST):
 *   - Opening-tag patterns (`<Component … prop=`) match within a single
 *     `>`-free run. JSX tags split across many lines with `>` characters
 *     in attribute values may slip through — reviewers should grep for
 *     residual `hint=`, `tone=`, `deltaTone=`, `variant="outline"` after
 *     a run.
 *   - Import lines: we rewrite bare `HStack` / `VStack` identifiers to
 *     `Stack` after JSX tag rewrites. If a file already imports `Stack`
 *     alongside `HStack`/`VStack`, the result has a duplicate import name
 *     that TypeScript will flag — fix by hand. */
const JSX_RENAMES = [
  // Button: variant="outline" → variant="tertiary"
  [/(<Button\b[^>]*?\bvariant=)["']outline["']/g, '$1"tertiary"'],

  // hint → helperText (form components — keep this list in sync with
  // packages/ui/src/components/* SharedProps definitions).
  [/(<(?:Input|Textarea|Switch|Checkbox|FileInput|FileDropZone|DateTimeInput|TimeInput)\b[^>]*?)\bhint=/g,
    '$1helperText='],

  // Progress: tone → variant
  [/(<Progress\b[^>]*?)\btone=/g, '$1variant='],

  // Stat: deltaTone → deltaVariant
  [/(<Stat\b[^>]*?)\bdeltaTone=/g, '$1deltaVariant='],

  // HStack → <Stack direction="row">. Match opening tag only — we add
  // `direction="row"` so the row layout is preserved. Closing tag is
  // handled by a separate pattern below.
  [/<HStack(\s+[^>]*?)?(\s*\/?>)/g, (_m, attrs, close) => {
    // Insert `direction="row"` as the first attribute so JSX prop
    // ordering reads: <Stack direction="row" gap="…" align="…" />.
    const trailing = attrs ? attrs : '';
    return `<Stack direction="row"${trailing}${close}`;
  }],
  [/<\/HStack>/g, '</Stack>'],

  // VStack → <Stack> (column is the default direction in v0.8).
  [/<VStack(\s+[^>]*?)?(\s*\/?>)/g, (_m, attrs, close) => {
    const trailing = attrs ? attrs : '';
    return `<Stack${trailing}${close}`;
  }],
  [/<\/VStack>/g, '</Stack>'],

  // Import-line cleanup: rename `HStack` / `VStack` named-import bindings
  // to `Stack`. Only touches identifiers within `import { … } from
  // '@polaris/ui'` lines so we don't accidentally rename a local variable.
  [/(import\s*\{[^}]*?\b)HStack(\b[^}]*?\}\s*from\s*['"]@polaris\/ui['"])/g, '$1Stack$2'],
  [/(import\s*\{[^}]*?\b)VStack(\b[^}]*?\}\s*from\s*['"]@polaris\/ui['"])/g, '$1Stack$2'],
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

/** Source-pattern → destination-namespace map for conflict detection.
 *  Each entry mirrors a TS_TOKEN_RENAMES rewrite that would introduce
 *  a NEW destination namespace at the call site. We use these to detect
 *  *before* applying any rewrite whether the destination would shadow
 *  a local binding the user already defined — running the rewrite in
 *  that situation can produce silent semantic bugs (e.g. `surface.border`
 *  → `line.neutral` would silently bind to a local `const line = …`,
 *  build passes, runtime value is wrong).
 *
 *  Codex caught this in a real consumer migration. Fail-loud beats
 *  silent rewrite. */
const REWRITE_DESTINATIONS = [
  // [source-pattern matched in file body, destination namespace introduced]
  [/\btext\.[a-zA-Z_$]/,                                'label'],
  [/\bsurface\.canvas\b/,                               'background'],
  [/\bsurface\.raised\b/,                               'layer'],
  [/\bsurface\.sunken\b/,                               'fill'],
  [/\bsurface\.border(?:Strong)?\b/,                    'line'],
  [/\bbrand\.primary(?:Hover|Subtle)?\b/,               'accentBrand'],
  [/\bbrand\.secondary(?:Hover|Subtle)?\b/,             'ai'],
  [/\bprimary\.(?:normal|strong)\b/,                    'accentBrand'],
  [/\bstatus\.[a-zA-Z_$]/,                              'state'],
  [/\bbackground\.normal\b/,                            'background'],
  [/\bbackground\.alternative\b/,                       'fill'],
  [/\bradius\.full\b/,                                  'radius'],
];

/** Detect rewrites that would silently shadow an existing local binding
 *  or aliased polaris import. Returns a list of conflict descriptors
 *  — caller should leave the file untouched and surface these to the
 *  user for manual resolution. */
function detectNamespaceConflicts(content) {
  const conflicts = [];
  const seen = new Set();

  for (const [src, dest] of REWRITE_DESTINATIONS) {
    if (!src.test(content)) continue;

    // Already reported this destination via another source pattern —
    // user only needs to know about the conflict once.
    if (seen.has(dest)) continue;

    // (a) local declaration: `const | let | var | function | class <dest>`
    const localRe = new RegExp(
      `\\b(?:const|let|var|function|class)\\s+${dest}\\b`,
    );
    if (localRe.test(content)) {
      conflicts.push({ kind: 'local-binding', destination: dest });
      seen.add(dest);
      continue;
    }

    // (b) aliased polaris import that uses `<dest>` as the source
    //     specifier, leaving the bare `<dest>` binding unavailable:
    //     `import { ai as aiToken } from '@polaris/ui/tokens'`
    const aliasRe = new RegExp(
      `import\\s*(?:type\\s+)?\\{[^}]*\\b${dest}\\s+as\\s+\\w+[^}]*\\}\\s*from\\s*['"]@polaris\\/ui(?:\\/\\w+)?['"]`,
    );
    if (aliasRe.test(content)) {
      conflicts.push({ kind: 'aliased-polaris-import', destination: dest });
      seen.add(dest);
    }
  }

  // (c) Aliased `<HStack>` / `<VStack>` imports — JSX tag rewrite scans
  //     for literal `<HStack>` / `<VStack>` tags. If the consumer aliased
  //     them on import (`HStack as Row`), tags appear as `<Row>` in JSX
  //     and codemod misses them, leaving a layout-semantics gap (no
  //     `direction="row"` injected). Treat as conflict so the file
  //     stays untouched and the consumer fixes by hand.
  if (/import\s*(?:type\s+)?\{[^}]*\b(?:H|V)Stack\s+as\s+\w+[^}]*\}\s*from\s*['"]@polaris\/ui['"]/.test(content)) {
    conflicts.push({ kind: 'aliased-stack-import', destination: 'Stack' });
  }

  return conflicts;
}

function transform(content, filePath) {
  const ext = extname(filePath);
  // Conflict pre-check for JS/TS-family files before any rewrite. CSS /
  // SCSS / MDX skip — none of the rewrite collisions surface there.
  if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx' ||
      ext === '.mjs' || ext === '.cjs') {
    const conflicts = detectNamespaceConflicts(content);
    if (conflicts.length > 0) {
      // Leave file untouched; let main loop surface conflicts to user.
      return { out: content, changes: 0, conflicts };
    }
  }
  let out = content;
  let changes = 0;
  const apply = (table) => {
    for (const [re, repl] of table) {
      const before = out;
      out = out.replace(re, repl);
      if (out !== before) changes += (before.match(re) ?? []).length;
    }
  };
  if (ext === '.css' || ext === '.scss') {
    apply(CSS_VAR_RENAMES);
    apply(TAILWIND_RENAMES);
  } else if (ext === '.mdx') {
    // MDX: skip TS member-access rewrites (would mangle prose like
    // "the text primary"); apply Tailwind class names + CSS var refs.
    apply(TAILWIND_RENAMES);
    apply(CSS_VAR_RENAMES);
    apply(JSX_RENAMES);
  } else if (ext === '.tsx' || ext === '.jsx') {
    // .tsx / .jsx — full rewrite set incl. JSX tag/prop renames.
    const before = out;
    apply(TS_TOKEN_RENAMES);
    apply(TAILWIND_RENAMES);
    apply(CSS_VAR_RENAMES);
    apply(JSX_RENAMES);
    // Post-rewrite cleanup. Two passes; both are no-ops if no rewrite
    // fired upstream, so the migration-target gate at `out !== before`
    // protects non-target files.
    if (out !== before) {
      // 1. Dedupe — JSX_RENAMES turns `HStack` / `VStack` import-list
      //    identifiers into `Stack`, which collides if the file already
      //    imported `Stack`. Run dedupe regardless of normalize.
      const deduped = dedupePolarisImports(out);
      if (deduped !== out) changes += 1;
      out = deduped;
      // 2. Normalize — add missing destination namespaces (e.g. `ai`,
      //    `layer`, `line`) when member-access rewrites introduced
      //    them but the import wasn't updated.
      const after = normalizePolarisImports(out);
      if (after !== out) changes += 1;
      out = after;
    }
  } else {
    // .ts / .js / .mjs / .cjs — token / class-string only (no JSX).
    const before = out;
    apply(TS_TOKEN_RENAMES);
    apply(TAILWIND_RENAMES);
    apply(CSS_VAR_RENAMES);
    if (out !== before) {
      // No JSX_RENAMES path here, so dedupe is rarely needed — but
      // TS_TOKEN_RENAMES of `import { brand }` → `import { accentBrand,
      // ai }` could collide with an existing `accentBrand` / `ai`.
      // Run dedupe to be safe, idempotent.
      const deduped = dedupePolarisImports(out);
      if (deduped !== out) changes += 1;
      out = deduped;
      const after = normalizePolarisImports(out);
      if (after !== out) changes += 1;
      out = after;
    }
  }
  return { out, changes };
}

/** Post-pass: keep `@polaris/ui` / `@polaris/ui/tokens` named-import lines
 *  in sync with the namespaces actually used in the file body.
 *
 *  The motivating case: `brand.secondary*` member-access rewrites to
 *  `ai.*`, but the import-line rewrite only renames the binding to
 *  `accentBrand`. Result: `import { accentBrand } …; const x = ai.normal;`
 *  → consumer build breaks (`ai is not defined`). This pass scans the
 *  file body for `\b<namespace>\.` usage and appends any namespace that
 *  isn't yet imported to the FIRST `@polaris/ui[/tokens]` import line.
 *
 *  Two safety nets against false positives:
 *   1. Caller (`transform`) only invokes this pass after a previous
 *      rewrite has actually changed the content. Files that aren't
 *      migration targets never reach this function.
 *   2. We additionally skip any namespace name that has a local
 *      declaration in the file (`const | let | var | function | class
 *      <ns>`). That covers the leftover edge case where a rewrite did
 *      fire elsewhere in the file but the bare `<ns>.<member>` token
 *      we'd otherwise add as an import is a user-defined object.
 *
 *  Idempotent: a second run sees the namespace already imported and
 *  adds nothing. */
function normalizePolarisImports(content) {
  // Match `import { ... } from '@polaris/ui'` or `'@polaris/ui/tokens'`.
  // Capture groups:
  //   [1] = `type ` if `import type` (else undefined) — type-only import
  //   [2] = body inside braces
  //   [3] = `/tokens` subpath if present (else undefined)
  const POLARIS_IMPORT_RE =
    /import\s*(type\s+)?\{([^}]+)\}\s*from\s*['"]@polaris\/ui(\/tokens)?['"];?/g;

  // v0.8 token namespaces that may appear via member-access rewrites.
  // Each entry has to cover an OUTPUT of TS_TOKEN_RENAMES — if rewrite
  // produces `layer.surface` but `layer` isn't here, the consumer ends
  // up with `layer is not defined`. List every destination namespace,
  // not just the ones from `brand`.
  //
  // Surface migrations:
  //   surface.canvas       → background.base    (background)
  //   surface.raised       → layer.surface       (layer)
  //   surface.sunken       → fill.neutral        (fill)
  //   surface.border       → line.neutral        (line)
  //   surface.borderStrong → line.normal         (line)
  //   background.normal/alternative → background.base / fill.neutral
  //   radius.full          → radius.pill         (radius)
  //   text.* / brand.* / status.* / primary.* (covered above)
  const NAMESPACES_TO_CHECK = [
    // brand-family destinations
    'ai', 'accentBrand', 'state', 'label',
    // surface-family destinations (v0.8 split)
    'layer', 'line', 'fill', 'background',
    // radius (only `radius.full` → `radius.pill` rewrite produces this)
    'radius',
  ];

  const usedInBody = new Set(
    NAMESPACES_TO_CHECK.filter((ns) =>
      // Require an identifier character after the dot — excludes prose
      // like "navigation state." in JSDoc comments, where `state.` is
      // sentence punctuation rather than a member access.
      new RegExp(`\\b${ns}\\.[a-zA-Z_$]`).test(content),
    ),
  );
  if (usedInBody.size === 0) return content;
  // Note: local-binding shadow check is NOT here. The transform-level
  // `detectNamespaceConflicts` catches that upstream and skips the
  // whole file *before* any rewrite runs — silently dropping the
  // import while still applying the rewrite (the rc.5 approach) is
  // worse than not running the codemod at all, because the rewritten
  // expression now binds to the local object (silent semantic bug).

  const matches = [...content.matchAll(POLARIS_IMPORT_RE)];
  if (matches.length === 0) return content;

  // Bindings already in scope (across both type and value imports).
  // Track the LOCAL binding (the alias if present) — `ai as aiToken`
  // contributes `aiToken`, not `ai`. That distinction matters for
  // computing `missing`: if codemod's rewrite produces `ai.normal` but
  // the file only has `ai as aiToken`, the bare `ai` binding is NOT
  // available and we'd need to add it. (Conflict detector catches
  // this upstream — but keep the binding bookkeeping correct anyway.)
  const importedNames = new Set();
  for (const m of matches) {
    for (const e of parseImportBody(m[2])) {
      importedNames.add(e.binding);
    }
  }

  const missing = [...usedInBody].filter((ns) => !importedNames.has(ns));
  if (missing.length === 0) return content;

  // Find the FIRST value (non-type-only) polaris import — that's where we
  // can safely append. `import type { … }` cannot host value bindings;
  // appending a value name there would make TypeScript treat it as a
  // type-only binding (TS2693: "X only refers to a type, but is being
  // used as a value here") even with `verbatimModuleSyntax: true`.
  let valueMatchIdx = -1;
  for (let i = 0; i < matches.length; i++) {
    if (!matches[i][1]) { valueMatchIdx = i; break; }
  }

  if (valueMatchIdx >= 0) {
    // Append to the matched value import; siblings (incl. type imports)
    // unchanged.
    let count = 0;
    let added = false;
    return content.replace(POLARIS_IMPORT_RE, (match, isType, body) => {
      const idx = count++;
      if (idx !== valueMatchIdx || added) return match;
      added = true;
      return match.replace(`{${body}}`, `{${appendToImportBody(body, missing)}}`);
    });
  }

  // No value import — every existing polaris import is `import type`.
  // Synthesize a fresh value import. Pick the same subpath as the first
  // existing polaris import so we stay on `/tokens` when the file
  // already uses that subpath, and keep the bare `@polaris/ui` otherwise.
  const firstSubpath = matches[0][3] ?? '';
  const insertAt = matches[0].index ?? 0;
  const newImport = `import { ${missing.join(', ')} } from '@polaris/ui${firstSubpath}';\n`;
  return content.slice(0, insertAt) + newImport + content.slice(insertAt);
}

/** Parse the inside-`{}` of an `import { … }` line into individual entries.
 *  Each entry retains the original raw text so we can rebuild the body
 *  faithfully (including `type X` modifiers, `as Alias`, etc.).
 *
 *  Returns `{ specifier, binding, raw }` per entry:
 *   - `specifier` — the imported name as it appears in the module export
 *     (`Stack` for both `Stack` and `Stack as Row`).
 *   - `binding`   — the local binding inside this file (`Stack` for `Stack`,
 *     `Row` for `Stack as Row`). Dedupe MUST run on `binding`, not
 *     `specifier`, otherwise `Stack` and `Stack as Row` look identical
 *     and one gets dropped (rc.6 regression Codex caught).
 *
 *  Empty entries (from trailing commas) are dropped. */
function parseImportBody(body) {
  return body.split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      // `type Foo` / `Foo` / `Foo as Bar` / `type Foo as Bar`
      const m = part.match(
        /^(?:type\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\s+as\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?/,
      );
      const specifier = m ? m[1] : '';
      const binding = m ? (m[2] ?? m[1]) : '';
      return { specifier, binding, raw: part, name: specifier };
    });
}

/** Rebuild the inside-`{}` of an import body, preserving multi-line
 *  formatting if the source was multi-line. Same rule as Prettier:
 *  a body with internal newlines becomes one-per-line with trailing
 *  comma; a body that fit on one line stays compact `{ a, b, c }`. */
function rebuildImportBody(entries, multiline) {
  if (entries.length === 0) return ' ';
  if (multiline) {
    return '\n  ' + entries.map((e) => e.raw).join(',\n  ') + ',\n';
  }
  return ' ' + entries.map((e) => e.raw).join(', ') + ' ';
}

/** Append new identifiers to an existing import body, preserving
 *  multi-line formatting and avoiding duplicate names. Used by
 *  `normalizePolarisImports` to fix the rc.5 multi-line corruption
 *  Codex caught (`Stack, state }` jammed onto a previously
 *  multi-line `{\n  …,\n  Stack,\n}` body). */
function appendToImportBody(body, namesToAdd) {
  const multiline = body.includes('\n');
  const entries = parseImportBody(body);
  // Track bindings (the names actually visible in the local scope),
  // not specifiers — otherwise `ai as aiToken` would block adding a
  // bare `ai` import even though the local `ai` binding is missing.
  const existing = new Set(entries.map((e) => e.binding));
  for (const n of namesToAdd) {
    if (!existing.has(n)) {
      existing.add(n);
      entries.push({ specifier: n, binding: n, raw: n, name: n });
    }
  }
  return rebuildImportBody(entries, multiline);
}

/** Dedupe duplicate identifiers within every `@polaris/ui` /
 *  `@polaris/ui/tokens` import line. Idempotent. Multi-line bodies
 *  stay multi-line.
 *
 *  This is the missing piece Codex caught: the `<HStack>` / `<VStack>`
 *  → `<Stack>` rewrite emits an identifier-level rename inside import
 *  lines (`HStack` → `Stack`) without checking whether `Stack` is
 *  already imported. Result on a file that already imports `Stack`:
 *
 *    import { Stack, HStack, VStack } …   ←  before
 *    import { Stack, Stack, Stack } …     ←  after JSX_RENAMES
 *
 *  TS error: "Identifier 'Stack' has already been declared". This
 *  function is called once per polaris import line as a separate pass
 *  after JSX_RENAMES so the dedupe runs over the post-rewrite text. */
function dedupePolarisImports(content) {
  const POLARIS_IMPORT_RE =
    /import\s*(type\s+)?\{([^}]+)\}\s*from\s*['"]@polaris\/ui(\/tokens)?['"];?/g;
  return content.replace(POLARIS_IMPORT_RE, (match, _isType, body) => {
    const multiline = body.includes('\n');
    const entries = parseImportBody(body);
    const seen = new Set();
    const deduped = [];
    for (const e of entries) {
      // Dedupe by LOCAL BINDING, not the imported specifier. Otherwise
      // `Stack` and `Stack as Row` collide and `Stack as Row` gets
      // dropped — losing the `Row` identifier the consumer is using.
      if (seen.has(e.binding)) continue;
      seen.add(e.binding);
      deduped.push(e);
    }
    if (deduped.length === entries.length) return match; // no-op
    return match.replace(`{${body}}`, `{${rebuildImportBody(deduped, multiline)}}`);
  });
}

// ───── Main ──────────────────────────────────────────────────────────

let totalChanges = 0;
let totalFiles = 0;
const changedFiles = [];
const conflictFiles = [];

for (const target of targets) {
  for (const file of walk(target)) {
    let content;
    try { content = readFileSync(file, 'utf8'); } catch { continue; }
    const { out, changes, conflicts } = transform(content, file);
    if (conflicts && conflicts.length > 0) {
      conflictFiles.push({ file, conflicts });
      continue;
    }
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
console.log(`\npolaris-codemod-v08: ${verb} ${totalChanges} occurrences in ${totalFiles} files.`);

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

// Conflict reporting — fail-loud on namespace collisions. Silent rewrite
// in this case would create either a build break or a runtime semantic
// bug (e.g. `surface.border` rewritten to `line.neutral` would bind to
// a local `const line = …`, build passes, value is wrong). Better to
// stop, list each conflict, and let the consumer resolve manually.
if (conflictFiles.length > 0) {
  console.error(`\n⚠️  ${conflictFiles.length} file${conflictFiles.length === 1 ? '' : 's'} skipped due to namespace conflicts. Resolve manually before re-running:\n`);
  for (const { file, conflicts } of conflictFiles) {
    console.error(`  ${relative(process.cwd(), file)}`);
    for (const c of conflicts) {
      const explanation = {
        'local-binding':         `would rewrite to '${c.destination}.*' but file declares a local '${c.destination}' (const/let/var/function/class). Codemod aborts to avoid binding rewritten code to your local — rename the local first.`,
        'aliased-polaris-import': `would rewrite to '${c.destination}.*' but file imports '${c.destination} as <alias>' from @polaris/ui. The bare '${c.destination}' binding isn't in scope — change the import to add bare '${c.destination}' or remove the alias.`,
        'aliased-stack-import':  `imports HStack/VStack with an alias (e.g. \`HStack as Row\`). Codemod can't rewrite \`<Row>\` JSX tags to inject \`direction="row"\` — replace the alias with bare HStack/VStack first, or convert tags by hand.`,
      }[c.kind] ?? `unknown conflict on '${c.destination}'`;
      console.error(`    - ${explanation}`);
    }
  }
  console.error('\nFiles above were left untouched. Other files were processed normally.');
}

// Exit codes:
//   0 — clean (no rewrite needed, or APPLY succeeded)
//   1 — `--check` mode and rewrites are pending OR conflicts present
const checkFailed = CHECK && (totalChanges > 0 || conflictFiles.length > 0);
const conflictFailed = conflictFiles.length > 0;
if (checkFailed) {
  console.error('\n--check: codemod is needed. Re-run with --apply.');
  process.exit(1);
}
if (conflictFailed) {
  // Even outside `--check`, conflicts are exit-1 so CI / chained scripts
  // notice. Files were left untouched so this is non-destructive.
  process.exit(1);
}
