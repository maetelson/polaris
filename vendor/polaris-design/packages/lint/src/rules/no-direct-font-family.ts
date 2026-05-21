import type { Rule } from 'eslint';

const FONT_FAMILY_CSS_REGEX = /\bfont-family\s*:/i;
const TAILWIND_FONT_ARBITRARY = /\bfont-\[[^\]]+\]/g;

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct font-family declarations; use Polaris font tokens (var(--polaris-font-sans), font-polaris).',
    },
    schema: [],
    messages: {
      jsxFontFamily: 'Direct "fontFamily" inline style is not allowed. Use var(--polaris-font-sans) or the font-polaris Tailwind class.',
      cssFontFamily: 'Direct "font-family" CSS declaration is not allowed. Use var(--polaris-font-sans) or var(--polaris-font-mono).',
      tailwindFontArbitrary: 'Tailwind arbitrary font class "{{value}}" is not allowed. Use the polaris font preset class (font-polaris).',
    },
  },
  create(context) {
    function isPolarisVar(s: string): boolean {
      return /var\(--polaris-font-/.test(s);
    }
    function checkCssText(value: string, node: Rule.Node) {
      if (FONT_FAMILY_CSS_REGEX.test(value) && !isPolarisVar(value)) {
        context.report({ node, messageId: 'cssFontFamily' });
      }
      const tw = value.match(TAILWIND_FONT_ARBITRARY);
      if (tw) {
        for (const match of tw) {
          context.report({ node, messageId: 'tailwindFontArbitrary', data: { value: match } });
        }
      }
    }
    return {
      Property(node) {
        const key = node.key;
        const isFontFamilyKey =
          (key.type === 'Identifier' && key.name === 'fontFamily') ||
          (key.type === 'Literal' && key.value === 'fontFamily');
        if (!isFontFamilyKey) return;
        if (
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          isPolarisVar(node.value.value)
        ) return;
        context.report({ node: node as Rule.Node, messageId: 'jsxFontFamily' });
      },
      Literal(node) {
        if (typeof node.value === 'string') checkCssText(node.value, node as Rule.Node);
      },
      TemplateElement(node) {
        checkCssText(node.value.raw, node as unknown as Rule.Node);
      },
    };
  },
};

export default rule;
