/**
 * Typography scale — v0.8 aligned with DESIGN.md spec.
 *
 * Spec scale (11 levels, desktop):
 *   Display    40px / 700 / 1.4
 *   Title      32px / 700 / 1.4
 *   Heading1   28px / 700 / 1.4
 *   Heading2   24px / 700 / 1.4
 *   Heading3   20px / 700 / 1.4
 *   Heading4   18px / 700 / 1.4
 *   Body1      16px / 400 / 1.5
 *   Body2      14px / 400 / 1.5
 *   Body3      13px / 400 / 1.5
 *   Caption1   12px / 700 / 1.3
 *   Caption2   11px / 700 / 1.3
 *
 * Mobile scale (max-width: 767px) drops one step:
 *   Display 40→32 / Title 32→28 / Heading1 28→24 / Heading2 24→20 /
 *   Heading3 20→18 / Heading4 18→16 / Body1 16→14 / Body2 14→13.
 *   Body3 / Caption1 / Caption2 unchanged.
 *
 * Principles (per DESIGN.md §3):
 * - **No letter-spacing**: Pretendard's optical metrics are already
 *   tuned. rc.0's `-0.002em` on body and `-0.020em` on display were
 *   removed.
 * - **Weight by role**: 700 (Bold) for headings + captions, 400
 *   (Regular) for body, 500 (Medium) reserved for UI labels.
 * - **Line-height by role**: 1.4 headings, 1.5 body, 1.3 captions.
 *
 * Legacy keys (rc.0 `h1`-`h5` / `body` / `bodySm` / `detail` / `meta` /
 * `tiny` / v0.6 `displayLg` / `displayMd` / `headingLg` / `headingMd` /
 * `headingSm` / `bodyLg` / `caption`) were removed in v0.8. Run
 * `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` to migrate.
 */
export const fontFamily = {
  sans: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif',
  mono: '"JetBrains Mono", "D2Coding", ui-monospace, monospace',
} as const;

export const fontWeight = {
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const;

export type TextStyle = {
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
};

/**
 * Spec-aligned text styles. Names match DESIGN.md and the design team's
 * Figma library exactly.
 */
export const textStyle = {
  /** Display 40 / 700 / 1.4 — hero / marketing headlines. */
  display:  { fontSize: '40px', lineHeight: '56px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
  /** Title 32 / 700 / 1.4 — page-level titles. */
  title:    { fontSize: '32px', lineHeight: '44px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
  /** Heading1 28 / 700 / 1.4 — section headings. */
  heading1: { fontSize: '28px', lineHeight: '40px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
  /** Heading2 24 / 700 / 1.4 — sub-section headings. */
  heading2: { fontSize: '24px', lineHeight: '34px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
  /** Heading3 20 / 700 / 1.4 — card titles, group headers. */
  heading3: { fontSize: '20px', lineHeight: '28px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
  /** Heading4 18 / 700 / 1.4 — tight UI headings. */
  heading4: { fontSize: '18px', lineHeight: '26px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
  /** Body1 16 / 400 / 1.5 — standard body copy. */
  body1:    { fontSize: '16px', lineHeight: '24px', fontWeight: fontWeight.regular, letterSpacing: '0' },
  /** Body2 14 / 400 / 1.5 — secondary body, list items. */
  body2:    { fontSize: '14px', lineHeight: '21px', fontWeight: fontWeight.regular, letterSpacing: '0' },
  /** Body3 13 / 400 / 1.5 — dense UI text, tooltips. */
  body3:    { fontSize: '13px', lineHeight: '20px', fontWeight: fontWeight.regular, letterSpacing: '0' },
  /** Caption1 12 / 700 / 1.3 — labels, badges, tags. */
  caption1: { fontSize: '12px', lineHeight: '16px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
  /** Caption2 11 / 700 / 1.3 — micro labels, timestamps. */
  caption2: { fontSize: '11px', lineHeight: '14px', fontWeight: fontWeight.bold,    letterSpacing: '0' },
} as const satisfies Record<string, TextStyle>;
