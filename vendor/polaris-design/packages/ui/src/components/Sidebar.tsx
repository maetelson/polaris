import { forwardRef, createContext, useContext } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

type SidebarContextValue = { collapsed?: boolean };
const SidebarContext = createContext<SidebarContextValue>({});

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Collapse to icon-only mode (4rem wide). */
  collapsed?: boolean;
  /** Width when expanded. Defaults to 15rem. */
  width?: string;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, width = '15rem', style, children, ...props }, ref) => {
    return (
      <SidebarContext.Provider value={{ collapsed }}>
        <aside
          ref={ref}
          aria-label="Sidebar"
          className={cn(
            'flex flex-col h-full shrink-0 bg-background-base border-r border-line-neutral',
            'transition-[width] duration-150',
            className
          )}
          style={{ width: collapsed ? '4rem' : width, ...style }}
          {...props}
        >
          {children}
        </aside>
      </SidebarContext.Provider>
    );
  }
);
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-3 py-4 border-b border-line-neutral', className)} {...props} />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-y-auto py-2', className)} {...props} />
  )
);
SidebarBody.displayName = 'SidebarBody';

export const SidebarFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-3 py-3 border-t border-line-neutral', className)} {...props} />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ className, title, children, ...props }, ref) => {
    const { collapsed } = useContext(SidebarContext);
    return (
      <div ref={ref} className={cn('py-1.5', className)} {...props}>
        {title && !collapsed && (
          <div className="px-3 py-1 text-polaris-caption1 font-semibold uppercase tracking-wider text-label-alternative">
            {title}
          </div>
        )}
        <ul className="flex flex-col gap-0.5 px-2">{children}</ul>
      </div>
    );
  }
);
SidebarSection.displayName = 'SidebarSection';

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Highlight this item as the active route. */
  active?: boolean;
  /** Render the underlying element provided as children (e.g. <Link>) instead of <button>. */
  asChild?: boolean;
  /** Icon rendered before the label (typically a 16px lucide icon). */
  icon?: React.ReactNode;
  /** Label text (or any node) shown next to the icon. */
  label: React.ReactNode;
  /** Trailing content (badge, count, etc.) shown at the right edge. */
  trailing?: React.ReactNode;
}

export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, active, asChild, icon, label, trailing, children, ...props }, ref) => {
    const { collapsed } = useContext(SidebarContext);
    const Comp = asChild ? Slot : 'button';

    return (
      <li>
        <Comp
          ref={ref}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-polaris-md px-2.5 py-1.5',
            'text-polaris-body2 font-medium font-polaris text-label-neutral',
            'hover:bg-accent-brand-normal-subtle hover:text-label-normal transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-brand-normal',
            active && 'bg-accent-brand-normal-subtle text-accent-brand-normal',
            collapsed && 'justify-center',
            className
          )}
          {...props}
        >
          {icon && <span className="shrink-0 inline-flex h-5 w-5 items-center justify-center">{icon}</span>}
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left">{label}</span>
              {trailing && <span className="shrink-0">{trailing}</span>}
            </>
          )}
          {children}
        </Comp>
      </li>
    );
  }
);
SidebarItem.displayName = 'SidebarItem';
