import { forwardRef, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-polaris-pill px-2.5 py-0.5 text-polaris-caption1 font-semibold',
  {
    variants: {
      variant: {
        neutral: '',
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        docx: '',
        xlsx: '',
        pptx: '',
        pdf: '',
        hwp: '',
      },
      tone: {
        /** Tinted background + colored text. The default — works on calm
         *  surfaces (cards, body bg). Can disappear over photos / busy
         *  backgrounds because the bg uses ~15% alpha. */
        subtle: '',
        /** Filled bg + on-brand white text. Use over images, dark
         *  backgrounds, or anywhere maximum legibility matters. */
        solid: '',
        /** v0.7.5 NEW — transparent bg + colored 1px border + colored text.
         *  Use for *passive* states ("비활성", "초안", "정책 위반") where
         *  visual weight should sit between subtle (background-tint, can
         *  disappear) and solid (filled, demands attention). */
        outline: 'bg-transparent border',
      },
    },
    compoundVariants: [
      // Subtle (default)
      { variant: 'neutral',   tone: 'subtle', class: 'bg-neutral-100 text-label-neutral' },
      { variant: 'primary',   tone: 'subtle', class: 'bg-accent-brand-normal-subtle text-accent-brand-normal' },
      { variant: 'secondary', tone: 'subtle', class: 'bg-ai-hover text-ai-normal' },
      { variant: 'success',   tone: 'subtle', class: 'bg-state-success-bg text-state-success' },
      { variant: 'warning',   tone: 'subtle', class: 'bg-state-warning-bg text-state-warning' },
      { variant: 'danger',    tone: 'subtle', class: 'bg-state-error-bg text-state-error' },
      { variant: 'info',      tone: 'subtle', class: 'bg-state-info-bg text-state-info' },
      { variant: 'docx',      tone: 'subtle', class: 'bg-file-docx/15 text-file-docx' },
      { variant: 'xlsx',      tone: 'subtle', class: 'bg-file-xlsx/15 text-file-xlsx' },
      { variant: 'pptx',      tone: 'subtle', class: 'bg-file-pptx/15 text-file-pptx' },
      { variant: 'pdf',       tone: 'subtle', class: 'bg-file-pdf/15 text-file-pdf' },
      { variant: 'hwp',       tone: 'subtle', class: 'bg-file-hwp/15 text-file-hwp' },
      // Solid (filled)
      { variant: 'neutral',   tone: 'solid', class: 'bg-neutral-1000 text-neutral-0' },
      { variant: 'primary',   tone: 'solid', class: 'bg-accent-brand-normal text-label-inverse' },
      { variant: 'secondary', tone: 'solid', class: 'bg-ai-normal text-label-inverse' },
      { variant: 'success',   tone: 'solid', class: 'bg-state-success text-label-inverse' },
      { variant: 'warning',   tone: 'solid', class: 'bg-state-warning text-label-inverse' },
      { variant: 'danger',    tone: 'solid', class: 'bg-state-error text-label-inverse' },
      { variant: 'info',      tone: 'solid', class: 'bg-state-info text-label-inverse' },
      { variant: 'docx',      tone: 'solid', class: 'bg-file-docx text-label-inverse' },
      { variant: 'xlsx',      tone: 'solid', class: 'bg-file-xlsx text-label-inverse' },
      { variant: 'pptx',      tone: 'solid', class: 'bg-file-pptx text-label-inverse' },
      { variant: 'pdf',       tone: 'solid', class: 'bg-file-pdf text-label-inverse' },
      { variant: 'hwp',       tone: 'solid', class: 'bg-file-hwp text-label-inverse' },
      // Outline (transparent bg + colored border + WCAG-AA text) — v0.7.5
      // NOTE: Base `state.{success|warning|error|info}` are tuned for icons
      // + 18px+ bold (2.4-3.1:1 on white — fails AA for body-size text).
      // Outline badges are 12px text, so we use the `*-strong` tier introduced
      // in v0.7.5 (ramp 70 / 30 — meets 4.5:1 AA in both light & dark).
      // For brand/ai variants, the existing `*-strong` tokens are already
      // ramp 70 and pass AA at 12px. File-type variants use the file color
      // for the BORDER (visual identity preserved) but `label-normal` for
      // the TEXT — file colors are ramp-50 and don't meet small-text AA.
      { variant: 'neutral',   tone: 'outline', class: 'border-line-strong text-label-normal' },
      { variant: 'primary',   tone: 'outline', class: 'border-accent-brand-strong text-accent-brand-strong' },
      { variant: 'secondary', tone: 'outline', class: 'border-ai-strong text-ai-strong' },
      { variant: 'success',   tone: 'outline', class: 'border-state-success-strong text-state-success-strong' },
      { variant: 'warning',   tone: 'outline', class: 'border-state-warning-strong text-state-warning-strong' },
      { variant: 'danger',    tone: 'outline', class: 'border-state-error-strong text-state-error-strong' },
      { variant: 'info',      tone: 'outline', class: 'border-state-info-strong text-state-info-strong' },
      { variant: 'docx',      tone: 'outline', class: 'border-file-docx text-label-normal' },
      { variant: 'xlsx',      tone: 'outline', class: 'border-file-xlsx text-label-normal' },
      { variant: 'pptx',      tone: 'outline', class: 'border-file-pptx text-label-normal' },
      { variant: 'pdf',       tone: 'outline', class: 'border-file-pdf text-label-normal' },
      { variant: 'hwp',       tone: 'outline', class: 'border-file-hwp text-label-normal' },
    ],
    defaultVariants: {
      variant: 'neutral',
      tone: 'subtle',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Leading icon (12-14px) shown before the children. Using a slot prop
   * over inlining icons in `children` keeps the gap and vertical
   * alignment consistent across badges.
   *
   * @example `<Badge variant="success" icon={<CheckIcon />}>완료</Badge>`
   */
  icon?: ReactNode;
  /**
   * Show a × button that fires `onDismiss` on click. Common for filter
   * chips ("docx ×") and removable tags. The button is rendered as a
   * separate `<button>` inside the badge so the badge `<span>` itself
   * stays non-interactive — preserves accessibility for badges that
   * label other elements.
   */
  dismissible?: boolean;
  /** Fires when the dismiss × button is clicked. */
  onDismiss?: () => void;
  /** aria-label for the dismiss button. Default: "제거". */
  dismissLabel?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, tone, icon, dismissible, onDismiss, dismissLabel = '제거', children, ...props }, ref) => {
    // Hover background for the dismiss × button must be tone-aware.
    // The previous `bg-interaction-hover` (light gray) worked on subtle
    // / outline tones (dark text on light bg) but on `solid` tones the
    // X is white-on-brand-color, and a light-gray hover patch sits
    // under the white X — making the icon nearly invisible at hover.
    //
    // Rule:
    //   - solid tone → translucent WHITE tint (visible against the dark
    //     filled bg, doesn't blend with the white X)
    //   - subtle / outline → translucent BLACK tint (visible against the
    //     light tinted/transparent bg, doesn't blend with the colored X)
    const dismissHover =
      tone === 'solid'
        ? 'hover:bg-static-white/25'
        : 'hover:bg-static-black/10';

    return (
      <span ref={ref} className={cn(badgeVariants({ variant, tone }), className)} {...props}>
        {icon && (
          <span className="inline-flex shrink-0 items-center [&>svg]:h-3 [&>svg]:w-3" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className={cn(
              '-mr-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-polaris-pill',
              'transition-colors',
              dismissHover,
              'focus-visible:outline-none focus-visible:shadow-polaris-focus'
            )}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { badgeVariants };
