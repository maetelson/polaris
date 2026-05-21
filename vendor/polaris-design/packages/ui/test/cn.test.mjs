import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../dist/index.js';

test('cn merges polaris border-radius classes', () => {
  assert.equal(cn('rounded-polaris-lg', 'rounded-polaris-xl'), 'rounded-polaris-xl');
});

test('cn merges polaris box-shadow classes', () => {
  assert.equal(cn('shadow-polaris-sm', 'shadow-polaris-lg'), 'shadow-polaris-lg');
});

test('cn keeps polaris font-size classes from being stripped by text-color', () => {
  assert.equal(
    cn('text-polaris-body-sm', 'text-fg-on-brand'),
    'text-polaris-body-sm text-fg-on-brand',
  );
});
