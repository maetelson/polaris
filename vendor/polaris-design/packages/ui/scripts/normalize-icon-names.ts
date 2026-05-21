/**
 * normalize-icon-names — rewrites Figma's auto-export SVG filenames to
 * a stable kebab-case form.
 *
 *   Type=Arrow-Down, Size=18.svg   →   arrow-down.svg
 *   Type=Info--Circle, Size=24.svg →   info-circle.svg
 *   Type=Send_Fill, Size=32.svg    →   send-fill.svg
 *   Type=panel-right-open, Size=18 →   panel-right-open.svg
 *   Type=Chevron-down, Size=18.svg →   chevron-down.svg
 *
 * Run after dropping a fresh Figma export into `assets/svg/icons/{18,24,32}/`.
 * Idempotent — files already in the canonical form are left alone.
 *
 * Usage:
 *   pnpm --filter @polaris/ui normalize:icons
 *   # or directly:
 *   tsx packages/ui/scripts/normalize-icon-names.ts assets/svg/icons
 */
import { readdirSync, renameSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(__dirname, '../../../assets/svg/icons');

/**
 * Canonicalize a Figma-exported filename.
 *
 * Steps (in order):
 * 1. Strip the `Type=` prefix and `, Size=NN[.svg]` suffix → keep only the
 *    type identifier.
 * 2. Lowercase.
 * 3. Spaces / underscores → hyphens.
 * 4. Collapse repeated hyphens (`a--b` → `a-b`).
 * 5. Trim leading/trailing hyphens.
 * 6. Append `.svg`.
 */
export function normalizeIconName(filename: string): string | null {
  const m = filename.match(/^Type=(.+?), Size=\d+\.svg$/);
  if (!m) return null; // not a Figma export — skip
  const raw = m[1];
  const slug = raw
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug}.svg`;
}

function processSizeDir(dir: string): { renamed: number; skipped: number } {
  let renamed = 0;
  let skipped = 0;
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.svg')) continue;
    const next = normalizeIconName(entry);
    if (!next) {
      skipped++;
      continue;
    }
    if (next === entry) {
      skipped++;
      continue;
    }
    const from = join(dir, entry);
    const to = join(dir, next);
    renameSync(from, to);
    renamed++;
  }
  return { renamed, skipped };
}

function main() {
  if (!statSync(ROOT, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`Not a directory: ${ROOT}`);
    process.exit(1);
  }
  let totalRenamed = 0;
  let totalSkipped = 0;
  for (const sizeDir of ['18', '24', '32']) {
    const path = join(ROOT, sizeDir);
    const stat = statSync(path, { throwIfNoEntry: false });
    if (!stat?.isDirectory()) {
      console.warn(`  skip: ${path} (not found)`);
      continue;
    }
    const { renamed, skipped } = processSizeDir(path);
    totalRenamed += renamed;
    totalSkipped += skipped;
    console.log(`  ${sizeDir}/: ${renamed} renamed, ${skipped} already canonical`);
  }
  console.log(`\nTotal: ${totalRenamed} renamed, ${totalSkipped} unchanged.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
