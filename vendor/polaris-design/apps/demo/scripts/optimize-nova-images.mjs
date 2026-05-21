#!/usr/bin/env node
/**
 * Re-encodes the polaris-marketing PNGs in public/nova-features/ for the
 * deployed demo. Targets:
 *   - max width 800px (downscale only — never upscale)
 *   - palette quantization for the graphic-style tiles (most are mockups
 *     with limited color palettes, which compress dramatically as PNG8)
 *   - high zlib compression
 *
 * Run on demand:
 *   pnpm --filter demo optimize-images
 *
 * The originals come from polink-static-contents.polarisoffice.com — if
 * they change upstream, re-download then re-run this script.
 */
import sharp from 'sharp';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'public', 'nova-features');
const TARGET_WIDTH = 800;

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const files = readdirSync(DIR)
  .filter((f) => extname(f).toLowerCase() === '.png')
  .sort();

if (files.length === 0) {
  console.error(`no .png files in ${DIR}`);
  process.exit(1);
}

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const path = join(DIR, file);
  const before = statSync(path).size;
  totalBefore += before;

  const buf = await sharp(path)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .png({
      compressionLevel: 9,
      effort: 10,
      palette: true,
      quality: 85,
    })
    .toBuffer();
  await sharp(buf).toFile(path);

  const after = statSync(path).size;
  totalAfter += after;
  const delta = ((1 - after / before) * 100).toFixed(0);
  console.log(`${file.padEnd(20)} ${fmt(before).padStart(8)}  →  ${fmt(after).padStart(8)}   (${delta}% smaller)`);
}

const totalDelta = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
console.log('─'.repeat(60));
console.log(
  `${'total'.padEnd(20)} ${fmt(totalBefore).padStart(8)}  →  ${fmt(totalAfter).padStart(8)}   (${totalDelta}% smaller)`
);
