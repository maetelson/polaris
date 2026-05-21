/**
 * Spacing scale.
 *
 * Two parallel exports kept in sync:
 *
 * 1. `spacing` — numeric Tailwind-style keys (`'4'` = 16px) for use as
 *    a Tailwind v3 preset `theme.extend.spacing` map. Consumers write
 *    `p-4`, `gap-6`, etc. (Tailwind defaults already give us this; we
 *    keep an explicit map so the v4-theme.css file can mirror it.)
 *
 * 2. `spacingNamed` — v0.7-rc.1 NEW. Spec-aligned named scale per
 *    DESIGN.md §5: `4xs` (2) → `4xl` (64). Use these in JS / TS
 *    contexts where a token name is more meaningful than a number.
 *    Tailwind class form: `p-polaris-md`, `gap-polaris-lg`, etc.
 *
 *    Mapping (named ↔ numeric):
 *      4xs (2)   ↔ '0.5'
 *      3xs (4)   ↔ '1'
 *      2xs (8)   ↔ '2'
 *      xs  (12)  ↔ '3'
 *      sm  (16)  ↔ '4'
 *      md  (20)  ↔ '5'
 *      lg  (24)  ↔ '6'
 *      xl  (32)  ↔ '8'
 *      2xl (40)  ↔ '10'
 *      3xl (48)  ↔ '12'
 *      4xl (64)  ↔ '16'
 */
export const spacing = {
  '0':   '0',
  '0.5': '2px',
  '1':   '4px',
  '1.5': '6px',
  '2':   '8px',
  '2.5': '10px',
  '3':   '12px',
  '3.5': '14px',
  '4':   '16px',
  '5':   '20px',
  '6':   '24px',
  '7':   '28px',
  '8':   '32px',
  '9':   '36px',
  '10':  '40px',
  '12':  '48px',
  '14':  '56px',
  '16':  '64px',
  '20':  '80px',
  '24':  '96px',
} as const;

/** Spec-aligned named spacing tokens (v0.7-rc.1 NEW). */
export const spacingNamed = {
  none: '0',
  '4xs': '2px',
  '3xs': '4px',
  '2xs': '8px',
  xs:    '12px',
  sm:    '16px',
  md:    '20px',
  lg:    '24px',
  xl:    '32px',
  '2xl': '40px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

/**
 * Breakpoints (v0.7-rc.1 — DESIGN.md §9).
 *
 * Spec defines 4 breakpoint tiers (mobile / tablet-v / tablet-h /
 * desktop). The numeric values match Tailwind's defaults (`md` = 768,
 * `lg` = 1024) so consumers can keep writing `md:px-6` etc. — the
 * named export adds semantic clarity.
 */
export const breakpoint = {
  /** Tailwind defaults — keep for backward-compat utility classes. */
  sm:    '640px',
  md:    '768px',   // tablet-v threshold
  lg:    '1024px',  // tablet-h threshold
  xl:    '1280px',  // desktop threshold
  '2xl': '1536px',
  /** v0.7-rc.1 NEW — spec semantic names. */
  mobile:    '360px',
  'tablet-v': '768px',
  'tablet-h': '1024px',
  desktop:   '1280px',
} as const;

export const container = {
  sm:   '640px',
  md:   '768px',
  lg:   '1024px',
  xl:   '1200px',
  full: '100%',
} as const;
