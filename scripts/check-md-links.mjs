#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const IGNORE_DIRS = new Set(['.git', 'node_modules']);
const LINK_PATTERN = /!?\[[^\]]*\]\(([^)]+)\)/g;

async function walkMarkdown(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkMarkdown(full)));
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}

function markdownRootFor(file) {
  const normalized = normalizePath(file);
  if (normalized.startsWith('vendor/polaris-design/')) return path.resolve('vendor/polaris-design');
  return process.cwd();
}

function extractHrefTarget(rawHref) {
  let href = rawHref.trim();
  if (!href || href.startsWith('#')) return null;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return null;
  if (href.startsWith('<')) {
    const close = href.indexOf('>');
    if (close >= 0) href = href.slice(1, close);
  } else {
    const titleMatch = href.match(/^(\S+)\s+["'][^"']+["']$/);
    if (titleMatch) href = titleMatch[1];
  }
  const withoutFragment = href.split('#')[0];
  if (!withoutFragment) return null;
  return decodeURIComponent(withoutFragment);
}

function resolveLink(file, href) {
  if (href.startsWith('/')) return path.join(markdownRootFor(file), href.slice(1));
  return path.resolve(path.dirname(file), href);
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

async function main() {
  const failures = [];
  const files = await walkMarkdown('.');
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(LINK_PATTERN)) {
      const target = extractHrefTarget(match[1]);
      if (!target) continue;
      const resolved = resolveLink(file, target);
      if (!existsSync(resolved)) {
        failures.push({
          file: normalizePath(file),
          line: lineNumber(text, match.index),
          href: match[1],
          resolved: normalizePath(path.relative(process.cwd(), resolved)),
        });
      }
    }
  }

  if (failures.length > 0) {
    console.error('Markdown local link check failed:');
    for (const failure of failures) {
      console.error(`- ${failure.file}:${failure.line} -> ${failure.href} (${failure.resolved})`);
    }
    process.exit(1);
  }

  console.log('Markdown local link check passed.');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
