import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * Button — v0.7-rc.1 spec (DESIGN.md §4).
 *
 * 7 variants × 6 sizes:
 *
 *   variants
 *     primary    Brand Blue background, white label                 (default)
 *     secondary  Brand Tint (light blue bg + blue text)
 *     tertiary   Gray fill (`fill.normal`)                          ← rc.0 "outline"
 *     ghost      Transparent, hover tint
 *     dark       Black bg, white label (auto-inverts in dark mode)  NEW in rc.1
 *     ai         AI Purple — NOVA chat / AI actions only
 *     danger     Red status — destructive actions
 *
 *   sizes (height / h-padding / font / weight / radius)
 *     xs    24 / 8  / 13 / Medium (500) / xs (4)
 *     sm    32 / 10 / 14 / Medium (500) / sm (8)
 *     md    40 / 12 / 14 / Medium (500) / sm (8)   ← default
 *     lg    48 / 16 / 16 / Bold (700)   / md (12)
 *     xl    54 / 20 / 16 / Bold (700)   / lg (16)  ← Large CTA per spec
 *     2xl   64 / 32 / 18 / Bold (700)   / md (12)
 *
 * Pill shape: pass `className="rounded-polaris-pill"` — the spec
 * reserves full-radius for filter chips and avatar buttons rather
 * than primary actions, so it's not a variant axis here.
 *
 * v0.7-rc.0 size aliases (`sm`/`md`/`lg`) are now spec-aligned and
 * may render at a slightly different size than rc.0. Codemod renames
 * to closest spec size (sm→xs, md→sm, lg→md) where preservation
 * matters.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-polaris transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:shadow-polaris-focus',
  {
    variants: {
      variant: {
        primary:
          'bg-accent-brand-normal text-label-inverse hover:bg-accent-brand-strong',
        secondary:
          'bg-accent-brand-bg text-accent-brand-normal hover:bg-accent-brand-bg-hover',
        tertiary:
          'bg-fill-normal text-label-normal hover:bg-fill-strong',
        ghost:
          'bg-transparent text-label-normal hover:bg-interaction-hover',
        // v0.7-rc.1 NEW — Black "Primary Dark" CTA. Auto-inverts in
        // dark mode via `accent-action-*` semantic tokens.
        dark:
          'bg-accent-action-normal text-static-white hover:bg-accent-action-strong',
        ai:
          'bg-ai-normal text-label-inverse hover:bg-ai-strong',
        danger:
          'bg-state-error text-label-inverse hover:bg-state-error/90',
      },
      size: {
        // 24 / 8px / Body3 13 / Medium 500 / radius xs (4)
        xs:    'h-6 px-2 rounded-polaris-xs text-polaris-body3 font-medium',
        // 32 / 10px / Body2 14 / Medium 500 / radius sm (8)
        sm:    'h-8 px-2.5 rounded-polaris-sm text-polaris-body2 font-medium',
        // 40 / 12px / Body2 14 / Medium 500 / radius sm (8)
        md:    'h-10 px-3 rounded-polaris-sm text-polaris-body2 font-medium',
        // 48 / 16px / Body1 16 / Bold 700 / radius md (12)
        lg:    'h-12 px-4 rounded-polaris-md text-polaris-body1 font-bold',
        // 54 / 20px / Body1 16 / Bold 700 / radius lg (16) — spec "Large CTA"
        xl:    'h-[54px] px-5 rounded-polaris-lg text-polaris-body1 font-bold',
        // 64 / 32px / Heading4 18 / Bold 700 / radius md (12)
        '2xl': 'h-16 px-8 rounded-polaris-md text-polaris-heading4 font-bold',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the underlying element provided as children (e.g. <Link>) instead of <button>. */
  asChild?: boolean;
  /** Show a spinner before the children and disable interaction. */
  loading?: boolean;
  /**
   * Leading icon slot. Use this instead of inlining icons in `children` —
   * the gap, sizing (h-4/w-4), and `aria-hidden` are wired automatically,
   * keeping rows of buttons visually aligned. Hidden while `loading=true`
   * (the spinner takes its slot).
   */
  iconLeft?: React.ReactNode;
  /** Trailing icon slot — same wiring as `iconLeft` but rendered after children. */
  iconRight?: React.ReactNode;
  /**
   * Stretch to fill the container width (`w-full`). Replaces the
   * `className="w-full"` boilerplate used in form CTAs / dialog footers.
   */
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    iconLeft,
    iconRight,
    fullWidth,
    disabled,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // When `asChild` is set, Radix Slot requires a single React element
    // child. We can't safely inject icon slots around an unknown child
    // element. If the consumer wants iconLeft/iconRight + asChild, they
    // should compose icons inside their own child element. Throw a dev
    // warning to surface the mismatch instead of silently dropping icons.
    if (asChild && (iconLeft || iconRight) && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[Button] iconLeft/iconRight is ignored when asChild is set — Slot requires a single child. Place the icon inside your child element instead.'
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : iconLeft ? (
              <span className="inline-flex shrink-0 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
                {iconLeft}
              </span>
            ) : null}
            {children}
            {iconRight && !loading && (
              <span className="inline-flex shrink-0 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
                {iconRight}
              </span>
            )}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
