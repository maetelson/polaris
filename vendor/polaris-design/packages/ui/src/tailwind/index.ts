import type { Config } from 'tailwindcss';

/**
 * Returns a Tailwind color value that supports both opaque and alpha-modified
 * forms (e.g. `bg-state-success` vs `bg-state-success/15`).
 *
 * Without this, plain `'var(--polaris-state-success)'` strings cause Tailwind
 * to drop the alpha modifier silently — the rule for `bg-state-success/15`
 * never gets generated and the tinted background disappears at runtime. The
 * function form lets us produce `color-mix()` for the alpha case.
 *
 * `color-mix(in srgb, ...)` is supported in Chrome 111+, Safari 16.2+,
 * Firefox 113+ which covers our target browsers.
 */
function token(varName: string): string {
  const fn = ({ opacityValue }: { opacityValue?: string } = {}) => {
    if (opacityValue !== undefined && opacityValue !== '1') {
      return `color-mix(in srgb, var(${varName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${varName})`;
  };
  // Tailwind accepts callable color values at runtime; the public TS types
  // only expose `string | RecursiveKeyValuePair<string, string>`. Cast here
  // so the preset typechecks while still resolving alpha modifiers correctly.
  return fn as unknown as string;
}

/** Builds a 10-step ramp object (`05` → `90`) for the Tailwind palette
 *  given a CSS-var prefix like `--polaris-blue`. Includes the legacy
 *  `5` (no leading zero) key as a deprecated alias of `05` so v0.7-rc.0
 *  classes (`bg-blue-05`) keep resolving. */
function ramp10(prefix: string) {
  return {
    '05': token(`${prefix}-05`),
    '10': token(`${prefix}-10`),
    '20': token(`${prefix}-20`),
    '30': token(`${prefix}-30`),
    '40': token(`${prefix}-40`),
    '50': token(`${prefix}-50`),
    '60': token(`${prefix}-60`),
    '70': token(`${prefix}-70`),
    '80': token(`${prefix}-80`),
    '90': token(`${prefix}-90`),
  };
}

const polarisPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Brand palette aliases — keep these (single-word color references
        // for non-semantic contexts like ribbon icons / charts that need
        // raw brand hue without "this is a state" connotation).
        'polaris-blue':   token('--polaris-blue'),
        'polaris-green':  token('--polaris-green'),
        'polaris-orange': token('--polaris-orange'),
        'polaris-red':    token('--polaris-red'),
        'polaris-purple': token('--polaris-purple'),

        // File-type colors — multi-color baked-in but exposed as Tailwind
        // utilities for cases where we paint a separator/avatar in the
        // file's hue without rendering a `<FileIcon>`.
        file: {
          docx: token('--polaris-file-docx'),
          hwp:  token('--polaris-file-hwp'),
          xlsx: token('--polaris-file-xlsx'),
          pptx: token('--polaris-file-pptx'),
          pdf:  token('--polaris-file-pdf'),
        },

        // Surface elevation tiers (v0.7.5+). Light is all #FFFFFF — depth
        // comes from `shadow-polaris-*`. Dark steps the gray tier upward
        // from raised → popover → modal so layered overlays read distinct.
        surface: {
          /** v0.7.5+ — popover/dropdown/menu panel. Above raised. */
          popover: token('--polaris-surface-popover'),
          /** v0.7.5+ — modal/dialog/drawer panel. Top of stack. */
          modal:   token('--polaris-surface-modal'),
        },

        neutral: {
          0:    token('--polaris-neutral-0'),
          50:   token('--polaris-neutral-50'),
          100:  token('--polaris-neutral-100'),
          200:  token('--polaris-neutral-200'),
          300:  token('--polaris-neutral-300'),
          400:  token('--polaris-neutral-400'),
          500:  token('--polaris-neutral-500'),
          600:  token('--polaris-neutral-600'),
          700:  token('--polaris-neutral-700'),
          800:  token('--polaris-neutral-800'),
          900:  token('--polaris-neutral-900'),
          1000: token('--polaris-neutral-1000'),
        },

        // ───── v0.7+ semantic tokens ─────
        //
        // These match the design team's Figma library and DESIGN.md.
        // (v0.6 aliases — `fg.*`, `background.base/raised/sunken`,
        // `brand.*`, `status.*`, `primary.*` — were removed in v0.8.0.
        // Run `pnpm dlx @polaris/lint polaris-codemod-v08 --apply src` if
        // you're upgrading from v0.7.)

        label: {
          normal:      token('--polaris-label-normal'),
          neutral:     token('--polaris-label-neutral'),
          alternative: token('--polaris-label-alternative'),
          assistive:   token('--polaris-label-assistive'),
          inverse:     token('--polaris-label-inverse'),
          /** v0.7-rc.1 NEW. */
          disabled:    token('--polaris-label-disabled'),
        },
        background: {
          /** Page-level base bg. */
          base:     token('--polaris-background-base'),
          /** Disabled bg (buttons, inputs). */
          disabled: token('--polaris-background-disabled'),
        },
        // v0.7-rc.1 NEW — layer.surface / layer.overlay
        layer: {
          surface: token('--polaris-layer-surface'),
          overlay: token('--polaris-layer-overlay'),
        },
        interaction: {
          hover:   token('--polaris-interaction-hover'),
          /** v0.7-rc.1 NEW. */
          pressed: token('--polaris-interaction-pressed'),
        },
        fill: {
          /** v0.7-rc.1 NEW. */
          neutral: token('--polaris-fill-neutral'),
          normal:  token('--polaris-fill-normal'),
          /** v0.7-rc.1 NEW. */
          strong:  token('--polaris-fill-strong'),
        },
        line: {
          neutral:  token('--polaris-line-neutral'),
          normal:   token('--polaris-line-normal'),
          /** v0.7-rc.1 NEW. */
          strong:   token('--polaris-line-strong'),
          /** v0.7-rc.1 NEW. */
          disabled: token('--polaris-line-disabled'),
        },
        // v0.7-rc.1 — accent.brand / accent.action
        'accent-brand': {
          normal:    token('--polaris-accent-brand-normal'),
          strong:    token('--polaris-accent-brand-strong'),
          /** v0.7-rc.1 NEW. */
          bg:        token('--polaris-accent-brand-bg'),
          /** v0.7-rc.1 NEW. */
          'bg-hover': token('--polaris-accent-brand-bg-hover'),
          /**
           * Subtle brand-tinted hover/active background. v0.7.1 fix:
           * `bg-accent-brand-normal-subtle` was used by 12+ components
           * (Sidebar, Pagination, Calendar, Drawer, Command, Badge,
           * Select, DropdownMenu, FileCard, Ribbon, …). v0.7.3 hotfix
           * surfaced this missing token; the canonical CSS variable is
           * `--polaris-accent-brand-normal-subtle` (light `#E8F2FE` /
           * dark `#1A2238`), defined in `tokens.css` + the v4 theme map.
           *
           * **The v3 preset previously pointed at `--polaris-accent-brand-bg`**
           * (the stronger `#D9EAFF` / `#0B3263` value used for Secondary
           * button background). v3 and v4 builds therefore rendered hover
           * highlights at different intensities — Codex review (rc.0)
           * caught this as a v0.8 release-gate blocker. Now both builds
           * share `--polaris-accent-brand-normal-subtle`.
           */
          'normal-subtle': token('--polaris-accent-brand-normal-subtle'),
        },
        'accent-action': {
          normal: token('--polaris-accent-action-normal'),
          strong: token('--polaris-accent-action-strong'),
        },
        // v0.7-rc.1 NEW — focus, static, state
        focus: {
          ring: token('--polaris-focus-ring'),
        },
        static: {
          white: token('--polaris-static-white'),
          black: token('--polaris-static-black'),
        },
        state: {
          new:           token('--polaris-state-new'),
          success:       token('--polaris-state-success'),
          'success-bg':  token('--polaris-state-success-bg'),
          warning:       token('--polaris-state-warning'),
          'warning-bg':  token('--polaris-state-warning-bg'),
          error:         token('--polaris-state-error'),
          'error-bg':    token('--polaris-state-error-bg'),
          info:          token('--polaris-state-info'),
          'info-bg':     token('--polaris-state-info-bg'),
          /** v0.7.5 NEW — WCAG-AA-compliant darker tier of each state color
           *  for small outline labels / dense status text. Use the base
           *  `state-*` for icons / banners / 18px+ bold; use `state-*-strong`
           *  for body-size text on light surfaces. */
          'success-strong': token('--polaris-state-success-strong'),
          'warning-strong': token('--polaris-state-warning-strong'),
          'error-strong':   token('--polaris-state-error-strong'),
          'info-strong':    token('--polaris-state-info-strong'),
        },
        ai: {
          normal:  token('--polaris-ai-normal'),
          strong:  token('--polaris-ai-strong'),
          hover:   token('--polaris-ai-hover'),
          pressed: token('--polaris-ai-pressed'),
        },

        // 10-step primitive ramps. Class form: `bg-blue-50`, `text-purple-70`,
        // `bg-yellow-30`, etc. Each ramp covers 05 (lightest tint) → 90
        // (darkest shade); brand ramps inherit `--state-success/-warning/-error`
        // semantic aliases (e.g. green-50 == state-success).
        //
        // (v0.7-rc.0 `bg-blue-5` no-leading-zero classes were removed in
        // v0.8 — codemod-v08 rewrites them to `bg-blue-05`.)
        blue:                ramp10('--polaris-blue'),
        'dark-blue':         ramp10('--polaris-dark-blue'),
        green:               ramp10('--polaris-green'),
        orange:              ramp10('--polaris-orange'),
        red:                 ramp10('--polaris-red'),
        purple:              ramp10('--polaris-purple'),
        // Supplementary palettes (v0.7-rc.1) — chart categories, plan
        // badges, file-type extensions. Avoid mixing with brand colors
        // on the same surface.
        'sky-blue':          ramp10('--polaris-sky-blue'),
        'blue-supplementary': ramp10('--polaris-blue-supplementary'),
        violet:              ramp10('--polaris-violet'),
        cyan:                ramp10('--polaris-cyan'),
        yellow:              ramp10('--polaris-yellow'),
        // Gray runs 10 → 90 (no 05 in spec).
        gray: {
          10: token('--polaris-gray-10'),
          20: token('--polaris-gray-20'),
          30: token('--polaris-gray-30'),
          40: token('--polaris-gray-40'),
          50: token('--polaris-gray-50'),
          60: token('--polaris-gray-60'),
          70: token('--polaris-gray-70'),
          80: token('--polaris-gray-80'),
          90: token('--polaris-gray-90'),
        },
      },

      // 8-level v1 spec scale. Class form: `rounded-polaris-md`,
      // `rounded-polaris-pill`, etc. (v0.7 `rounded-polaris-full` alias
      // was removed in v0.8 — codemod-v08 rewrites it to `pill`.)
      borderRadius: {
        'polaris-2xs':  'var(--polaris-radius-2xs)',
        'polaris-xs':   'var(--polaris-radius-xs)',
        'polaris-sm':   'var(--polaris-radius-sm)',
        'polaris-md':   'var(--polaris-radius-md)',
        'polaris-lg':   'var(--polaris-radius-lg)',
        'polaris-xl':   'var(--polaris-radius-xl)',
        'polaris-2xl':  'var(--polaris-radius-2xl)',
        'polaris-pill': 'var(--polaris-radius-pill)',
      },

      boxShadow: {
        'polaris-xs': 'var(--polaris-shadow-xs)',
        'polaris-sm': 'var(--polaris-shadow-sm)',
        'polaris-md': 'var(--polaris-shadow-md)',
        'polaris-lg': 'var(--polaris-shadow-lg)',
        // AI Purple glow — for prompt composers / response cards only.
        'polaris-ai': 'var(--polaris-shadow-ai)',
        /** Standard 3px focus ring (`--polaris-focus-ring` token at 35% / 45%
         *  alpha for light/dark). Apply as `focus-visible:shadow-polaris-focus`
         *  on custom interactive elements to match the system focus outline. */
        'polaris-focus': 'var(--polaris-shadow-focus)',
      },

      fontFamily: {
        polaris:        ['var(--polaris-font-sans)'],
        'polaris-mono': ['var(--polaris-font-mono)'],
      },

      // Type scale — v0.8 spec names. Class form: `text-polaris-display`,
      // `text-polaris-title`, `text-polaris-heading1`-`heading4`,
      // `text-polaris-body1`-`body3`, `text-polaris-caption1`-`caption2`.
      //
      // Letter-spacing is intentionally absent — DESIGN.md mandates no
      // letter-spacing manipulation (Pretendard's optical metrics are
      // already calibrated). Line-heights: 1.4 headings, 1.5 body, 1.3
      // captions.
      //
      // Mobile type scale (max-width: 767px) is applied as a global CSS
      // override in tokens.css, NOT through Tailwind utilities — class
      // names stay stable across viewports.
      //
      // (v0.7 rc.0 / v0.6 aliases — `polaris-h1`-`h5`, `polaris-body`,
      // `polaris-meta`, `polaris-tiny`, `polaris-display-lg`, etc. — were
      // removed in v0.8. Codemod-v08 rewrites them to spec names.)
      fontSize: {
        'polaris-display':   ['40px', { lineHeight: '56px', fontWeight: '700' }],
        'polaris-title':     ['32px', { lineHeight: '44px', fontWeight: '700' }],
        'polaris-heading1':  ['28px', { lineHeight: '40px', fontWeight: '700' }],
        'polaris-heading2':  ['24px', { lineHeight: '34px', fontWeight: '700' }],
        'polaris-heading3':  ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'polaris-heading4':  ['18px', { lineHeight: '26px', fontWeight: '700' }],
        'polaris-body1':     ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'polaris-body2':     ['14px', { lineHeight: '21px', fontWeight: '400' }],
        'polaris-body3':     ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'polaris-caption1':  ['12px', { lineHeight: '16px', fontWeight: '700' }],
        'polaris-caption2':  ['11px', { lineHeight: '14px', fontWeight: '700' }],

        // v0.7.4 — form helper / error / floating-label 전용 토큰.
        // 디자인팀 DESIGN.md §4 Inputs & Forms 명시: Floating Title /
        // Error Text가 12px / weight 400 / lh 1.3. caption1과 사이즈가
        // 같지만 weight가 달라 별도 토큰으로 분리. caption1은 badge / tag
        // / label 같은 *bold* 캡션 컨텍스트 그대로 700 유지.
        'polaris-helper':    ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },

      // v0.7-rc.1 NEW — spec-named spacing tokens. Class form:
      // `p-polaris-md`, `gap-polaris-lg`, `mt-polaris-2xl`, etc.
      // The numeric Tailwind defaults (`p-4`, `gap-6`) keep working.
      spacing: {
        'polaris-none': 'var(--polaris-spacing-none)',
        'polaris-4xs': 'var(--polaris-spacing-4xs)',
        'polaris-3xs': 'var(--polaris-spacing-3xs)',
        'polaris-2xs': 'var(--polaris-spacing-2xs)',
        'polaris-xs':  'var(--polaris-spacing-xs)',
        'polaris-sm':  'var(--polaris-spacing-sm)',
        'polaris-md':  'var(--polaris-spacing-md)',
        'polaris-lg':  'var(--polaris-spacing-lg)',
        'polaris-xl':  'var(--polaris-spacing-xl)',
        'polaris-2xl': 'var(--polaris-spacing-2xl)',
        'polaris-3xl': 'var(--polaris-spacing-3xl)',
        'polaris-4xl': 'var(--polaris-spacing-4xl)',
      },

      // v0.7-rc.1 NEW — z-index. Class form: `z-polaris-modal`,
      // `z-polaris-toast`, etc. Avoid arbitrary `z-[999]` values.
      zIndex: {
        'polaris-base':     'var(--polaris-z-base)',
        'polaris-dropdown': 'var(--polaris-z-dropdown)',
        'polaris-sticky':   'var(--polaris-z-sticky)',
        'polaris-dim':      'var(--polaris-z-dim)',
        'polaris-modal':    'var(--polaris-z-modal)',
        'polaris-toast':    'var(--polaris-z-toast)',
      },

      // v0.7-rc.1 NEW — motion. Class form: `duration-polaris-fast`,
      // `ease-polaris-out`, etc.
      transitionDuration: {
        'polaris-instant': 'var(--polaris-duration-instant)',
        'polaris-fast':    'var(--polaris-duration-fast)',
        'polaris-normal':  'var(--polaris-duration-normal)',
        'polaris-slow':    'var(--polaris-duration-slow)',
      },
      transitionTimingFunction: {
        'polaris-in-out': 'var(--polaris-ease-in-out)',
        'polaris-out':    'var(--polaris-ease-out)',
        'polaris-in':     'var(--polaris-ease-in)',
      },

      // v0.7.4 NEW — keyframes for indeterminate Progress shuttle.
      // Reduced-motion users get a static 40% bar (motion-safe: prefix in
      // the component) — still valid as "something is happening" without
      // the animation, and respects WCAG 2.3.3 Animation from Interactions.
      keyframes: {
        'polaris-progress-indeterminate': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      },
      animation: {
        'polaris-progress-indeterminate':
          'polaris-progress-indeterminate 1.4s var(--polaris-ease-in-out, ease-in-out) infinite',
      },
    },
  },
};

export default polarisPreset;
