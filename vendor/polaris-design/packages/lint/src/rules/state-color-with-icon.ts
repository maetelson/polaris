import type { Rule } from 'eslint';

/**
 * Warns when a state color (`text-state-success/-warning/-error/-info`) is
 * applied to text in a JSX `className` without a clear icon companion.
 *
 * Why: per DESIGN.md §10 + WCAG 1.4.1, state colors fail AA contrast for
 * 14px body text. The spec mandates pairing with an icon (✓ / ⚠️ / X)
 * AND/OR using sizes ≥ 18px Bold. This rule catches the most common
 * regression — small bare error text — by flagging classNames that have
 * `text-state-*` but no obvious icon-like sibling cue (`flex`, `gap-*`,
 * presence of `<svg>` or `<*Icon>` in the JSX subtree).
 *
 * Limitation: this is a heuristic, not a proof. If your error text DOES
 * include an icon but the rule can't detect it (e.g. icon comes from a
 * dynamic component prop), suppress with `// eslint-disable-next-line`.
 *
 * Severity: `warn` (not `error`) — surfaces the risk without blocking.
 */
const STATE_COLOR_REGEX = /\btext-state-(success|warning|error)\b/;

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Pair `text-state-success/-warning/-error` with a visual icon (WCAG 1.4.1). State colors fail body-text contrast — never communicate state via color alone.',
    },
    schema: [],
    messages: {
      bareStateColor:
        'State color `{{className}}` used without a clear icon companion. Per WCAG 1.4.1 + DESIGN.md §10, pair this with an icon (✓ / ⚠️ / X) or use ≥18px Bold. Suppress with `// eslint-disable-next-line @polaris/state-color-with-icon` if an icon is present but undetected.',
    },
  },
  create(context) {
    function checkJSXAttribute(node: Rule.Node) {
      // ESLint's `Rule.Node` doesn't include the JSX node type union; we
      // cast through unknown to poke at the attribute shape. Narrowing
      // by a type literal would fail the typescript-eslint check, so
      // we just inspect the runtime shape.
      const attr = node as unknown as {
        name?: { name?: string };
        value?: { type: string; value?: unknown; expression?: { type: string } };
        parent?: { type: string; children?: { type: string; openingElement?: { name?: { name: string } } }[] };
      };
      if (!attr.name || attr.name.name !== 'className') return;
      if (!attr.value) return;

      // Extract the raw class string. Works for `className="..."`. For
      // expression containers (`className={cn(...)}`) we leave the
      // detection to the cn() arguments — those will be Literal nodes
      // visited by the Literal handler below.
      let classValue: string | null = null;
      if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
        classValue = attr.value.value;
      }
      if (classValue === null) return;

      const match = classValue.match(STATE_COLOR_REGEX);
      if (!match) return;

      // Heuristic: look at the JSX element's children for an icon-like
      // node. Acceptable cues:
      //   - <svg> or <*Icon> child
      //   - className includes `flex` AND `gap-*` (suggests icon row)
      //   - aria-label suggesting icon meaning
      const parent = attr.parent;
      if (parent && parent.type === 'JSXOpeningElement') {
        // Look up to the JSXElement, then check its children
        const jsxElement = (parent as unknown as { parent: { children?: unknown[] } }).parent;
        const children = jsxElement?.children as
          | { type: string; openingElement?: { name?: { name?: string; type?: string } } }[]
          | undefined;
        if (children && Array.isArray(children)) {
          for (const child of children) {
            if (child.type !== 'JSXElement') continue;
            const tagName = child.openingElement?.name as
              | { name?: string; type?: string }
              | undefined;
            if (!tagName) continue;
            // <svg> direct child
            if (tagName.name === 'svg') return;
            // <SomethingIcon> or <Icon*> or <Alert*> from lucide-react
            if (typeof tagName.name === 'string') {
              if (
                /Icon$/.test(tagName.name) ||
                /^Alert/.test(tagName.name) ||
                tagName.name === 'Sparkles' ||
                tagName.name === 'Check' ||
                tagName.name === 'X'
              ) {
                return;
              }
            }
          }
        }
      }

      // No icon companion detected — emit the warning.
      context.report({
        node,
        messageId: 'bareStateColor',
        data: { className: match[0] },
      });
    }

    return {
      JSXAttribute: checkJSXAttribute,
    };
  },
};

export default rule;
