import { forwardRef, useEffect, useState, type ReactNode } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { CloseIcon } from '../icons';
import { cn } from '../lib/cn';

export const ToastProvider = ToastPrimitive.Provider;

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

const POSITION: Record<ToastPosition, string> = {
  // v0.7-rc.1: 50px top/bottom from screen edge, centered horizontally
  // for the spec's primary placements per DESIGN.md §4.
  'top-right':     'top-4 right-4 items-end',
  'top-left':      'top-4 left-4 items-start',
  'top-center':    'top-[50px] left-1/2 -translate-x-1/2 items-center',
  'bottom-right':  'bottom-4 right-4 items-end',
  'bottom-left':   'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-[50px] left-1/2 -translate-x-1/2 items-center',
};

export interface ToastViewportProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> {
  /** Anchor position. Default: `top-right`. */
  position?: ToastPosition;
}

export const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, position = 'top-right', ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed z-polaris-toast flex flex-col gap-polaris-2xs max-w-sm w-full outline-none',
      POSITION[position],
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

/**
 * Toast variants (v0.7-rc.1 — DESIGN.md §4).
 *
 * Spec defines a single dark, glass-blur toast surface for ALL types
 * — only the icon color changes between success/fail/info/warning.
 * The base style is `bg-layer-overlay backdrop-blur-md`, white text,
 * 48px height, 12px radius, z-toast.
 *
 * The variants below set an accent border-left (left edge of the
 * toast) to convey type at a glance, while the surface stays uniform.
 * `neutral` is unchanged from rc.0 (no accent border).
 */
const toastVariants = cva(
  // Base — dark glass per spec. h-12 (48px), p-3 (12px), r-12 (md).
  'group pointer-events-auto relative flex w-full items-center gap-polaris-2xs overflow-hidden rounded-polaris-md p-polaris-xs pr-polaris-2xl min-h-12 shadow-polaris-md font-polaris bg-layer-overlay backdrop-blur-md text-static-white text-polaris-body2 font-medium',
  {
    variants: {
      variant: {
        info:    'border-l-[3px] border-state-info',
        success: 'border-l-[3px] border-state-success',
        warning: 'border-l-[3px] border-state-warning',
        danger:  'border-l-[3px] border-state-error',
        neutral: '',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

export const Toast = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = 'Toast';

export const ToastTitle = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-polaris-body2 font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-polaris-caption1 opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

export const ToastAction = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'ml-auto inline-flex h-8 shrink-0 items-center justify-center rounded-polaris-md border border-current px-3 text-polaris-caption1 font-semibold hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

export const ToastClose = forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    aria-label="Close"
    className={cn(
      'absolute right-2 top-2 rounded-polaris-sm p-1 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current',
      className
    )}
    {...props}
  >
    <CloseIcon size={16} aria-hidden="true" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = 'ToastClose';

export { toastVariants };

/* ----------------------------------------------------------------------------
 * Imperative API: useToast() hook + Toaster component
 *
 * Module-level store (shadcn-style) — keeps Toaster usage to a single line
 * inside ToastProvider, so callers anywhere in the tree can fire toasts via
 * `toast({ title, description, variant })` without lifting state.
 * ------------------------------------------------------------------------- */

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>['variant']>;

export interface ToastInput {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastEntry extends ToastInput {
  id: string;
  open: boolean;
}

type ToastListener = (toasts: ToastEntry[]) => void;

let toastIdCounter = 0;
let toastQueue: ToastEntry[] = [];
const toastListeners = new Set<ToastListener>();
const TOAST_LIMIT = 5;

function emit() {
  for (const listener of toastListeners) listener(toastQueue);
}

export function toast(input: ToastInput): { id: string; dismiss: () => void } {
  const id = `polaris-toast-${++toastIdCounter}`;
  const entry: ToastEntry = { ...input, id, open: true };
  toastQueue = [entry, ...toastQueue].slice(0, TOAST_LIMIT);
  emit();
  return {
    id,
    dismiss: () => dismissToast(id),
  };
}

export function dismissToast(id?: string) {
  toastQueue = toastQueue.map((t) => (id === undefined || t.id === id ? { ...t, open: false } : t));
  emit();
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastEntry[]>(toastQueue);
  useEffect(() => {
    const listener: ToastListener = (next) => setToasts([...next]);
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);
  return { toasts, toast, dismiss: dismissToast };
}

export interface ToasterProps {
  /**
   * Default `duration` (ms) applied when a `toast({...})` call doesn't
   * specify one. Radix's own default is 5000ms; bump this for slower
   * readers, lower it for terse confirmations. Per-toast `duration`
   * always wins.
   */
  defaultDuration?: number;
}

/**
 * Render once near the root of your app, *inside* a `<ToastProvider>` and next
 * to a `<ToastViewport>`. Then call `toast({ title, description })` anywhere.
 *
 * ```tsx
 * <ToastProvider>
 *   <App />
 *   <Toaster defaultDuration={5000} />
 *   <ToastViewport />
 * </ToastProvider>
 * ```
 */
export function Toaster({ defaultDuration }: ToasterProps = {}) {
  const { toasts, dismiss } = useToast();
  return (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          // Per-toast `duration` wins; fall back to Toaster default; Radix's
          // own 5000ms default kicks in if neither is set.
          duration={t.duration ?? defaultDuration}
          open={t.open}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id);
          }}
        >
          <div className="flex-1 min-w-0">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          {t.action}
          <ToastClose />
        </Toast>
      ))}
    </>
  );
}
