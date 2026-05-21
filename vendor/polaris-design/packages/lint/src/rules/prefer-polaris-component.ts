import type { Rule } from 'eslint';

/**
 * Map from native HTML element to its @polaris/ui replacement.
 * Used to flag JSX usage of bare native elements that should be replaced.
 */
const REPLACEMENTS: Record<string, string> = {
  button: 'Button',
  input: 'Input',
  textarea: 'Textarea',
  select: 'Select',
  dialog: 'Dialog',
};

interface RuleOptions {
  /** Allow `<button type="submit">` / `<button type="reset">` (form-control patterns). Default: true. */
  allowFormSubmit?: boolean;
}

function getAttr(node: any, name: string): any {
  if (!node?.attributes) return undefined;
  return node.attributes.find(
    (attr: any) => attr.type === 'JSXAttribute' && attr.name?.name === name
  );
}

function getStringAttrValue(attr: any): string | undefined {
  if (!attr) return undefined;
  const v = attr.value;
  if (!v) return undefined;
  if (v.type === 'Literal' && typeof v.value === 'string') return v.value;
  if (v.type === 'JSXExpressionContainer' && v.expression?.type === 'Literal' && typeof v.expression.value === 'string') {
    return v.expression.value;
  }
  return undefined;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prefer @polaris/ui components over native HTML elements that have a Polaris equivalent (button, input, textarea, select, dialog).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowFormSubmit: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      replace:
        'Native <{{native}}> in feature code is not allowed — use <{{replacement}}> from @polaris/ui instead. (If this is inside @polaris/ui itself or a primitive layer, disable with a per-line eslint-disable comment.)',
    },
  },
  create(context) {
    const options: RuleOptions = (context.options[0] ?? {}) as RuleOptions;
    const allowFormSubmit = options.allowFormSubmit !== false;
    return {
      JSXOpeningElement(node: any) {
        const name = node.name;
        if (!name || name.type !== 'JSXIdentifier') return;
        const native = name.name;
        if (typeof native !== 'string') return;
        const replacement = REPLACEMENTS[native];
        if (!replacement) return;

        if (native === 'button' && allowFormSubmit) {
          const typeAttr = getAttr(node, 'type');
          const typeValue = getStringAttrValue(typeAttr);
          if (typeValue === 'submit' || typeValue === 'reset') return;
        }

        context.report({
          node,
          messageId: 'replace',
          data: { native, replacement },
        });
      },
    };
  },
};

export default rule;
