import type { Rule } from 'eslint';

const ARBITRARY_REGEX = /\b[a-z][a-z0-9-]*-\[[^\]]+\]/g;

/**
 * Layout-related Tailwind utilities that legitimately need arbitrary values.
 * Polaris tokens cover color/spacing/radius/shadow/font, but grid template
 * specs and named-line layouts cannot be tokenized — `grid-cols-[1fr_180px_120px]`
 * is the canonical Tailwind way to express that.
 */
const LAYOUT_PREFIXES = [
  'grid-cols',
  'grid-rows',
  'col-span',
  'row-span',
  'col-start',
  'col-end',
  'row-start',
  'row-end',
  'grid-template-columns',
  'grid-template-rows',
  'grid-area',
  'grid-column',
  'grid-row',
  'auto-cols',
  'auto-rows',
] as const;

function isLayoutAllowed(match: string): boolean {
  for (const prefix of LAYOUT_PREFIXES) {
    if (match.startsWith(`${prefix}-[`)) return true;
  }
  return false;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind arbitrary values; use Polaris token-based classes (e.g. bg-accent-brand-normal, p-4) instead. Layout utilities like grid-cols-[...] are exempt.',
    },
    schema: [],
    messages: {
      arbitrary: 'Tailwind arbitrary value "{{value}}" is not allowed. Use a token-based class (bg-accent-brand-normal, text-label-normal, p-4 or p-polaris-md, rounded-polaris-md, etc.) instead.',
    },
  },
  create(context) {
    function check(value: string, node: Rule.Node) {
      const matches = value.match(ARBITRARY_REGEX);
      if (matches) {
        for (const match of matches) {
          if (isLayoutAllowed(match)) continue;
          context.report({ node, messageId: 'arbitrary', data: { value: match } });
        }
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node.value, node as Rule.Node);
      },
      TemplateElement(node) {
        check(node.value.raw, node as unknown as Rule.Node);
      },
    };
  },
};

export default rule;
