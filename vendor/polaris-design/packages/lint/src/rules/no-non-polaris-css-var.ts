import type { Rule } from 'eslint';

/**
 * Block consumption of non-Polaris CSS variables (`var(--color-copy)`,
 * `var(--app-gradient-nova)`, `var(--my-brand)`) — every CSS variable
 * referenced from JS/TSX/Tailwind classes should be one of the official
 * `--polaris-*` tokens.
 *
 * **Why this exists** — the dashboard re-review (2026-05-08) found a site
 * defining its own alias layer (`--color-copy`, `--color-background`,
 * `--app-gradient-nova-main`, …) that points at non-spec values
 * (`#FAFAFB` instead of `--polaris-background-normal: #FFFFFF`) and bypass
 * the design system silently. This rule catches *consumption* of such
 * aliases at the JS/TSX layer — even when the definition lives in a CSS
 * file that ESLint doesn't see, the consumption shows up here.
 *
 * **Scope of detection**:
 *   - inline `style={{ color: 'var(--color-copy)' }}`
 *   - className strings containing `var(--…)` (Tailwind arbitrary value
 *     `bg-[var(--my-brand)]` — though `no-arbitrary-tailwind` will also
 *     flag the bracket pattern)
 *   - any string literal or template that references `var(--…)`
 *
 * **Allowed**:
 *   - `var(--polaris-*)`              — official tokens
 *   - `var(--tw-*)`                    — Tailwind internal vars
 *   - any custom prefix listed in the rule option `allowedPrefixes`
 *
 * **NOT covered** — global CSS files (`*.css`, `*.scss`). ESLint cannot
 * parse those by default. For full coverage, run the `polaris-audit` CLI
 * which scans CSS files separately, OR add a Stylelint companion plugin
 * (future v0.8 candidate).
 *
 * **Suppressing** — `// eslint-disable-next-line @polaris/no-non-polaris-css-var`
 * for one-off third-party variable usage.
 *
 * **Configuration**:
 * ```js
 * '@polaris/no-non-polaris-css-var': ['error', {
 *   allowedPrefixes: ['--my-org-', '--external-lib-'],  // optional escape hatch
 * }],
 * ```
 */

const VAR_REGEX = /var\(\s*(--[a-zA-Z0-9_-]+)/g;

/** Always-allowed prefixes. */
const ALLOWED_DEFAULT = [
  '--polaris-',  // Polaris tokens
  '--tw-',       // Tailwind internal vars
];

interface RuleOptions {
  allowedPrefixes?: string[];
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow consumption of non-Polaris CSS variables. Every `var(--…)` reference from JS/TSX should target an official `--polaris-*` token.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPrefixes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional `--prefix-` patterns to allow (e.g. third-party libraries).',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      nonPolarisVar:
        'CSS variable "var({{value}})" is not a Polaris token. Use a `--polaris-*` semantic token (e.g. `--polaris-label-normal`, `--polaris-background-normal`). If this is a deliberate third-party variable, add the prefix to `allowedPrefixes` rule option or suppress with `// eslint-disable-next-line @polaris/no-non-polaris-css-var`.',
    },
  },
  create(context) {
    const options = (context.options[0] || {}) as RuleOptions;
    const allowed = new Set([...ALLOWED_DEFAULT, ...(options.allowedPrefixes ?? [])]);

    function isAllowed(varName: string): boolean {
      for (const prefix of allowed) {
        if (varName.startsWith(prefix)) return true;
      }
      return false;
    }

    function check(value: string, node: Rule.Node) {
      VAR_REGEX.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = VAR_REGEX.exec(value)) !== null) {
        const varName = m[1] ?? '';
        if (!varName || isAllowed(varName)) continue;
        context.report({
          node,
          messageId: 'nonPolarisVar',
          data: { value: varName },
        });
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
