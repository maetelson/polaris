import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the child element instead of a `<div>` (Radix Slot pattern). */
  asChild?: boolean;
  /**
   * Padding variant.
   * - `bare` (default) — no internal padding. Use when wrapping `CardHeader`/`CardBody`/`CardFooter` for sectioned content.
   * - `padded` — applies `px-5 py-4` directly. Skip the sub-components for simple single-block cards.
   */
  variant?: 'bare' | 'padded';
  /**
   * Mark the card as a clickable surface — adds hover/active visual,
   * focus-visible ring (`shadow-polaris-focus`), and `cursor-pointer`.
   * Pair with `asChild` + `<Link>`/`<button>` so the entire card becomes
   * one accessible click target. Without `asChild`, the card itself
   * stays a plain `<div>` — `interactive` is purely visual then.
   */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, variant = 'bare', interactive, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(
          'rounded-polaris-lg border border-line-neutral bg-background-base shadow-polaris-sm',
          variant === 'padded' && 'px-5 py-4',
          interactive && [
            'cursor-pointer transition-shadow transition-colors',
            'hover:shadow-polaris-md hover:border-line-normal',
            'active:shadow-polaris-sm',
            'focus-visible:outline-none focus-visible:shadow-polaris-focus',
          ],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 px-5 pt-5', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-polaris-heading3 text-label-normal', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-polaris-body2 text-label-neutral', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-5 py-4', className)}
      {...props}
    />
  )
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 px-5 pb-5', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
