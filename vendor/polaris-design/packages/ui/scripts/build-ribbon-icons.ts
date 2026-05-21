/**
 * build-ribbon-icons — generates React components from
 * `assets/ribbon/{big,small}/`.
 *
 * The ribbon icon set is multi-color (grayscale chrome + brand
 * accents per icon meaning) — like file-icons, NOT like UI icons.
 * Colors are baked in; we don't inject `currentColor`.
 *
 * Two source folders:
 *   - `big/` — 32×32 master, used by RibbonButton size="lg"
 *     (icon-over-label) and other prominent placements
 *   - `small/` — 16×16 master, used by RibbonButton size="sm/md"
 *     (icon-only or icon-before-label) for text-formatting toolbars
 *
 * The two folders have DIFFERENT icon sets (small ≠ scaled big), so
 * we treat them as one merged barrel. Each component knows its
 * native size and its slug stays unique across both folders. Output
 * goes to `packages/ui/src/ribbon-icons/<slug>.tsx`.
 *
 *   import { BoldIcon, AiChatIcon, AlgnLeft01Icon } from '@polaris/ui/ribbon-icons';
 *   <BoldIcon />        // 16×16 small
 *   <AiChatIcon />      // 32×32 big
 *   <AiChatIcon size={20} />  // scale uniformly
 *
 * Run: `pnpm --filter @polaris/ui build:ribbon-icons`. Output is
 * gitignored; regenerated from `assets/ribbon/` at install time
 * (via the `prepare` hook).
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prefixSvgIds } from './_svg-utils';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSET_ROOT = resolve(__dirname, '../../../assets/ribbon');
const OUT_ROOT = resolve(__dirname, '../src/ribbon-icons');

interface RibbonIconEntry {
  slug: string;          // kebab-case, unique
  pascal: string;        // PascalCase
  componentName: string; // <pascal>Icon
  inner: string;         // SVG body (no <svg> tags)
  nativeSize: 16 | 32;   // small or big
  category: 'big' | 'small';
}

function pascalCase(slug: string): string {
  const pascal = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  // JS identifiers can't start with a digit. If a future Figma export
  // produces e.g. "2d-3d" → "2dTo3d", that's an invalid component name
  // and the build would emit a file that fails at parse time. Reject
  // here with a clear error so the offending slug is obvious.
  if (/^[0-9]/.test(pascal)) {
    throw new Error(
      `Invalid slug '${slug}': PascalCase form starts with a digit ('${pascal}'). ` +
      `Rename the source SVG so its slug starts with a letter (e.g. 'ai-${slug}').`
    );
  }
  return pascal;
}

function extractInner(svg: string): string {
  const m = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!m) throw new Error('SVG missing root <svg> tag');
  return m[1].trim();
}

/**
 * Curated slug rewrites for Figma exports whose filename concatenates
 * compound words (e.g. `aligncenter` instead of `align-center`).
 *
 * The Figma source name is preserved in `assets/ribbon/`; this map
 * runs *after* basic normalization but *before* PascalCase, so the
 * exported component names are human-readable (`AlignCenterIcon`
 * rather than `AligncenterIcon`).
 *
 * Rule of thumb for adding entries: only split when the result is a
 * common multi-word concept; leave hyperlink / strikethrough / numbering
 * etc. unsplit because they're widely treated as single tokens.
 *
 * Edits here change the public component API. Once `@polaris/ui/ribbon-icons`
 * is published, removing or changing a target slug is a breaking change
 * (only ADDING new entries for new Figma exports is safe afterwards).
 */
const SLUG_REWRITES: Record<string, string> = {
  // Small (16) — text formatting + alignment
  aligncenter:     'align-center',
  alignleft:       'align-left',
  alignright:      'align-right',
  changecase:      'change-case',
  clearformat:     'clear-format',
  fillcolor:       'fill-color',
  linespacing:     'line-spacing',
  multilevel:      'multi-level',
  textcolor:       'text-color',
  textoutline:     'text-outline',
  // Big (32) — image / shape primitives + page
  alignleft01:        'align-left-01',
  docuprotection:     'docu-protection',
  horizontaltextbox:  'horizontal-textbox',
  linebreak:          'line-break',
  movebackward:       'move-backward',
  moveforward:        'move-forward',
  newpage:            'new-page',
  noapply:            'no-apply',
  pagescale:          'page-scale',
  pagesplit:          'page-split',
  'pagesplit-sheet':  'page-split-sheet',
  rotateright90:      'rotate-right-90',
  setlayout:          'set-layout',
  setpage:            'set-page',
  spellingcheck:      'spelling-check',
  wordcount:          'word-count',
  // Big — AI compound names
  'ai-bgchange':    'ai-bg-change',
  'ai-bgdelete':    'ai-bg-delete',
  'ai-wordcloud':   'ai-word-cloud',
};

/**
 * Normalize a Figma-export filename to a kebab-case slug, then apply
 * `SLUG_REWRITES` for human-readable compound splitting.
 *
 *   ribbon_big_ico_ai_2dto3d.svg     → ai-2dto3d           (no rewrite)
 *   ribbon_big_ico_change_next.svg   → change-next         (no rewrite)
 *   ribbon_ico_aligncenter.svg       → align-center        (rewritten)
 *   ribbon_ico_shade new.svg         → shade-new           (no rewrite)
 *   ribbon_ico_underline_01.svg      → underline-01        (no rewrite)
 *   ribbon_big_ico_rotateright90.svg → rotate-right-90     (rewritten)
 */
function normalizeSlug(filename: string): string {
  const base = filename
    .replace(/\.svg$/i, '')
    .replace(/^ribbon_(big_)?ico_/i, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return SLUG_REWRITES[base] ?? base;
}

function readFolder(category: 'big' | 'small'): RibbonIconEntry[] {
  const dir = join(ASSET_ROOT, category);
  const nativeSize = category === 'big' ? 32 : 16;
  const entries: RibbonIconEntry[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.svg') || file.startsWith('.')) continue;
    const slug = normalizeSlug(file);
    if (!slug) continue;
    const pascal = pascalCase(slug);
    // Prefix internal ids with the slug so e.g. WordcountIcon's
    // `clip0_0_31035` doesn't collide with PasteIcon's same-named clip
    // when both render on the same page.
    const inner = prefixSvgIds(
      extractInner(readFileSync(join(dir, file), 'utf8')),
      slug,
    );
    entries.push({
      slug,
      pascal,
      componentName: `${pascal}Icon`,
      inner,
      nativeSize,
      category,
    });
  }
  return entries;
}

function emitComponent(entry: RibbonIconEntry): string {
  const escaped = entry.inner.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  return `// AUTO-GENERATED by packages/ui/scripts/build-ribbon-icons.ts — do not edit by hand.
// Source: assets/ribbon/${entry.category}/ribbon${entry.category === 'big' ? '_big' : ''}_ico_${entry.slug.replace(/-/g, '_')}.svg (${entry.nativeSize}×${entry.nativeSize} native)
import { forwardRef } from 'react';
import type { RibbonIconProps } from './types';

const INNER = \`${escaped}\`;
const NATIVE_SIZE = ${entry.nativeSize};

export const ${entry.componentName} = forwardRef<SVGSVGElement, RibbonIconProps>(
  ({ size = NATIVE_SIZE, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={\`0 0 \${NATIVE_SIZE} \${NATIVE_SIZE}\`}
      fill="none"
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
      dangerouslySetInnerHTML={{ __html: INNER }}
    />
  )
);
${entry.componentName}.displayName = '${entry.componentName}';
`;
}

function emitTypesFile(): string {
  return `// AUTO-GENERATED — do not edit. Run \`pnpm build:ribbon-icons\`.
import type { SVGAttributes } from 'react';

/** Common props for \`@polaris/ui/ribbon-icons\` components.
 *
 * Each icon has a native size (16 for "small" toolbar icons, 32 for
 * "big" lg-button icons). Pass \`size\` (px) to scale uniformly —
 * width / height are mirrored. Colors are baked into the SVG per the
 * design source; \`text-{color}\` and \`color\` props don't recolor
 * ribbon icons (unlike the monochrome \`@polaris/ui/icons\` set).
 *
 * \`dangerouslySetInnerHTML\` and \`children\` are excluded because the
 * SVG body is generated at build time. */
export interface RibbonIconProps
  extends Omit<SVGAttributes<SVGSVGElement>, 'dangerouslySetInnerHTML' | 'children'> {
  /** Pixel size; default = the icon's native master (16 for small, 32 for big). */
  size?: number;
}
`;
}

function emitIndex(entries: RibbonIconEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.slug.localeCompare(b.slug));
  const exports = sorted.map((e) => `export { ${e.componentName} } from './${e.slug}';`).join('\n');
  const importList = sorted.map((e) => `import { ${e.componentName} } from './${e.slug}';`).join('\n');
  const lookupEntries = sorted.map((e) => `  '${e.slug}': ${e.componentName}`).join(',\n');

  // Big / small categorization — emitted as Sets so the catalog page
  // and any consumer can group by native size without re-parsing slugs.
  const bigSlugs = sorted.filter((e) => e.category === 'big').map((e) => `'${e.slug}'`);
  const smallSlugs = sorted.filter((e) => e.category === 'small').map((e) => `'${e.slug}'`);

  return `// AUTO-GENERATED — do not edit. Run \`pnpm build:ribbon-icons\`.
//
// Polaris ribbon icon set — ${entries.length} icons total
// (${entries.filter((e) => e.category === 'big').length} big × 32 px + ${entries.filter((e) => e.category === 'small').length} small × 16 px).
//
//   import { BoldIcon, AiChatIcon } from '@polaris/ui/ribbon-icons';
//   <BoldIcon />              // 16 × 16 (small native)
//   <AiChatIcon size={20} />  // scale 32 → 20

export type { RibbonIconProps } from './types';

${exports}

${importList}

/** Map from slug → component. Useful for dynamic lookup (e.g., a
 *  ribbon-button data table or icon catalog page). */
export const RIBBON_ICON_REGISTRY = {
${lookupEntries},
} as const;

/** Slugs whose icon is 32 px native (big — for lg ribbon buttons). */
export const RIBBON_ICON_BIG_SLUGS: ReadonlySet<string> = new Set([
  ${bigSlugs.join(', ')},
]);

/** Slugs whose icon is 16 px native (small — for sm/md ribbon buttons). */
export const RIBBON_ICON_SMALL_SLUGS: ReadonlySet<string> = new Set([
  ${smallSlugs.join(', ')},
]);
`;
}

function emitManifest(entries: RibbonIconEntry[]): string {
  const data = [...entries]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((e) => ({
      slug: e.slug,
      component: e.componentName,
      nativeSize: e.nativeSize,
      category: e.category,
    }));
  return JSON.stringify(data, null, 2) + '\n';
}

function main() {
  const big = readFolder('big');
  const small = readFolder('small');
  const all = [...big, ...small];

  // Detect slug collisions across big/small. None expected at the
  // current source; this guard catches a future Figma export that
  // accidentally introduces a duplicate.
  const seen = new Map<string, RibbonIconEntry>();
  for (const e of all) {
    const prev = seen.get(e.slug);
    if (prev) {
      throw new Error(
        `Slug collision: '${e.slug}' appears in both ${prev.category}/ and ${e.category}/. Rename one source SVG.`
      );
    }
    seen.set(e.slug, e);
  }

  // Idempotent + concurrency-safe: don't rm the dir wholesale (a parallel
  // generator invocation — e.g. CI running multiple package typecheck
  // scripts in parallel — would hit ENOTEMPTY mid-write). Instead, mkdir
  // (recursive = noop if exists), overwrite each file, then prune
  // orphans by comparing the on-disk set to the expected set.
  mkdirSync(OUT_ROOT, { recursive: true });

  const expected = new Set([
    'types.ts',
    'index.ts',
    'MANIFEST.json',
    ...all.map((e) => `${e.slug}.tsx`),
  ]);

  writeFileSync(join(OUT_ROOT, 'types.ts'), emitTypesFile());
  for (const entry of all) {
    writeFileSync(join(OUT_ROOT, `${entry.slug}.tsx`), emitComponent(entry));
  }
  writeFileSync(join(OUT_ROOT, 'index.ts'), emitIndex(all));
  writeFileSync(join(OUT_ROOT, 'MANIFEST.json'), emitManifest(all));

  pruneOrphans(OUT_ROOT, expected);

  console.log(
    `✓ wrote ${all.length} ribbon-icon components (${big.length} big + ${small.length} small) → packages/ui/src/ribbon-icons/`
  );
}

/** Best-effort orphan removal for files in `dir` not in `expected`.
 *  Tolerates races with parallel generator invocations (mirrors the
 *  helper in build-icons / build-file-icons / build-logos). */
function pruneOrphans(dir: string, expected: Set<string>): void {
  try {
    for (const f of readdirSync(dir)) {
      if (expected.has(f)) continue;
      try { unlinkSync(join(dir, f)); } catch { /* parallel run already pruned */ }
    }
  } catch { /* dir vanished mid-prune — next run repairs */ }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
