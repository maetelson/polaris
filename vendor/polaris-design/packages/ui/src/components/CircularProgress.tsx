import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

/**
 * CircularProgress — radial progress indicator.
 *
 * The horizontal `<Progress>` covers full-width upload bars; this is for
 * compact spots where a horizontal bar can't fit:
 *   - inside buttons (`<Button loading>` already has its own spinner — use
 *     this for *outside* the button, e.g. async card actions)
 *   - small async cards / status chips
 *   - inline next to a label (e.g. "동기화 중 47%")
 *
 * Two modes mirror `<Progress>`:
 *   - **determinate** — pass `value` 0-100, renders an arc whose length
 *     reflects progress + ARIA `valuenow`
 *   - **indeterminate** — omit `value`, spins continuously + omits
 *     `valuenow` (per WAI-ARIA APG)
 *
 * Implemented with SVG `stroke-dasharray` so it scales cleanly at any
 * size. `prefers-reduced-motion` users see a static 25% ring in
 * indeterminate mode (still valid as "something is happening").
 *
 * @example
 * ```tsx
 * <CircularProgress aria-label="저장 중" />                    // indeterminate
 * <CircularProgress value={progress} aria-label="업로드" />    // determinate
 * <CircularProgress size="lg" tone="success" value={100} />
 * ```
 */

const trackVariants = cva('block', {
  variants: {
    size: {
      // 16 / 24 / 32 / 48 px outer dim (px hard-coded to match SVG viewBox).
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: { size: 'md' },
});

const STROKE_COLOR_TRACK = 'stroke-fill-normal';
const STROKE_BY_TONE = {
  accent:  'stroke-accent-brand-normal',
  success: 'stroke-state-success',
  warning: 'stroke-state-warning',
  danger:  'stroke-state-error',
  ai:      'stroke-ai-normal',
} as const;
type Tone = keyof typeof STROKE_BY_TONE;

export interface CircularProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'>,
    VariantProps<typeof trackVariants> {
  /** Determinate value 0-100. Omit / pass `null` for indeterminate. */
  value?: number | null;
  /** Minimum value. Default: 0. */
  min?: number;
  /** Maximum value. Default: 100. */
  max?: number;
  /** Color tone. Default: `accent`. */
  tone?: Tone;
  /** Stroke thickness as a fraction of the radius. Default: `0.18` (matches sm/md visual). */
  thickness?: number;
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    { className, size = 'md', value, min = 0, max = 100, tone = 'accent', thickness = 0.18, ...props },
    ref
  ) => {
    const isIndeterminate = value === null || value === undefined;
    const clamped = isIndeterminate ? 0 : Math.min(Math.max(value, min), max);
    const pct = isIndeterminate ? 0 : ((clamped - min) / (max - min)) * 100;

    // 24-unit SVG viewBox — radius 11 + half-thickness so the stroke stays inside.
    // Stroke width is computed from the radius so any `size` keeps the same
    // ring-to-empty proportion.
    const r = 11 - 11 * thickness;
    const sw = 11 * thickness * 2;
    const circumference = 2 * Math.PI * r;
    // Determinate: dasharray = (visible) (gap). Indeterminate: 25% arc that spins.
    const visible = isIndeterminate ? circumference * 0.25 : (circumference * pct) / 100;
    const dashoffset = isIndeterminate ? 0 : circumference - visible;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : clamped}
        className={cn(trackVariants({ size }), 'inline-flex shrink-0', className)}
        {...props}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-full w-full -rotate-90"
          aria-hidden="true"
        >
          {/* Track (full ring). */}
          <circle
            cx="12"
            cy="12"
            r={r}
            strokeWidth={sw}
            className={STROKE_COLOR_TRACK}
          />
          {/* Foreground arc. */}
          <circle
            cx="12"
            cy="12"
            r={r}
            strokeWidth={sw}
            strokeLinecap="round"
            className={cn(
              STROKE_BY_TONE[tone],
              isIndeterminate && 'motion-safe:animate-spin origin-center'
            )}
            strokeDasharray={isIndeterminate ? `${visible} ${circumference}` : `${visible} ${circumference}`}
            strokeDashoffset={dashoffset}
            style={!isIndeterminate ? { transition: 'stroke-dashoffset 200ms ease-out' } : undefined}
          />
        </svg>
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';
