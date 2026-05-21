import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

/**
 * Progress — linear progress bar.
 *
 * Two modes:
 *   - **determinate** (default): pass `value` (0-100). Renders a filled
 *     bar at that percent and ARIA `valuenow`/`valuemin`/`valuemax`.
 *   - **indeterminate**: omit `value` or pass `null`. Renders an
 *     animating shuttle stripe and omits `valuenow` (per WAI-ARIA APG).
 *
 * Sizing: 4px / 8px / 12px (`size="sm"` / `"md"` / `"lg"`). Default `md`.
 *
 * Tones reuse the v0.7 state palette so progress means the same thing
 * across the system:
 *   - `accent` (default) — `accent-brand-normal`, neutral progress (uploads, fetches)
 *   - `success` — `state-success`, completion confirmation
 *   - `warning` — `state-warning`, attention-required progress
 *   - `danger`  — `state-error`,   failed/blocked progress
 *   - `ai`      — `ai-normal`, NOVA / Polaris-AI tasks
 *
 * Always pair with a visible numeric label nearby (e.g. "47% — 12.4 MB / 26 MB")
 * so progress is conveyed via more than the bar fill alone (WCAG 1.4.1).
 *
 * @example Determinate
 * ```tsx
 * <Progress value={47} aria-label="파일 업로드" />
 * ```
 *
 * @example Indeterminate
 * ```tsx
 * <Progress aria-label="문서 분석 중" />
 * ```
 */

const trackVariants = cva(
  'relative w-full overflow-hidden rounded-polaris-pill bg-fill-normal',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

const fillVariants = cva(
  'h-full rounded-polaris-pill transition-[width] duration-polaris-normal ease-polaris-out',
  {
    variants: {
      variant: {
        accent:  'bg-accent-brand-normal',
        success: 'bg-state-success',
        warning: 'bg-state-warning',
        danger:  'bg-state-error',
        ai:      'bg-ai-normal',
      },
    },
    defaultVariants: { variant: 'accent' },
  }
);

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'>,
    VariantProps<typeof trackVariants>,
    VariantProps<typeof fillVariants> {
  /** Current value, 0-100. Pass `null`/`undefined` for indeterminate mode. */
  value?: number | null;
  /** Minimum value. Default: 0. */
  min?: number;
  /** Maximum value. Default: 100. */
  max?: number;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, size, variant, value, min = 0, max = 100, ...props }, ref) => {
    const isIndeterminate = value === null || value === undefined;
    const clamped = isIndeterminate ? 0 : Math.min(Math.max(value, min), max);
    const pct = isIndeterminate ? 0 : ((clamped - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : clamped}
        className={cn(trackVariants({ size }), className)}
        {...props}
      >
        {isIndeterminate ? (
          <div
            aria-hidden="true"
            className={cn(
              fillVariants({ variant }),
              // Shuttle: a 40%-wide stripe slides left → right indefinitely.
              // Reduced-motion users see a static 40% bar (also valid as
              // "something is happening" without animation).
              'absolute left-0 w-2/5 motion-safe:animate-polaris-progress-indeterminate'
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className={fillVariants({ variant })}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';
