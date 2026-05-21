import { forwardRef, useState, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/cn';

const alertVariants = cva(
  'relative w-full rounded-polaris-md border-l-[3px] p-4 font-polaris flex gap-3',
  {
    variants: {
      variant: {
        info:    'bg-state-info-bg border-state-info text-label-normal',
        success: 'bg-state-success-bg border-state-success text-label-normal',
        warning: 'bg-state-warning-bg border-state-warning text-label-normal',
        danger:  'bg-state-error-bg border-state-error text-label-normal',
        neutral: 'bg-background-base border-line-normal text-label-normal',
      },
    },
    defaultVariants: { variant: 'info' },
  }
);

const ICONS: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, typeof Info | null> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  neutral: null,
};

const ICON_COLORS: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, string> = {
  info:    'text-state-info',
  success: 'text-state-success',
  warning: 'text-state-warning',
  danger:  'text-state-error',
  neutral: 'text-label-neutral',
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Hide the leading icon. Defaults to false. */
  hideIcon?: boolean;
  /**
   * Trailing slot — typical place for a "재시도" / "자세히 보기" CTA
   * sitting to the right of the message. Compose with `<Button size="sm">`s.
   * Renders to the LEFT of the dismiss × button when both are present.
   */
  action?: ReactNode;
  /**
   * Show a × button that hides the alert on click. Internally controlled
   * (no parent state needed). Pair with `onDismiss` to clean up parent
   * state, or use `defaultOpen={false}` to start hidden.
   */
  dismissible?: boolean;
  /** Fires after the user clicks the × button. Hide-from-DOM is automatic. */
  onDismiss?: () => void;
  /** Initial open state when `dismissible`. Default: `true`. */
  defaultOpen?: boolean;
  /** aria-label for the dismiss button. Default: "닫기". */
  dismissLabel?: string;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant,
    hideIcon = false,
    action,
    dismissible,
    onDismiss,
    defaultOpen = true,
    dismissLabel = '닫기',
    children,
    ...props
  }, ref) => {
    const v = variant ?? 'info';
    const Icon = ICONS[v];
    const [open, setOpen] = useState(defaultOpen);

    if (!open) return null;

    const handleDismiss = () => {
      setOpen(false);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant: v }), className)}
        {...props}
      >
        {!hideIcon && Icon && (
          <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', ICON_COLORS[v])} aria-hidden="true" />
        )}
        <div className="flex-1 min-w-0">{children}</div>
        {action && (
          <div className="shrink-0 flex items-center gap-polaris-3xs self-start mt-0.5">
            {action}
          </div>
        )}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={dismissLabel}
            className="shrink-0 -mt-0.5 -mr-1 inline-flex h-6 w-6 items-center justify-center rounded-polaris-sm text-label-alternative hover:bg-interaction-hover focus-visible:outline-none focus-visible:shadow-polaris-focus"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('text-polaris-body2 font-semibold mb-0.5', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-polaris-body2 text-label-neutral', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { alertVariants };
