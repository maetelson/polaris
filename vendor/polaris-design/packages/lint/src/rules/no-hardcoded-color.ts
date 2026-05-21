import type { Rule } from 'eslint';

const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const COLOR_FN_REGEX = /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\s*\(/g;

const COLOR_PROPS = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderBlockColor',
  'borderInlineColor',
  'outlineColor',
  'fill',
  'stroke',
  'caretColor',
  'accentColor',
  'columnRuleColor',
  'textDecorationColor',
  'textEmphasisColor',
]);

const ALLOWED_VALUE = /^(transparent|currentColor|inherit|initial|unset|revert|revert-layer|none)$/i;
const POLARIS_VAR = /^var\(--polaris-/;

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values; use Polaris design tokens (CSS variables or @polaris/ui token imports).',
    },
    schema: [],
    messages: {
      hex: 'Hardcoded hex color "{{value}}" is not allowed. Use a Polaris token (e.g. var(--polaris-accent-brand-normal), bg-accent-brand-normal class, or import from @polaris/ui/tokens).',
      fn: 'Hardcoded color function "{{value}}" is not allowed. Use a Polaris token instead.',
      colorProp: 'Hardcoded color "{{value}}" on inline style "{{prop}}" is not allowed. Use a Polaris token (e.g. var(--polaris-accent-brand-normal)).',
    },
  },
  create(context) {
    function checkText(value: string, node: Rule.Node) {
      const hexMatches = value.match(HEX_REGEX);
      if (hexMatches) {
        for (const match of hexMatches) {
          context.report({ node, messageId: 'hex', data: { value: match } });
        }
      }
      const fnMatches = value.match(COLOR_FN_REGEX);
      if (fnMatches) {
        for (const match of fnMatches) {
          context.report({ node, messageId: 'fn', data: { value: match.trim() } });
        }
      }
    }

    function getColorPropName(key: any): string | null {
      if (!key) return null;
      const name = key.type === 'Identifier' ? key.name : key.type === 'Literal' ? key.value : null;
      return typeof name === 'string' && COLOR_PROPS.has(name) ? name : null;
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') checkText(node.value, node as Rule.Node);
      },
      TemplateElement(node) {
        checkText(node.value.raw, node as unknown as Rule.Node);
      },
      Property(node) {
        const propName = getColorPropName(node.key);
        if (!propName) return;
        if (node.value.type !== 'Literal' || typeof node.value.value !== 'string') return;
        const v = node.value.value;
        // Hex/rgb already reported via Literal visitor — skip here to avoid double-report.
        if (HEX_REGEX.test(v) || COLOR_FN_REGEX.test(v)) return;
        if (ALLOWED_VALUE.test(v)) return;
        if (POLARIS_VAR.test(v)) return;
        context.report({
          node: node as Rule.Node,
          messageId: 'colorProp',
          data: { value: v, prop: propName },
        });
      },
    };
  },
};

export default rule;
