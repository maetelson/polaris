import type { Rule } from 'eslint';

/**
 * Block deprecated Polaris token aliases (v0.6 / rc.0 / rc.1 era) — they
 * still resolve at runtime via Tailwind preset alias entries, but they're
 * scheduled for removal in v0.8 and using them today produces visually
 * stale designs (rc.0 had purple-tinted neutrals; v0.7 spec mandates
 * neutral grays).
 *
 * **Why this exists** — the dashboard re-review (2026-05-08) found a
 * site loading Polaris tokens but using deprecated aliases like
 * `--polaris-neutral-600` (rc.0 boring purple `#6E6E84`) instead of
 * `--polaris-label-neutral` (v0.7 spec `#454C53`). Same site, technically
 * "Polaris-compliant" (token classes work), but the resulting visual is
 * off-spec because the alias points at the wrong palette.
 *
 * **Catches**:
 *   - Tailwind classes: `bg-fg-primary`, `text-surface-raised`,
 *     `bg-brand-primary`, `text-status-success` (rc.0 / v0.6 family)
 *   - CSS-var references: `var(--polaris-neutral-600)`,
 *     `var(--polaris-text-primary)`, `var(--polaris-surface-canvas)`
 *
 * **Auto-fix is intentionally NOT implemented** — the v0.6→v0.7 mapping
 * is non-trivial (e.g., `text-fg-primary` could map to `text-label-normal`
 * or `text-label-neutral` depending on context). Use the codemod instead:
 *
 *   pnpm dlx @polaris/lint polaris-codemod-v08 --apply src
 *
 * The codemod handles the bulk migration; this rule then guards against
 * regressions (new code accidentally using deprecated names).
 *
 * v0.8 status: most aliases were physically removed from the Tailwind
 * preset / token CSS, so flagged classes now produce dead utilities at
 * build time (the build no longer emits CSS for `bg-fg-primary` etc.).
 * The rule still reports them so CR can spot stale code before it
 * silently breaks visuals.
 */

/**
 * Token suffixes that are deprecated. Map to v0.7 replacement hint.
 *
 * Format: deprecated-name → v0.7-replacement-hint.
 *
 * The regex below matches `(?:text|bg|border|ring|outline|divide|fill|
 * stroke)-<deprecated>` patterns in className strings.
 */
const DEPRECATED_TAILWIND_TOKENS: Record<string, string> = {
  // v0.6 family — `fg-*` (foreground)
  'fg-primary':           'label-normal',
  'fg-secondary':         'label-neutral',
  'fg-muted':             'label-alternative',
  'fg-on-brand':          'label-inverse',
  'fg-on-status':         'label-inverse',
  // v0.6 family — `surface-*`
  'surface-canvas':       'background-base',
  'surface-raised':       'layer-surface',
  'surface-sunken':       'fill-neutral',
  'surface-border':       'line-neutral',
  'surface-border-strong':'line-normal',
  // rc.0 family — `brand-primary*` (replaced by accent-brand-*)
  'brand-primary':        'accent-brand-normal',
  'brand-primary-hover':  'accent-brand-strong',
  'brand-primary-subtle': 'accent-brand-bg',
  'brand-secondary':      'ai-normal',
  'brand-secondary-hover':'ai-strong',
  'brand-secondary-subtle': 'ai-hover',
  // rc.0 family — `primary-*` (replaced by accent-brand-*)
  'primary-normal':       'accent-brand-normal',
  'primary-strong':       'accent-brand-strong',
  // v1 status family — `status-*` (replaced by state-* in v0.7.3)
  'status-success':       'state-success',
  'status-warning':       'state-warning',
  'status-danger':        'state-error',
  'status-info':          'state-info',
  'status-success-hover': 'state-success',
  'status-warning-hover': 'state-warning',
  'status-danger-hover':  'state-error',
  'status-info-hover':    'state-info',
  // v0.8 — `background-*` neutrals split into `background-base` / `fill-neutral`
  'background-normal':       'background-base',
  'background-alternative':  'fill-neutral',
};

/**
 * CSS variables that are deprecated aliases. Reference via `var(--name)`
 * is what we flag here.
 */
const DEPRECATED_CSS_VARS: Record<string, string> = {
  // rc.0 boring "neutral" palette (purple-tinted, off-spec)
  '--polaris-neutral-50':   '--polaris-fill-neutral',
  '--polaris-neutral-100':  '--polaris-fill-neutral',
  '--polaris-neutral-200':  '--polaris-line-neutral',
  '--polaris-neutral-300':  '--polaris-line-normal',
  '--polaris-neutral-400':  '--polaris-line-strong',
  '--polaris-neutral-500':  '--polaris-label-assistive',
  '--polaris-neutral-600':  '--polaris-label-alternative',
  '--polaris-neutral-700':  '--polaris-label-neutral',
  '--polaris-neutral-800':  '--polaris-label-normal',
  '--polaris-neutral-900':  '--polaris-label-normal',
  '--polaris-neutral-1000': '--polaris-label-normal',
  // rc.0 text-* (replaced by label-*)
  '--polaris-text-primary':   '--polaris-label-normal',
  '--polaris-text-secondary': '--polaris-label-neutral',
  '--polaris-text-muted':     '--polaris-label-alternative',
  '--polaris-text-on-brand':  '--polaris-label-inverse',
  '--polaris-text-on-status': '--polaris-label-inverse',
  // rc.0 surface-* (replaced by background-* / layer-* / fill-* / line-*)
  '--polaris-surface-canvas':       '--polaris-background-base',
  '--polaris-surface-raised':       '--polaris-layer-surface',
  '--polaris-surface-sunken':       '--polaris-fill-neutral',
  '--polaris-surface-border':       '--polaris-line-neutral',
  '--polaris-surface-border-strong':'--polaris-line-normal',
  // v0.6 brand aliases (removed in v0.8)
  '--polaris-brand-primary':        '--polaris-accent-brand-normal',
  '--polaris-brand-primary-hover':  '--polaris-accent-brand-strong',
  '--polaris-brand-primary-subtle': '--polaris-accent-brand-bg',
  '--polaris-brand-secondary':      '--polaris-ai-normal',
  '--polaris-brand-secondary-hover':'--polaris-ai-strong',
  // rc.0 primary-* (replaced by accent-brand-*)
  '--polaris-primary-normal':       '--polaris-accent-brand-normal',
  '--polaris-primary-strong':       '--polaris-accent-brand-strong',
  // v1 status family
  '--polaris-status-success':       '--polaris-state-success',
  '--polaris-status-success-hover': '--polaris-state-success',
  '--polaris-status-warning':       '--polaris-state-warning',
  '--polaris-status-warning-hover': '--polaris-state-warning',
  '--polaris-status-danger':        '--polaris-state-error',
  '--polaris-status-danger-hover':  '--polaris-state-error',
  '--polaris-status-info':          '--polaris-state-info',
  '--polaris-status-info-hover':    '--polaris-state-info',
  // v0.8 — background neutrals split
  '--polaris-background-normal':      '--polaris-background-base',
  '--polaris-background-alternative': '--polaris-fill-neutral',
  // v0.8 — radius-full removed
  '--polaris-radius-full':            '--polaris-radius-pill',
};

const TAILWIND_UTIL_PREFIXES =
  'text|bg|border|ring|outline|divide|placeholder|caret|accent|decoration|shadow|from|via|to|fill|stroke';

/**
 * Build one big regex for Tailwind class detection. We escape `-` in the
 * suffix list, then or-join everything to a single pattern so we can
 * report exact matches.
 */
const TAILWIND_DEPRECATED_REGEX = new RegExp(
  `\\b(?:${TAILWIND_UTIL_PREFIXES})-(${Object.keys(DEPRECATED_TAILWIND_TOKENS).map(k => k.replace(/[-]/g, '-')).join('|')})\\b`,
  'g'
);

/**
 * Typography / radius classes that don't fit the
 * `(prefix)-(color-suffix)` pattern. v0.8 removed all of these — listed
 * here so the rule reports the same set the codemod handles.
 */
const DEPRECATED_FULL_CLASSES: Record<string, string> = {
  // typography (v0.6 / rc.0 names)
  'text-polaris-display-lg': 'text-polaris-display',
  'text-polaris-display-md': 'text-polaris-title',
  'text-polaris-heading-lg': 'text-polaris-heading2',
  'text-polaris-heading-md': 'text-polaris-heading3',
  'text-polaris-heading-sm': 'text-polaris-heading4',
  'text-polaris-h1':         'text-polaris-display',
  'text-polaris-h2':         'text-polaris-title',
  'text-polaris-h3':         'text-polaris-heading1',
  'text-polaris-h4':         'text-polaris-heading2',
  'text-polaris-h5':         'text-polaris-heading4',
  'text-polaris-body':       'text-polaris-body1',
  'text-polaris-body-lg':    'text-polaris-body1',
  'text-polaris-body-sm':    'text-polaris-body2',
  'text-polaris-meta':       'text-polaris-caption1',
  'text-polaris-tiny':       'text-polaris-caption2',
  'text-polaris-caption':    'text-polaris-caption1',
  // radius
  'rounded-polaris-full':    'rounded-polaris-pill',
};

const FULL_CLASS_DEPRECATED_REGEX = new RegExp(
  // Negative lookahead `(?!\d|-(?:lg|md|sm|xs|2xs|xl|2xl|pill))` keeps
  // `text-polaris-body1` (digit follows) and similar v0.8 spec names
  // from matching when their prefix happens to overlap. We list each
  // legacy key explicitly with `\b` to avoid prefix collisions.
  `\\b(${Object.keys(DEPRECATED_FULL_CLASSES).map(k => k.replace(/-/g, '-')).join('|')})\\b(?!\\d|-)`,
  'g',
);

/**
 * Color ramp step `5` (no leading zero) — removed in v0.8 in favor of
 * `05` so all ramp steps share two-digit alignment. Gray ramp is
 * 10-90 only and not affected.
 */
const RAMP_BARE_5_REGEX = new RegExp(
  // (utility prefix)-(family)-5  (NOT followed by another digit, so
  // -50, -500 stay clean)
  `\\b(?:${TAILWIND_UTIL_PREFIXES})-(blue|dark-blue|green|orange|red|purple|sky-blue|blue-supplementary|violet|cyan|yellow)-5\\b(?!\\d)`,
  'g',
);

/** `var(--polaris-neutral-600)` style references. */
const CSS_VAR_REGEX = /var\(\s*(--polaris-[a-z0-9-]+)\s*[,)]/g;

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deprecated Polaris token aliases (rc.0 / v0.6 era); use v0.7 spec tokens instead. Run `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` for bulk migration.',
    },
    schema: [],
    messages: {
      deprecatedTailwind:
        'Deprecated Polaris token "{{value}}" — replace with "{{replacement}}". Bulk migration: `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src`.',
      deprecatedCssVar:
        'Deprecated Polaris CSS variable "var({{value}})" — replace with "var({{replacement}})". Removed in v0.8 — bulk migration: `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src`.',
    },
  },
  create(context) {
    function check(value: string, node: Rule.Node) {
      // 1. Tailwind class deprecations (color tokens — `(prefix)-(suffix)`)
      TAILWIND_DEPRECATED_REGEX.lastIndex = 0;
      let tm: RegExpExecArray | null;
      while ((tm = TAILWIND_DEPRECATED_REGEX.exec(value)) !== null) {
        const match = tm[0];
        const suffix = tm[1] ?? '';
        const tailReplacement = DEPRECATED_TAILWIND_TOKENS[suffix];
        if (!suffix || !tailReplacement) continue;
        const replacement = match.replace(suffix, tailReplacement);
        context.report({
          node,
          messageId: 'deprecatedTailwind',
          data: { value: match, replacement },
        });
      }
      // 2. Full-class deprecations (typography + radius — fixed names)
      FULL_CLASS_DEPRECATED_REGEX.lastIndex = 0;
      let fm: RegExpExecArray | null;
      while ((fm = FULL_CLASS_DEPRECATED_REGEX.exec(value)) !== null) {
        const match = fm[0];
        const replacement = DEPRECATED_FULL_CLASSES[match];
        if (!replacement) continue;
        context.report({
          node,
          messageId: 'deprecatedTailwind',
          data: { value: match, replacement },
        });
      }
      // 3. Color ramp step `5` (replaced by `05` for visual alignment)
      RAMP_BARE_5_REGEX.lastIndex = 0;
      let rm: RegExpExecArray | null;
      while ((rm = RAMP_BARE_5_REGEX.exec(value)) !== null) {
        const match = rm[0];
        const replacement = match.replace(/-5$/, '-05');
        context.report({
          node,
          messageId: 'deprecatedTailwind',
          data: { value: match, replacement },
        });
      }
      // 4. CSS variable references
      CSS_VAR_REGEX.lastIndex = 0;
      let cm: RegExpExecArray | null;
      while ((cm = CSS_VAR_REGEX.exec(value)) !== null) {
        const varName = cm[1] ?? '';
        if (!varName) continue;
        const replacement = DEPRECATED_CSS_VARS[varName];
        if (replacement) {
          context.report({
            node,
            messageId: 'deprecatedCssVar',
            data: { value: varName, replacement },
          });
        }
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node.value, node as Rule.Node);
      },
      TemplateElement(node) {
        check(node.value.cooked ?? node.value.raw, node as Rule.Node);
      },
    };
  },
};

export default rule;
