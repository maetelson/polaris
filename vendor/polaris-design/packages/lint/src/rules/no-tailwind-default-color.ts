import type { Rule } from 'eslint';

/**
 * Block Tailwind's built-in color palette utilities (`text-slate-600`,
 * `bg-rose-50`, `border-blue-200`, …) — every color utility should resolve
 * to a Polaris semantic token.
 *
 * **Why this exists** — Tailwind ships with 22 built-in color families
 * (slate / gray / zinc / neutral / stone / red / orange / amber / yellow /
 * lime / green / emerald / teal / cyan / sky / blue / indigo / violet /
 * purple / fuchsia / pink / rose). Polaris's preset adds semantic tokens
 * (`label-*`, `state-*`, `accent-brand-*`, etc.) but does not remove the
 * defaults — so `text-slate-600` still compiles, silently, and bypasses
 * the design system. The dashboard re-review (2026-05-08) caught a real
 * site using `text-slate-*`, `bg-rose-*`, `border-slate-*` directly while
 * loading Polaris tokens — the result is a *visually wrong* design system
 * adoption.
 *
 * **What it catches** — any utility prefix from Tailwind's color-aware
 * list (`text/bg/border/ring/outline/divide/placeholder/caret/accent/
 * decoration/shadow/from/via/to/fill/stroke`) followed by one of the 22
 * default palettes followed by a numeric shade. Modifier prefixes
 * (`hover:`, `dark:`, `md:`, group-hover, …) precede the utility and are
 * automatically tolerated since the regex anchors on the utility itself.
 *
 * **Suggested replacements** are reported in the message — see
 * `SEMANTIC_HINT` for the most common mappings (gray → label, red →
 * state-error, etc.). Auto-fix is intentionally NOT implemented — the
 * exact shade choice (e.g. `slate-600` vs `slate-700`) requires human
 * judgment about which Polaris semantic role applies.
 *
 * **Suppressing** — for one-off cases where Tailwind's palette is
 * intentional (e.g. third-party brand colors not yet in Polaris):
 *
 *   // eslint-disable-next-line @polaris/no-tailwind-default-color
 *   <div className="text-rose-500" />
 */

// All 22 Tailwind built-in color family names (Tailwind v3 defaults).
const TAILWIND_PALETTES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose',
];

/**
 * Tailwind palette names that **Polaris extends with its own 10-step ramp**
 * (`05/10/20/30/40/50/60/70/80/90`). For these palettes, Polaris-owned
 * shade names (1-2 digit) are documented as official primitive tokens
 * (README §85, AGENTS.md §121: `bg-blue-50`, `bg-purple-50`,
 * `bg-green-30`, `bg-gray-10`, `from-purple-40`). Allow 1-2 digit shades;
 * 3-digit shades (100/200/.../900) fall through to Tailwind defaults
 * because Polaris ramps stop at 90 — those are still flagged.
 *
 * **NOT included even though Polaris extends them under the same name**:
 *   - `neutral` — the Polaris neutral ramp is the *deprecated rc.0 palette*
 *     (boring purple-tinted gray, e.g. `--polaris-neutral-600 = #6E6E84`).
 *     v0.7 spec replaces it with `label-*` / `fill-*` semantic tokens.
 *     `bg-neutral-100` should be flagged regardless of shade.
 */
const POLARIS_OWNED_PALETTES = new Set([
  'blue', 'cyan', 'gray', 'green', 'orange',
  'purple', 'red', 'violet', 'yellow',
]);

// Tailwind utility prefixes that take a color value.
const COLOR_UTILITIES = [
  'text', 'bg', 'border', 'ring', 'outline', 'divide', 'placeholder',
  'caret', 'accent', 'decoration', 'shadow',
  'from', 'via', 'to',                   // gradients
  'fill', 'stroke',                      // SVG
];

// Polaris semantic replacement hints — best-effort, not exhaustive.
// The user picks the closest semantic role; this just nudges them.
const SEMANTIC_HINT: Record<string, string> = {
  // Grays → label.* (text) / fill.* (surface) / line.* (border)
  slate:   'label-* / fill-* / line-*',
  gray:    'label-* / fill-* / line-*',
  zinc:    'label-* / fill-* / line-*',
  neutral: 'label-* / fill-* / line-*',
  stone:   'label-* / fill-* / line-*',
  // Status colors → state.*
  red:     'state-error / state-error-bg',
  rose:    'state-error / state-error-bg',
  pink:    'state-error / state-error-bg',
  orange:  'state-warning / state-warning-bg',
  amber:   'state-warning / state-warning-bg',
  yellow:  'state-warning / state-warning-bg',
  green:   'state-success / state-success-bg',
  emerald: 'state-success / state-success-bg',
  lime:    'state-success / state-success-bg',
  teal:    'state-success / state-success-bg',
  // Blues → brand or info
  cyan:    'state-info / accent-brand-*',
  sky:     'state-info / accent-brand-*',
  blue:    'accent-brand-normal / state-info',
  indigo:  'accent-brand-normal',
  // Purples → AI tokens
  violet:  'ai-normal / ai-strong (NOVA only)',
  purple:  'ai-normal / ai-strong (NOVA only)',
  fuchsia: 'ai-normal (NOVA only)',
};

const PALETTE_GROUP = TAILWIND_PALETTES.join('|');
const UTIL_GROUP = COLOR_UTILITIES.join('|');

/**
 * Match e.g. `text-slate-600`, `bg-rose-50`, `bg-blue-50`, `hover:text-slate-900`.
 *
 * Word boundary on the left lets modifier prefixes pass through (`hover:`,
 * `dark:`, `group-hover:`, etc.). The right side requires a digit shade so
 * `text-slate` (no shade) — which Tailwind doesn't compile anyway — is
 * not flagged.
 *
 * Captures: 1=palette name, 2=shade digits (used to distinguish
 * Polaris-owned 1-2 digit shades from 3-digit Tailwind defaults).
 */
const TAILWIND_DEFAULT_COLOR_REGEX = new RegExp(
  `\\b(?:${UTIL_GROUP})-(${PALETTE_GROUP})-(\\d+)(?:/\\d+)?\\b`,
  'g'
);

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind built-in color palette utilities (slate-*, rose-*, etc.); use Polaris semantic tokens (label-*, state-*, accent-brand-*) instead.',
    },
    schema: [],
    messages: {
      tailwindDefault:
        'Tailwind default-palette color "{{value}}" bypasses Polaris semantic tokens. Use {{hint}} instead. Suppress with `// eslint-disable-next-line @polaris/no-tailwind-default-color` if a Tailwind palette is intentional (e.g. third-party brand color).',
    },
  },
  create(context) {
    function check(value: string, node: Rule.Node) {
      let m: RegExpExecArray | null;
      // Reset lastIndex — regex has the `g` flag and is module-scoped.
      TAILWIND_DEFAULT_COLOR_REGEX.lastIndex = 0;
      while ((m = TAILWIND_DEFAULT_COLOR_REGEX.exec(value)) !== null) {
        const match = m[0];
        const palette = m[1] ?? '';
        const shade = m[2] ?? '';
        // Polaris-owned palettes (blue/purple/green/gray/...) extend
        // Tailwind with a 10-step ramp at shades 05-90 (1-2 digits).
        // Those are documented official tokens — not flagged.
        // 3+ digit shades (100/200/.../900) on the same palette name
        // fall through to Tailwind defaults — flagged.
        if (POLARIS_OWNED_PALETTES.has(palette) && shade.length <= 2) continue;
        // Special case for `neutral` — Polaris extends it but with the
        // *deprecated rc.0 palette* (purple-tinted gray). Hint at the
        // semantic v0.7 replacement instead of generic "a Polaris token".
        const hint = palette === 'neutral'
          ? 'label-* / fill-* / line-* (rc.0 neutral ramp는 deprecated)'
          : (SEMANTIC_HINT[palette] ?? 'a Polaris semantic token');
        context.report({
          node,
          messageId: 'tailwindDefault',
          data: { value: match, hint },
        });
      }
    }
    return {
      Literal(node: Rule.Node) {
        if ('value' in node && typeof node.value === 'string') check(node.value, node);
      },
      TemplateElement(node: Rule.Node) {
        if ('value' in node && typeof node.value === 'object' && node.value && 'cooked' in node.value) {
          const v = node.value as { cooked?: string | null; raw?: string };
          check(v.cooked ?? v.raw ?? '', node);
        }
      },
    };
  },
};

export default rule;
