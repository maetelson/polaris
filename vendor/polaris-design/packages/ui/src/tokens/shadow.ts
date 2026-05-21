/**
 * Shadow scale.
 *
 * v1 spec defines 5 elevation levels: shadow-1 (subtle hover) through
 * shadow-4 (modal) plus a dedicated `ai` purple glow that brings the
 * AI accent into composers / response cards. We keep the v0.6
 * `xs / sm / md / lg` keys (no rename — codemod doesn't need to
 * touch these) and add the `ai` glow as a new key.
 *
 * Dark-mode shadows are slightly heavier opacity since shadows don't
 * carry depth on dark backgrounds the way they do on light.
 */
export type ShadowScale = {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly ai: string;
  readonly focus: string;
};

export const shadow = {
  light: {
    xs: '0 1px 2px rgba(15, 15, 35, 0.06)',
    sm: '0 2px 6px rgba(15, 15, 35, 0.08)',
    md: '0 8px 20px rgba(15, 15, 35, 0.10)',
    lg: '0 20px 40px rgba(15, 15, 35, 0.14)',
    /** Purple glow for AI surfaces (composer, response cards). Layered
     *  shadow with two stops — outer soft halo + inner crisp edge. */
    ai: '0 8px 32px rgba(111, 58, 208, 0.18), 0 2px 6px rgba(111, 58, 208, 0.10)',
    /** Standard 3px focus ring — applies the `--polaris-focus-ring` token
     *  at 35% alpha. Use as `focus-visible:shadow-polaris-focus` on custom
     *  interactive elements to match the system focus outline (WCAG 2.4.7). */
    focus: '0 0 0 3px color-mix(in srgb, var(--polaris-focus-ring) 35%, transparent)',
  },
  dark: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.40)',
    sm: '0 2px 6px rgba(0, 0, 0, 0.45)',
    md: '0 8px 20px rgba(0, 0, 0, 0.50)',
    lg: '0 20px 40px rgba(0, 0, 0, 0.60)',
    /** AI glow stays purple-tinted in dark mode (slightly stronger
     *  alpha so the halo reads against a dark surface). */
    ai: '0 8px 32px rgba(155, 133, 255, 0.30), 0 2px 6px rgba(155, 133, 255, 0.18)',
    /** Dark-mode focus ring — same 3px ring, slightly stronger alpha (45%)
     *  for contrast against dark surfaces. */
    focus: '0 0 0 3px color-mix(in srgb, var(--polaris-focus-ring) 45%, transparent)',
  },
} as const satisfies Record<'light' | 'dark', ShadowScale>;
