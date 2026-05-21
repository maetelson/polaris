#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

async function main() {
  const failures = [];
  const pages = await readJson('docs/design/generated/polaris.pages.json');
  const components = await readJson('docs/design/generated/polaris.component-registry.json');
  const tokens = await readJson('docs/design/generated/polaris.token-registry.json');

  for (const route of ['/', '/components', '/tokens', '/icons', '/assets']) {
    assert(pages.routes.some((item) => item.path === route), `Missing GitHub Pages route: ${route}`, failures);
  }

  const requiredCategories = ['foundation', 'forms', 'navigation', 'overlays', 'data', 'polaris'];
  for (const category of requiredCategories) {
    assert(
      Array.isArray(components.demo.categories[category]) && components.demo.categories[category].length > 0,
      `Missing component demo category: ${category}`,
      failures
    );
  }

  assert(components.summary.demoSectionCount >= 45, 'Component Pages sections should cover 45+ showcases', failures);
  assert(components.summary.demoImportCount >= 60, 'Component Pages imports should include secondary/root exports', failures);
  for (const secondaryExport of ['AvatarGroup', 'DateRangePicker', 'TimeInput', 'FileDropZone', 'PaginationFooter', 'TableSkeleton']) {
    assert(components.rootExports.includes(secondaryExport), `Missing component secondary export: ${secondaryExport}`, failures);
  }

  for (const colorGroup of ['brandIdentity', 'semantic', 'brandRamps', 'supplementaryRamps', 'neutralAndGray']) {
    assert(tokens.colors.counts[colorGroup] > 0, `Missing token color group: ${colorGroup}`, failures);
  }
  assert(tokens.typography.count === 11, 'Typography registry should contain the 11-step Polaris scale', failures);
  for (const gridKey of ['spacingNamed', 'breakpoint', 'container']) {
    assert(Object.keys(tokens.grid[gridKey] || {}).length > 0, `Missing grid registry key: ${gridKey}`, failures);
  }
  for (const axis of ['color', 'typography', 'spacing/grid', 'breakpoint']) {
    assert(tokens.pagesReference.requiredVisualAxes.includes(axis), `Missing Pages token visual axis: ${axis}`, failures);
  }

  if (failures.length > 0) {
    console.error('Polaris Pages coverage check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Polaris Pages coverage check passed.');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
