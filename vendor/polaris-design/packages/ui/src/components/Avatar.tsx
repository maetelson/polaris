import { Children, cloneElement, forwardRef, isValidElement, type ReactElement, type ReactNode } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-polaris-pill bg-fill-neutral',
  {
    variants: {
      size: {
        sm: 'h-7 w-7 text-polaris-caption1',
        md: 'h-9 w-9 text-polaris-body2',
        lg: 'h-11 w-11 text-polaris-body1',
        xl: 'h-14 w-14 text-polaris-heading3',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

export const Avatar = forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

export const AvatarImage = forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center bg-accent-brand-normal text-label-inverse font-semibold',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

/* ================================================================== *
 * AvatarGroup — overlapping cluster + "+N" overflow         v0.7.6 NEW
 * ================================================================== *
 *
 * Renders Avatar children as an overlapping row, capping visible
 * avatars at `max` and showing a `+N` indicator for the remainder.
 * The size from `<AvatarGroup size="md">` is propagated to all child
 * `<Avatar>` instances (including the overflow indicator) so consumers
 * pick size in one place.
 *
 * Common in collaboration / sharing UIs ("이 문서를 4명이 보고 있어요"),
 * activity rows, and member lists.
 *
 * @example
 * ```tsx
 * <AvatarGroup size="sm" max={3}>
 *   <Avatar><AvatarImage src={u1.avatar} /><AvatarFallback>김</AvatarFallback></Avatar>
 *   <Avatar><AvatarImage src={u2.avatar} /><AvatarFallback>이</AvatarFallback></Avatar>
 *   <Avatar><AvatarImage src={u3.avatar} /><AvatarFallback>박</AvatarFallback></Avatar>
 *   <Avatar><AvatarFallback>최</AvatarFallback></Avatar>
 *   <Avatar><AvatarFallback>윤</AvatarFallback></Avatar>
 * </AvatarGroup>
 * // → 3 visible + "+2"
 * ```
 */
export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Maximum visible avatars before collapsing into `+N`. Default: 4. */
  max?: number;
  /** Children must be `<Avatar>` elements. */
  children: ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, size = 'md', max = 4, children, ...props }, ref) => {
    const all = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
    const visible = all.slice(0, max);
    const overflow = all.length - visible.length;

    return (
      <div
        ref={ref}
        className={cn('flex items-center -space-x-2', className)}
        {...props}
      >
        {visible.map((child, i) =>
          cloneElement(child, {
            // Propagate size + add overlap ring + ensure each child has a unique key.
            key: child.key ?? i,
            size: child.props.size ?? size,
            className: cn(
              'ring-2 ring-background-base',
              child.props.className
            ),
          })
        )}
        {overflow > 0 && (
          <Avatar
            size={size}
            className={cn('ring-2 ring-background-base', avatarVariants({ size }))}
            aria-label={`외 ${overflow}명`}
          >
            <AvatarFallback className="bg-fill-strong text-label-neutral">
              +{overflow}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';
