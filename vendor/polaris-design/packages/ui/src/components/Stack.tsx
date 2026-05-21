import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

type Gap = 0 | 1 | 1.5 | 2 | 2.5 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const GAP: Record<Gap, string> = {
  0: 'gap-0',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  2.5: 'gap-2.5',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

const ALIGN: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const JUSTIFY: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `column` (default) — stacks vertically. `row` — horizontal. */
  direction?: 'row' | 'column';
  /** Tailwind gap scale. Default: `2`. */
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  /** Render as the child element instead of `<div>`. */
  asChild?: boolean;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction = 'column', gap = 2, align, justify, wrap, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(
          'flex',
          direction === 'row' ? 'flex-row' : 'flex-col',
          GAP[gap],
          align && ALIGN[align],
          justify && JUSTIFY[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';

// `HStack` / `VStack` exports were removed in v0.8.0. Use `<Stack direction="row">`
// (or just `<Stack>` for the default column). codemod-v08 rewrites consumers.
