import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shape preset.
   *   - `rect` (default) — `rounded-polaris-md` block (cards, images, generic)
   *   - `text`           — single text-line (h-4 / pill radius)
   *   - `circle`         — square + pill radius (avatars, dots)
   *   - `bare`           — no preset class (override fully via `className`)
   */
  shape?: 'rect' | 'text' | 'circle' | 'bare';
  /**
   * For `shape="text"`: render N lines stacked. The last line is shortened
   * to ~70% width to read like a paragraph end. Default: 1.
   */
  lines?: number;
}

const SHAPE_CLASS = {
  rect:   'rounded-polaris-md',
  text:   'h-4 rounded-polaris-pill',
  circle: 'rounded-polaris-pill aspect-square',
  bare:   '',
} as const;

/**
 * Skeleton — animated placeholder for async content.
 *
 * Replaces the `<Skeleton className="..." />`-with-everything-inline
 * pattern with three preset shapes and a multi-line option. Honors
 * `prefers-reduced-motion` automatically — the pulse is gated on
 * `motion-safe:animate-pulse` so users with reduced-motion preference
 * see a static block (still valid as a "loading" indicator without
 * the shimmer).
 *
 * @example
 * ```tsx
 * // Avatar + 3-line paragraph block
 * <div className="flex items-start gap-3">
 *   <Skeleton shape="circle" className="h-10 w-10" />
 *   <div className="flex-1">
 *     <Skeleton shape="text" lines={3} />
 *   </div>
 * </div>
 * ```
 *
 * @example Fully custom
 * ```tsx
 * <Skeleton shape="bare" className="h-32 w-full rounded-polaris-lg" />
 * ```
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape = 'rect', lines = 1, className, ...props }, ref) => {
    if (shape === 'text' && lines > 1) {
      // Multi-line text — render N rows, last one shortened.
      return (
        <div
          ref={ref}
          role="status"
          aria-busy="true"
          aria-label="콘텐츠 로딩 중"
          className={cn('flex flex-col gap-polaris-2xs', className)}
          {...props}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'motion-safe:animate-pulse bg-fill-normal',
                SHAPE_CLASS.text,
                i === lines - 1 ? 'w-[70%]' : 'w-full'
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-label="로딩 중"
        className={cn(
          'motion-safe:animate-pulse bg-fill-normal',
          SHAPE_CLASS[shape],
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';
