import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /**
   * `inline` (default) — `<dt>`/`<dd>` pair on the same row above `sm`,
   * auto-stacks on narrow viewports to prevent label/value squeeze.
   * `stacked` — always label-above-value.
   * `inline-strict` — never auto-stack (use only when values are short).
   */
  layout?: 'inline' | 'stacked' | 'inline-strict';
}

/**
 * Key-value list semantically built on `<dl>`/`<dt>`/`<dd>`.
 *
 * Use for "details" panels — customer cards, contract metadata, profile pages.
 * `inline` is grid-based and aligns labels across rows; on narrow viewports it
 * automatically stacks to prevent the label column from squashing.
 */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, layout = 'inline', ...props }, ref) => (
    <dl
      ref={ref}
      data-layout={layout}
      className={cn(
        'font-polaris text-polaris-body2',
        layout === 'stacked' && 'flex flex-col gap-3',
        layout === 'inline' && 'flex flex-col gap-3 sm:grid sm:grid-cols-[max-content_1fr] sm:gap-x-6 sm:gap-y-2',
        layout === 'inline-strict' && 'grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2',
        className
      )}
      {...props}
    />
  )
);
DescriptionList.displayName = 'DescriptionList';

export const DescriptionTerm = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <dt
      ref={ref as never}
      className={cn('text-label-alternative', className)}
      {...props}
    />
  )
);
DescriptionTerm.displayName = 'DescriptionTerm';

export const DescriptionDetails = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <dd
      ref={ref as never}
      className={cn('text-label-normal', className)}
      {...props}
    />
  )
);
DescriptionDetails.displayName = 'DescriptionDetails';
