/**
 * Border-radius scale — v0.8 aligned with DESIGN.md spec.
 *
 * Spec scale (8 steps): xs (4) / sm (8) / md★ (12) / lg (16) / xl (24)
 * / 2xl (38) / pill (9999), plus our `2xs` (2) for fine-tuning chrome.
 *
 *   ★ md = 12px — DEFAULT for buttons, cards, modals.
 *
 * v0.7-rc.1 shifted every step up one size relative to rc.0:
 *   sm  6  → 8   (input fields)
 *   md  8  → 12  (button / card / modal default)
 *   lg  12 → 16  (large buttons 54h, section cards)
 *   xl  16 → 24  (강조 modals)
 *   2xl 24 → 38  (bottom sheets)
 *
 * v0.8 removed the deprecated `full` alias — use `pill` (semantically
 * identical, 9999px). Codemod handles the rename:
 * `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src`.
 */
export const radius = {
  '2xs': '2px',
  xs:    '4px',
  sm:    '8px',
  md:    '12px',
  lg:    '16px',
  xl:    '24px',
  '2xl': '38px',
  pill:  '9999px',
} as const;
