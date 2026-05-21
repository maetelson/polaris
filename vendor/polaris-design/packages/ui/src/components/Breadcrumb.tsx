import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRightIcon } from '../icons';
import { cn } from '../lib/cn';

export const Breadcrumb = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn('font-polaris text-polaris-body2', className)}
      {...props}
    />
  )
);
Breadcrumb.displayName = 'Breadcrumb';

export const BreadcrumbList = forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn('flex flex-wrap items-center gap-1.5 text-label-alternative', className)}
      {...props}
    />
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

export const BreadcrumbItem = forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        className={cn('text-label-neutral hover:text-label-normal transition-colors', className)}
        {...props}
      />
    );
  }
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

export const BreadcrumbPage = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-label-normal font-medium', className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('text-label-alternative [&>svg]:h-3.5 [&>svg]:w-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRightIcon size={16} />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';
