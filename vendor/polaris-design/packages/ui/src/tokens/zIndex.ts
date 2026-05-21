/**
 * Z-index scale (v0.7-rc.1 NEW — DESIGN.md §6).
 *
 * Six tiers covering everything that floats above the document flow.
 * Centralized so multiple components don't fight over the same z layer.
 *
 *   base       0    Normal content
 *   dropdown   100  Dropdowns, tooltips, popovers
 *   sticky     200  Sticky headers, pinned tabs
 *   dim        300  Dim overlay (modal backdrop)
 *   modal      400  Modal, popup, bottom sheet
 *   toast      500  Toast notifications (always topmost)
 *
 * Tailwind class form: `z-polaris-modal`, `z-polaris-toast`, etc.
 * Avoid arbitrary `z-[999]` values — extend this scale instead.
 */
export const zIndex = {
  base:     0,
  dropdown: 100,
  sticky:   200,
  dim:      300,
  modal:    400,
  toast:    500,
} as const;

export type ZIndexLevel = keyof typeof zIndex;
