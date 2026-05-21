#!/usr/bin/env node

const fs = require('fs');

const allowedTypes = new Set([
  'feat',
  'fix',
  'docs',
  'design',
  'token',
  'style',
  'refactor',
  'test',
  'chore',
  'ci',
  'build',
  'perf',
  'revert',
]);

const messagePath = process.argv[2];

if (!messagePath) {
  console.error('Commit message file path is required.');
  process.exit(1);
}

const raw = fs.readFileSync(messagePath, 'utf8');
const header = raw
  .split(/\r?\n/)
  .find((line) => line.trim() && !line.trim().startsWith('#'))
  ?.replace(/^\uFEFF/, '')
  .trim();

if (!header) {
  console.error('Commit message is empty.');
  process.exit(1);
}

const skipPatterns = [/^Merge\b/, /^Revert\b/, /^fixup!\s/, /^squash!\s/];
if (skipPatterns.some((pattern) => pattern.test(header))) {
  process.exit(0);
}

const headerPattern = /^([a-z]+)(?:\(([a-z0-9\uac00-\ud7a3._/-]+)\))?!?:\s(.+)$/u;
const match = header.match(headerPattern);

if (!match) {
  console.error('Invalid commit title format.');
  console.error('Example: feat(figma): 디자인 토큰 동기화 기능 추가');
  process.exit(1);
}

const [, type, , subject] = match;

if (!allowedTypes.has(type)) {
  console.error(`Invalid commit type: ${type}`);
  console.error(`Allowed types: ${Array.from(allowedTypes).join(', ')}`);
  process.exit(1);
}

if (!/[\uac00-\ud7a3]/u.test(subject)) {
  console.error('Commit title subject must include Korean text.');
  process.exit(1);
}

if (subject.endsWith('.')) {
  console.error('Commit title must not end with a period.');
  process.exit(1);
}

if (header.length > 72) {
  console.error(`Commit title must be 72 characters or less. Current: ${header.length}`);
  process.exit(1);
}

process.exit(0);
