import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CloseIcon } from '../icons';
import { cn } from '../lib/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

/**
 * Dialog — v0.7-rc.1 spec (DESIGN.md §4 "Modals & Dialogs").
 *
 * - Background: `--layer-surface` (raised surface, distinct from page bg)
 * - Border-radius: `--radius-xl` (24px) — emphasis modal per spec
 * - Overlay: `--layer-overlay` (`rgba(0,0,0,0.5)`)
 * - Shadow: `--shadow-lg`
 * - Z-index: `--z-modal` (400) for content, `--z-dim` (300) for overlay
 * - Padding: `--spacing-lg` (24)
 * - Max-width: 480px (default), `max-w-lg` for compatibility
 */
export const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-polaris-dim bg-layer-overlay',
      'data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-polaris-fast',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-polaris-modal -translate-x-1/2 -translate-y-1/2',
        'w-[calc(100vw-2rem)] max-w-[480px] p-polaris-lg',
        'bg-surface-modal text-label-normal rounded-polaris-xl shadow-polaris-lg',
        'focus-visible:outline-none',
        'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
        'data-[state=open]:translate-y-[calc(-50%+0px)] data-[state=closed]:translate-y-[calc(-50%+8px)]',
        'transition-all duration-polaris-slow ease-polaris-out',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          'absolute right-4 top-4 rounded-polaris-sm text-label-alternative p-1',
          'hover:text-label-normal hover:bg-interaction-hover',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring/40'
        )}
      >
        <CloseIcon size={16} aria-hidden="true" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-polaris-3xs mb-polaris-sm', className)} {...props} />
);

export const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-polaris-heading3 text-label-normal', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-polaris-body2 text-label-neutral', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stretch direct child Buttons to share the full row width (`flex-1`).
   *
   * Use case: narrow modals on mobile / drawer-style sheets where two
   * actions read better as half-width pair than as right-aligned siblings.
   * Without the prop, the default behavior stays — buttons sit at their
   * natural width, right-aligned with `gap-polaris-2xs` between them.
   *
   * Implementation note: applies `flex-1` to direct `<button>` children
   * via Tailwind's `[&>button]` selector so any button (including
   * `<Button>` from this package, which renders `<button>`) participates
   * automatically. Anchor-based actions (`asChild` + `<a>`) need to add
   * their own `className="flex-1"` if they want to join.
   */
  fullWidthButtons?: boolean;
}

export const DialogFooter = ({ className, fullWidthButtons, ...props }: DialogFooterProps) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-polaris-2xs mt-polaris-lg',
      fullWidthButtons && 'sm:justify-stretch [&>button]:flex-1',
      className
    )}
    {...props}
  />
);
