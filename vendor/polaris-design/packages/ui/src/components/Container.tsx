import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

const MAX_W: Record<Size, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-none',
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width. Default: `xl`. */
  size?: Size;
  asChild?: boolean;
}

/**
 * Centered, responsive-padded content container.
 *
 * Replaces the `max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8` pattern that
 * tends to drift between feature pages. Use as the immediate child of `<main>`
 * for AppShell layouts.
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(
          'mx-auto w-full px-4 sm:px-6 lg:px-8',
          MAX_W[size],
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';
