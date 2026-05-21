/**
 * Tailwind preset (v3) ↔ token map ↔ v4 theme parity test.
 *
 * v0.8 release-gate regression: the v3 preset used to map
 * `accent-brand-normal-subtle` to `--polaris-accent-brand-bg` (a different
 * value), so v3 and v4 builds rendered hover highlights at different
 * intensities. Codex review caught it. This test locks the parity so
 * regressions get flagged at `pnpm test` instead of in production.
 *
 * The check pattern:
 *   1. Resolve each color leaf in the v3 preset to its CSS var name.
 *   2. Read `tokens.css` to confirm the var is defined (otherwise the
 *      class would emit no CSS at runtime — silent failure).
 *   3. Read `v4-theme.css` to confirm the v4 mapping points at the same
 *      `--polaris-*` source variable.
 */
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import polarisPreset from './index';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS = readFileSync(join(__dirname, '..', 'styles', 'tokens.css'), 'utf8');
const V4_THEME_CSS = readFileSync(join(__dirname, '..', 'styles', 'v4-theme.css'), 'utf8');

const colors = polarisPreset.theme!.extend!.colors as Record<string, unknown>;

/** Resolve a Tailwind color leaf to its underlying `var(--polaris-…)` form.
 *  The preset wraps every color in a callable that returns either a plain
 *  `var(--…)` (no alpha) or a `color-mix(…)` string (with alpha). We invoke
 *  with no opacity so we get the bare CSS var back. */
function resolveLeaf(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'function') {
    try {
      // Tailwind passes `{ opacityValue }`; default to undefined → bare var.
      const out = (value as (arg?: { opacityValue?: string }) => string)({});
      return typeof out === 'string' ? out : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Walk the nested color tree and emit `[path, "var(--polaris-…)"]` pairs. */
function* walkColors(node: unknown, path: string[] = []): Generator<[string[], string]> {
  const resolved = resolveLeaf(node);
  if (resolved !== null) {
    yield [path, resolved];
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const next = k === 'DEFAULT' ? path : [...path, k];
      yield* walkColors(v, next);
    }
  }
}

const VAR_RE = /var\((--polaris-[a-z0-9-]+)\)/;

describe('Tailwind preset (v3) — CSS var integrity', () => {
  test('every color leaf resolves to a `--polaris-*` CSS variable', () => {
    const violations: string[] = [];
    for (const [path, value] of walkColors(colors)) {
      if (!VAR_RE.test(value)) violations.push(`${path.join('.')} → ${value}`);
    }
    expect(violations).toEqual([]);
  });

  test('every referenced `--polaris-*` var is defined in tokens.css (light + dark)', () => {
    const referenced = new Set<string>();
    for (const [, value] of walkColors(colors)) {
      const m = VAR_RE.exec(value);
      if (m) referenced.add(m[1]!);
    }
    // tokens.css declares each var twice (light root + dark `[data-theme=dark]`).
    // Allow either; we only require the var to appear at least once.
    const missing = [...referenced].filter((v) => !TOKENS_CSS.includes(`${v}:`));
    expect(missing).toEqual([]);
  });

  test('semantic accent-brand tokens are mirrored in v4-theme.css (rc.0 fix)', () => {
    // v4-theme.css maps `--color-<name>: var(--polaris-<name>);` so v4
    // builds get the same value the v3 preset uses. The rc.0 bug was a
    // drift on `accent-brand-normal-subtle`; lock the whole namespace so
    // future entries can't drift the same way.
    //
    // Scope: semantic tokens only (label / background / layer / fill /
    // line / accent-* / state / focus / interaction / staticColors).
    // Primitive ramps (`bg-blue-50`, `bg-gray-30`) are intentionally not
    // exposed as `--color-*` in v4-theme.css today — that gap is tracked
    // separately and is not the rc.0 regression.
    const accentBrand = (colors['accent-brand'] ?? {}) as Record<string, unknown>;
    const drift: string[] = [];
    for (const [path, value] of walkColors(accentBrand, ['accent-brand'])) {
      const m = VAR_RE.exec(value);
      if (!m) continue;
      if (!V4_THEME_CSS.includes(`var(${m[1]})`)) {
        drift.push(`${path.join('.')} → ${m[1]}`);
      }
    }
    expect(drift).toEqual([]);
  });

  test('accent-brand-normal-subtle uses the canonical token (rc.0 regression)', () => {
    // Direct check for the rc.0 → rc.1 fix: the v3 preset must point at
    // `--polaris-accent-brand-normal-subtle` (E8F2FE), NOT the stronger
    // `--polaris-accent-brand-bg` (D9EAFF) it accidentally aliased to.
    const accentBrand = (colors['accent-brand'] ?? {}) as Record<string, unknown>;
    expect(resolveLeaf(accentBrand['normal-subtle'])).toBe(
      'var(--polaris-accent-brand-normal-subtle)',
    );
  });
});
