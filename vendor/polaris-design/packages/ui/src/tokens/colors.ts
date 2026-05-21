export type ColorMode = 'light' | 'dark';
export type ColorPair = { readonly light: string; readonly dark: string };

// Light values from "Polaris Office Design System v1 (2026.05)" spec
// (PO Blue / Sheet Green / Slide Orange / PDF Red / AI Purple). Dark
// values are kept from the v0.6 best-effort scheme — design team has
// not supplied dark-mode hex yet, and the v0.6 dark values still pass
// our contrast checks against the new light values.
export const brandPalette = {
  blue:   { light: '#1D7FF9', dark: '#5C9FFF' },
  green:  { light: '#51B41B', dark: '#3FCB72' },
  orange: { light: '#FD8900', dark: '#FF8F4D' },
  red:    { light: '#F95C5C', dark: '#FF6962' },
  purple: { light: '#6F3AD0', dark: '#9B85FF' },
} as const satisfies Record<string, ColorPair>;

export const fileType = {
  docx: brandPalette.blue,
  hwp:  brandPalette.blue,
  xlsx: brandPalette.green,
  pptx: brandPalette.orange,
  pdf:  brandPalette.red,
} as const satisfies Record<string, ColorPair>;

export const neutral = {
  '0':    { light: '#FFFFFF', dark: '#0B0B12' },
  '50':   { light: '#FAFAFB', dark: '#131320' },
  '100':  { light: '#F4F4F7', dark: '#1B1B2A' },
  '200':  { light: '#E8E8EE', dark: '#232336' },
  '300':  { light: '#D5D5DE', dark: '#2D2D45' },
  '400':  { light: '#B5B5C4', dark: '#4A4A66' },
  '500':  { light: '#8C8CA0', dark: '#6B6B85' },
  '600':  { light: '#6E6E84', dark: '#8B8BA3' },
  '700':  { light: '#4F4F63', dark: '#B4B4C8' },
  '800':  { light: '#2F2F40', dark: '#D5D5DE' },
  '900':  { light: '#1A1A26', dark: '#EDEDF2' },
  '1000': { light: '#0B0B12', dark: '#FFFFFF' },
} as const satisfies Record<string, ColorPair>;

/**
 * Surface elevation tokens (v0.8 — pruned).
 *
 * v0.8 removed `canvas` / `raised` / `sunken` / `border` / `borderStrong`
 * — they're replaced by the v0.7-spec semantic groups:
 *   canvas       → background.base
 *   raised       → layer.surface
 *   sunken       → fill.neutral
 *   border       → line.neutral
 *   borderStrong → line.normal
 *
 * The remaining elevation tier (added v0.7.5) lives on top of
 * `layer.surface`:
 *
 *   background.base
 *     ← layer.surface (cards, panels)
 *     ← surface.popover (menus, dropdowns, comboboxes)
 *     ← surface.modal   (dialogs, drawers, sheets — top of stack)
 *
 * NOTE on `layer.overlay` vs `surface.modal`:
 *   - `layer.overlay`     = dimmed scrim BEHIND a modal (rgba black ~50%)
 *   - `surface.modal`     = the modal's PANEL surface itself
 *   They're not interchangeable.
 */
export const surface = {
  /** Popover / menu / dropdown / combobox panel. Above `layer.surface`, below `modal`.
   *  Light = white (depth via shadow); dark = a tier brighter than `layer.surface`. */
  popover: { light: neutral['0'].light, dark: '#232336' },
  /** Modal / dialog / drawer / sheet panel. Top of the elevation stack.
   *  Light = white; dark = the brightest surface tier. */
  modal:   { light: neutral['0'].light, dark: '#2D2D45' },
} as const satisfies Record<string, ColorPair>;

/* ================================================================== *
 * 10-step ramps (v1 spec, 2026.05)
 *
 * Each brand color ships as a full 10-step ramp (05 / 10 / 20 / 30 /
 * 40 / 50 / 60 / 70 / 80 / 90). Step 50 matches `brandPalette.<name>.light`
 * — both are exported so consumers can pick whichever fits their
 * context (single-token alias for simple buttons, ramp for chart
 * categories or hover/pressed nuances).
 *
 * Light mode only — design team hasn't supplied a dark-mode ramp yet.
 *
 * v0.8 removed the `'5'` (no leading zero) deprecated alias on every
 * ramp — codemod-v08 rewrites `bg-blue-5` / `bluePalette['5']` to the
 * `'05'` form.
 * ================================================================== */

/**
 * 10-step ramp shape per v1 spec (`primitive-color-palette` reference).
 * Steps run `05` (lightest tint) → `90` (darkest shade). The leading-zero
 * `'05'` matches the spec sheet exactly so search/copy from the design
 * artefact lands on the right key.
 */
export type Ramp10 = Readonly<{
  '05': string;
  '10': string;
  '20': string;
  '30': string;
  '40': string;
  '50': string;
  '60': string;
  '70': string;
  '80': string;
  '90': string;
}>;

/** PO Blue — primary brand color, also the Word file-type accent. */
export const bluePalette = {
  '05': '#E8F2FE',
  '10': '#D9EAFF',
  '20': '#BBD8FD',
  '30': '#8EBFFC',
  '40': '#60A5FA',
  '50': '#1D7FF9',
  '60': '#186CD3',
  '70': '#1458AD',
  '80': '#0F4588',
  '90': '#0B3263',
} as const satisfies Ramp10;

/** PO Dark Blue — BI / corporate communication only (not for UI). */
export const darkBluePalette = {
  '05': '#E5ECF8',
  '10': '#D1DFF7',
  '20': '#B2C7EA',
  '30': '#7FA2DC',
  '40': '#4C7DCE',
  '50': '#0046B9',
  '60': '#003B9D',
  '70': '#003081',
  '80': '#002665',
  '90': '#001C4A',
} as const satisfies Ramp10;

/** Sheet — XLSX file-type accent. Also `--state-success` source. */
export const greenPalette = {
  '05': '#EDF7E8',
  '10': '#DCF1D1',
  '20': '#CAE8BA',
  '30': '#A8D98D',
  '40': '#85CA5F',
  '50': '#51B41B',
  '60': '#449916',
  '70': '#387D12',
  '80': '#2C620E',
  '90': '#20480A',
} as const satisfies Ramp10;

/** Slide — PPTX file-type accent. Also `--state-warning` source. */
export const orangePalette = {
  '05': '#FEF3E5',
  '10': '#FDE5C8',
  '20': '#FEDBB2',
  '30': '#FEC47F',
  '40': '#FDAC4C',
  '50': '#FD8900',
  '60': '#D77400',
  '70': '#B05F00',
  '80': '#8A4B00',
  '90': '#653600',
} as const satisfies Ramp10;

/** PDF — file-type accent. Also `--state-error` source. */
export const redPalette = {
  '05': '#FEEEEE',
  '10': '#FFE3E3',
  '20': '#FDCECE',
  '30': '#FCADAD',
  '40': '#FA8C8C',
  '50': '#F95C5C',
  '60': '#D34E4E',
  '70': '#AD4040',
  '80': '#883232',
  '90': '#632424',
} as const satisfies Ramp10;

/** AI Purple — AI / NOVA surfaces only. Never use on general product UI. */
export const purplePalette = {
  '05': '#F5F1FD',
  '10': '#EDE5FE',
  '20': '#E0D1FF',
  '30': '#C6A9FF',
  '40': '#9D75EC',
  '50': '#6F3AD0',
  '60': '#602BC1',
  '70': '#511BB2',
  '80': '#3E0F8D',
  '90': '#20075C',
} as const satisfies Ramp10;

/* ================================================================== *
 * Supplementary palettes (v1 spec, 2026.05)
 *
 * These are NOT brand colors — they're the secondary palette the
 * design team reserves for charts, plan badges, file-type extensions,
 * notes, and other accents that need their own hue without diluting
 * the five brand colors. Use sparingly.
 * ================================================================== */

/** Sky Blue — plan badges and accents (lighter, friendlier than PO Blue). */
export const skyBluePalette = {
  '05': '#E9F7FD',
  '10': '#D6F0FE',
  '20': '#BFE7FB',
  '30': '#95D7F9',
  '40': '#6AC7F7',
  '50': '#2BAFF4',
  '60': '#2494CF',
  '70': '#1E7AAA',
  '80': '#176085',
  '90': '#114661',
} as const satisfies Ramp10;

/** Blue (supplementary) — links and accents in dense UIs. Distinct from
 *  PO Blue (`bluePalette`); reach for this when PO Blue would visually
 *  conflict with brand-strong elements on the same surface. */
export const blueSupplementaryPalette = {
  '05': '#EDEEFC',
  '10': '#DEE0FF',
  '20': '#C9CDF7',
  '30': '#A5ADF2',
  '40': '#818CEC',
  '50': '#4C5BE5',
  '60': '#404DC2',
  '70': '#353F9F',
  '80': '#29317D',
  '90': '#1E245B',
} as const satisfies Ramp10;

/** Violet — supplementary purple for charts and tags. Distinct from
 *  AI Purple (`purplePalette`); never use Violet for AI / NOVA. */
export const violetPalette = {
  '05': '#EEECF9',
  '10': '#E0DAF8',
  '20': '#CEC7ED',
  '30': '#ADA3E2',
  '40': '#8C7ED7',
  '50': '#5C47C6',
  '60': '#4E3CA8',
  '70': '#40318A',
  '80': '#32266C',
  '90': '#241C4F',
} as const satisfies Ramp10;

/** Cyan — image format and media-related accents. */
export const cyanPalette = {
  '05': '#E6F9FD',
  '10': '#D2F4FA',
  '20': '#ABEBF6',
  '30': '#66DAF2',
  '40': '#33CDED',
  '50': '#00BADB',
  '60': '#0095B1',
  '70': '#00758E',
  '80': '#005C70',
  '90': '#003F4D',
} as const satisfies Ramp10;

/** Yellow — note format and highlight colors. Reserved: do NOT use
 *  for `--state-warning` (orange owns that role). */
export const yellowPalette = {
  '05': '#FFFAEB',
  '10': '#FCEFCA',
  '20': '#FAE6AF',
  '30': '#FCDA7B',
  '40': '#F8C22E',
  '50': '#F2B50B',
  '60': '#D79E00',
  '70': '#B08100',
  '80': '#8A6500',
  '90': '#654A00',
} as const satisfies Ramp10;

/** Gray ramp — UI backbone (text, lines, surfaces, interaction states).
 *  9 steps, 10 (lightest) → 90 (darkest). Note this scale uses different
 *  step numbers from the legacy `neutral` 12-step scale — both exports
 *  coexist; `grayRamp` matches the v1 design spec, `neutral` is kept for
 *  backward compatibility. New code should prefer `grayRamp`. */
export const grayRamp = {
  '10': '#F7F8F9',
  '20': '#F2F4F6',
  '30': '#E8EBED',
  '40': '#C9CDD2',
  '50': '#B3B8BD',
  '60': '#9EA4AA',
  '70': '#72787F',
  '80': '#454C53',
  '90': '#26282B',
} as const satisfies Record<string, string>;

/* ================================================================== *
 * v1 spec semantic tokens (2026.05)
 *
 * Aligned with the design team's `DESIGN.md` reference. Dark-mode hex
 * uses the spec's grayscale-centered palette.
 *
 * Token groups in spec order:
 *   label.*         text + icon foreground
 *   background.*    page-level base, disabled
 *   layer.*         surface/overlay
 *   interaction.*   hover, pressed
 *   fill.*          tinted surfaces (neutral / normal / strong)
 *   line.*          borders + dividers (neutral / normal / strong / disabled)
 *   accentBrand.*   PO Blue brand accent + bg variants
 *   accentAction.*  Black "action" button
 *   focus.*         focus-ring
 *   staticColors.*  mode-invariant white/black
 *   state.*         success / warning / error / info / new + bg variants
 *
 * v0.8 removed legacy groups: `text.*`, `surface.{canvas,raised,sunken,
 * border,borderStrong}`, `brand.*`, `status.*`, `primary.*`, and the
 * deprecated `background.{normal,alternative}` keys. Codemod
 * `polaris-codemod-v08` rewrites consumers; lint rule
 * `no-deprecated-polaris-token` guards against regressions.
 * ================================================================== */

/** Text + icon foreground tokens (spec: "label"). */
export const label = {
  /** 1차 텍스트 (primary copy, headlines). */
  normal:      { light: '#26282B', dark: '#D8D8D8' },
  /** 본문 / 2차 (body copy, secondary text). */
  neutral:     { light: '#454C53', dark: '#9E9E9E' },
  /** 3차 (tertiary, captions). 14px 본문 4.46:1 (15px+ 권장). */
  alternative: { light: '#72787F', dark: '#797979' },
  /** Placeholder, hint (assistive). */
  assistive:   { light: '#9EA4AA', dark: '#6B6B6B' },
  /** 진한 배경 위 텍스트 (on dark / on-brand surfaces). */
  inverse:     { light: '#FFFFFF', dark: '#232323' },
  /** Disabled label / icon. */
  disabled:    { light: '#C9CDD2', dark: '#595959' },
} as const satisfies Record<string, ColorPair>;

/** Page-level background tokens (spec: "background").
 *  v0.8 removed the deprecated `normal` / `alternative` keys — codemod
 *  rewrites them to `base` / `fill.neutral` respectively. */
export const background = {
  /** Page / canvas root background. */
  base:     { light: '#FFFFFF', dark: '#232323' },
  /** Disabled button / input background. */
  disabled: { light: '#F2F4F6', dark: '#2D2D2D' },
} as const satisfies Record<string, ColorPair>;

/** Layer tokens (spec: "layer"). Separates raised surfaces (cards,
 *  dialogs, dropdowns) from the page background. */
export const layer = {
  /** Cards, dialogs, dropdowns, popovers. */
  surface: { light: '#FFFFFF', dark: '#282828' },
  /** Modal / popup dim layer. Same hex in both modes per spec. */
  overlay: { light: 'rgba(0, 0, 0, 0.5)', dark: 'rgba(0, 0, 0, 0.5)' },
} as const satisfies Record<string, ColorPair>;

/** Interaction state tokens (spec: "interaction"). */
export const interaction = {
  /** Hover surface. */
  hover:   { light: '#F2F4F6', dark: '#4A4A4A' },
  /** Pressed / active surface. */
  pressed: { light: '#E8EBED', dark: '#595959' },
} as const satisfies Record<string, ColorPair>;

/** Fill tokens (spec: "fill") — three intensities of tinted surfaces. */
export const fill = {
  /** Base tinted surface (sidebars, chrome wells). */
  neutral: { light: '#F7F8F9', dark: '#2D2D2D' },
  /** Generic component bg (Tertiary buttons, filled chips). */
  normal:  { light: '#F2F4F6', dark: '#3B3B3B' },
  /** Emphasized fill (selected items, strong surfaces). */
  strong:  { light: '#E8EBED', dark: '#595959' },
} as const satisfies Record<string, ColorPair>;

/** Border / divider tokens (spec: "line") — four intensities. */
export const line = {
  /** 약한 구분선 (list separators, subtle dividers). */
  neutral:  { light: '#E8EBED', dark: '#3B3B3B' },
  /** 일반 보더 (inputs, default borders). */
  normal:   { light: '#C9CDD2', dark: '#595959' },
  /** Strong divider, prominent borders. */
  strong:   { light: '#B3B8BD', dark: '#6B6B6B' },
  /** Disabled border. */
  disabled: { light: '#F2F4F6', dark: '#2D2D2D' },
} as const satisfies Record<string, ColorPair>;

/** Brand accent tokens (spec: "accent.brand"). PO Blue. */
export const accentBrand = {
  /** PO Blue — 기본 강조색 (CTAs, links, focus). 3.85:1 — 14px 이하 본문 단독 사용 금지. */
  normal:       { light: '#1D7FF9', dark: '#1D7FF9' },
  /** PO Blue strong — hover / pressed. */
  strong:       { light: '#1458AD', dark: '#60A5FA' },
  /** Secondary button background (brand tint). */
  bg:           { light: '#D9EAFF', dark: '#0B3263' },
  /** Secondary button hover. */
  bgHover:      { light: '#BBD8FD', dark: '#0F4588' },
  /** Subtle brand-tinted hover/active background. Used by 12+ components
   *  (Sidebar, Pagination, Calendar, Drawer, Command, Badge, Select,
   *  DropdownMenu, FileCard, Ribbon, …) for hover/active row indication.
   *  Lighter than `bg` — sits between `layer.surface` and `bg`. */
  normalSubtle: { light: '#E8F2FE', dark: '#1A2238' },
} as const satisfies Record<string, ColorPair>;

/** Action accent tokens (spec: "accent.action"). Black variant for
 *  high-contrast "Primary Dark" buttons (e.g. final submit, "Get
 *  started" CTAs). Auto-inverts in dark mode. */
export const accentAction = {
  normal: { light: '#000000', dark: '#FFFFFF' },
  strong: { light: '#454C53', dark: '#F2F4F6' },
} as const satisfies Record<string, ColorPair>;

/** Focus ring (spec: "focus"). Same hex both modes (lighter than
 *  accent.brand to read on either light or dark surfaces). */
export const focus = {
  ring: { light: '#60A5FA', dark: '#60A5FA' },
} as const satisfies Record<string, ColorPair>;

/** Mode-invariant colors (spec: "static").
 *  Use when a color should NEVER swap with the theme — e.g. a brand
 *  logo on a colored background, a "white" send button on AI Purple. */
export const staticColors = {
  white: { light: '#FFFFFF', dark: '#FFFFFF' },
  black: { light: '#000000', dark: '#000000' },
} as const satisfies Record<string, ColorPair>;

/** State tokens (spec: "state") — success / warning / error / info /
 *  new. Includes `bg` variants and the `new` notification dot. */
export const state = {
  /** Only for "new" notification dots. NOT for error UI. */
  new:        { light: '#FB4949', dark: '#FB4949' },
  /** Success text + icon. 2.66:1 — body 단독 사용 금지, 아이콘/뱃지/18px+ Bold만. */
  success:    { light: '#51B41B', dark: '#51B41B' },
  /** Success banner / toast background tint. */
  successBg:  { light: '#EDF7E8', dark: '#20480A' },
  /** Warning text + icon. 2.40:1 — body 단독 사용 절대 금지. */
  warning:    { light: '#FD8900', dark: '#FD8900' },
  /** Warning banner / toast background tint. */
  warningBg:  { light: '#FEF3E5', dark: '#653600' },
  /** Error text + icon. 3.13:1 — 14px 이하는 아이콘 동반 필수 (WCAG 1.4.1). */
  error:      { light: '#F95C5C', dark: '#F95C5C' },
  /** Error banner / toast background tint. */
  errorBg:    { light: '#FEEEEE', dark: '#632424' },
  /** Info text + icon. Same hex as accent.brand.normal. */
  info:       { light: '#1D7FF9', dark: '#1D7FF9' },
  /** Info banner / toast background tint. */
  infoBg:     { light: '#E8F2FE', dark: '#0B3263' },
  /** v0.7.5 — `state.*Strong` — WCAG-AA-compliant darker tier of each
   *  state color. The base `state.success/warning/error/info` are tuned for
   *  *icons + 18px+ Bold* per WCAG 1.4.1; their contrast on white drops to
   *  2.4-3.1:1 which fails AA for body-size text. The `Strong` pair maps to
   *  ramp step 70 (light) / step 30 (dark) of the matching palette so small
   *  outline-style elements (Badge `tone="outline"`, dense status text)
   *  meet 4.5:1 AA. Use the base `state.*` for icons / banners / large bold
   *  status text, and `state.*Strong` for small outline labels & dense
   *  status text.
   *
   *  WCAG checks (vs surface-base):
   *    successStrong  green-70 #387D12 → 5.46:1 (light) ✓
   *                   green-30 #A8D98D → 9.50:1 on dark canvas ✓
   *    warningStrong  orange-70 #B05F00 → 5.04:1 (light) ✓
   *                   orange-30 #FEC47F → 12.4:1 on dark canvas ✓
   *    errorStrong    red-70 #AD4040 → 5.42:1 (light) ✓
   *                   red-30 #FCADAD → 9.71:1 on dark canvas ✓
   *    infoStrong     blue-70 #1458AD → 7.50:1 (light) ✓
   *                   blue-30 #8EBFFC → 9.32:1 on dark canvas ✓
   */
  successStrong: { light: '#387D12', dark: '#A8D98D' },
  warningStrong: { light: '#B05F00', dark: '#FEC47F' },
  errorStrong:   { light: '#AD4040', dark: '#FCADAD' },
  infoStrong:    { light: '#1458AD', dark: '#8EBFFC' },
} as const satisfies Record<string, ColorPair>;

/** AI surface tokens (Polaris-specific extension — wraps AI Purple for
 *  NovaInput / AI buttons). */
export const ai = {
  /** AI Purple — AI 액션 버튼, 링크, 강조. */
  normal:  { light: '#6F3AD0', dark: '#9B85FF' },
  /** AI Purple strong — hover / pressed. */
  strong:  { light: '#511BB2', dark: '#A896FF' },
  /** AI hover 표면 (light tint). */
  hover:   { light: '#F5F1FD', dark: '#2A2247' },
  /** AI pressed 표면. */
  pressed: { light: '#E0D1FF', dark: '#3E0F8D' },
} as const satisfies Record<string, ColorPair>;

export const colors = {
  brandPalette,
  fileType,
  neutral,
  surface,
  // 10-step ramps (brand)
  bluePalette,
  darkBluePalette,
  greenPalette,
  orangePalette,
  redPalette,
  purplePalette,
  // 10-step ramps (supplementary)
  skyBluePalette,
  blueSupplementaryPalette,
  violetPalette,
  cyanPalette,
  yellowPalette,
  // gray (9 steps, 10–90)
  grayRamp,
  // v1 semantic tokens
  label,
  background,
  layer,
  interaction,
  fill,
  line,
  accentBrand,
  accentAction,
  focus,
  staticColors,
  state,
  // Polaris-specific
  ai,
} as const;
