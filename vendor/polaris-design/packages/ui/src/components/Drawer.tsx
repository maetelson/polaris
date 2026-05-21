import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { CloseIcon } from '../icons';
import { cn } from '../lib/cn';

/**
 * Side-anchored panel built on Radix Dialog. Use for table-row detail views,
 * navigation drawers, filter side panels — anywhere a centered Dialog would
 * waste horizontal space.
 *
 * Surface tokens, focus-trap, and Esc/click-outside-to-close all follow Dialog.
 */

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerPortal = DialogPrimitive.Portal;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      'data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-150',
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

const drawerVariants = cva(
  cn(
    'fixed z-50 bg-surface-modal text-label-normal border-line-neutral shadow-polaris-lg',
    'flex flex-col',
    'focus-visible:outline-none',
    'transition-transform duration-200 ease-out'
  ),
  {
    variants: {
      side: {
        right: 'right-0 top-0 h-full w-full max-w-md border-l data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full',
        left:  'left-0 top-0 h-full w-full max-w-md border-r data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full',
        top:   'top-0 inset-x-0 max-h-[80vh] border-b data-[state=open]:translate-y-0 data-[state=closed]:-translate-y-full',
        bottom:'bottom-0 inset-x-0 max-h-[80vh] border-t data-[state=open]:translate-y-0 data-[state=closed]:translate-y-full',
      },
    },
    defaultVariants: { side: 'right' },
  }
);

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {
  /** Hide the default close (X) button. Default: false. */
  hideClose?: boolean;
}

export const DrawerContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, side, hideClose, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(drawerVariants({ side }), className)}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-polaris-sm text-label-alternative',
            'hover:text-label-normal hover:bg-accent-brand-normal-subtle p-1',
            'focus-visible:outline-none focus-visible:shadow-polaris-focus'
          )}
        >
          <CloseIcon size={16} aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4 border-b border-line-neutral', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

export const DrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)} {...props} />
);
DrawerBody.displayName = 'DrawerBody';

export const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 gap-2 px-6 py-4 border-t border-line-neutral', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';

export const DrawerTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-polaris-heading3 text-label-normal', className)}
    {...props}
  />
));
DrawerTitle.displayName = 'DrawerTitle';

export const DrawerDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-polaris-body2 text-label-neutral', className)}
    {...props}
  />
));
DrawerDescription.displayName = 'DrawerDescription';

export { drawerVariants };
