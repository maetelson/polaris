import { forwardRef, type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../lib/cn';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Leading icon. Defaults to `<Inbox />`. Pass `null` to hide. */
  icon?: ReactNode | null;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    const resolvedIcon = icon === undefined ? <Inbox /> : icon;
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center font-polaris',
          'rounded-polaris-lg border border-dashed border-line-normal bg-fill-neutral',
          'px-6 py-12 gap-3',
          className
        )}
        {...props}
      >
        {resolvedIcon && (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-polaris-pill bg-fill-neutral text-label-alternative [&>svg]:h-6 [&>svg]:w-6">
            {resolvedIcon}
          </div>
        )}
        <div className="flex flex-col gap-1 max-w-md">
          <h3 className="text-polaris-heading4 text-label-normal">{title}</h3>
          {description && (
            <p className="text-polaris-body2 text-label-neutral">{description}</p>
          )}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';
