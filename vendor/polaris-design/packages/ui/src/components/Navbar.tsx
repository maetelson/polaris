import { forwardRef, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

export const Navbar = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'flex items-center gap-4 h-14 px-4',
        'bg-background-base border-b border-line-neutral',
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
);
Navbar.displayName = 'Navbar';

export interface NavbarBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the child element instead of `<div>`. Useful for Link wrapping. */
  asChild?: boolean;
}

export const NavbarBrand = forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return <Comp ref={ref} className={cn('flex items-center gap-2 shrink-0', className)} {...props} />;
  }
);
NavbarBrand.displayName = 'NavbarBrand';

export const NavbarNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} className={cn('flex items-center gap-1 flex-1 min-w-0 overflow-x-auto', className)} {...props} />
  )
);
NavbarNav.displayName = 'NavbarNav';

export const NavbarActions = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-2 shrink-0 ml-auto', className)} {...props} />
  )
);
NavbarActions.displayName = 'NavbarActions';

/* ================================================================== *
 * NavbarItem — single nav link with active state             v0.7.7
 * ================================================================== *
 *
 * Mirrors `<SidebarItem>`'s API so navbar/sidebar feel symmetric:
 *   - `active`     — explicit boolean from the consumer's router
 *                    (Next.js `usePathname`, React Router `useMatch`, etc.)
 *   - `asChild`    — wrap a `<Link>` / `<a>` so the entire row is one
 *                    accessible click target
 *   - `icon`       — leading icon slot (16-20px)
 *   - `href`       — convenience: when set without `asChild`, renders a
 *                    plain `<a href>` for static / multi-page apps that
 *                    don't have a routing component to wrap
 *
 * Active visual matches SidebarItem (DESIGN.md §4 Navigation):
 * `bg-accent-brand-normal-subtle` + `text-accent-brand-normal`. Use
 * the *brand-tinted background*, not just colored text — color alone
 * doesn't satisfy WCAG 1.4.1 for indicating navigation state.
 *
 * Active matching is the consumer's responsibility — the router /
 * pathname signal varies by framework, and trying to detect "starts-
 * with /docs" inside the component would couple us to a specific
 * router. Pass `active={pathname.startsWith('/docs')}` from the call
 * site instead.
 *
 * @example Next.js App Router
 * ```tsx
 * 'use client';
 * import { usePathname } from 'next/navigation';
 * import Link from 'next/link';
 * import { Navbar, NavbarBrand, NavbarNav, NavbarItem, NavbarActions } from '@polaris/ui';
 *
 * export function AppNavbar() {
 *   const pathname = usePathname();
 *   const isActive = (href: string, exact = false) =>
 *     exact ? pathname === href : pathname.startsWith(href);
 *
 *   return (
 *     <Navbar>
 *       <NavbarBrand>...</NavbarBrand>
 *       <NavbarNav>
 *         <NavbarItem asChild active={isActive('/dashboard', true)}>
 *           <Link href="/dashboard">대시보드</Link>
 *         </NavbarItem>
 *         <NavbarItem asChild active={isActive('/docs')}>
 *           <Link href="/docs">문서</Link>
 *         </NavbarItem>
 *       </NavbarNav>
 *       <NavbarActions>...</NavbarActions>
 *     </Navbar>
 *   );
 * }
 * ```
 *
 * @example Static `<a>` (no router)
 * ```tsx
 * <NavbarItem href="/dashboard" active={pathname === '/dashboard'}>대시보드</NavbarItem>
 * ```
 */
export interface NavbarItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Highlight as the current route. Sets `aria-current="page"` and brand tint. */
  active?: boolean;
  /** Render the child element instead of the default `<button>`/`<a>`. Use for Link wrapping. */
  asChild?: boolean;
  /** Leading icon (16-20px). */
  icon?: ReactNode;
  /** Convenience: when set without `asChild`, renders an `<a href>` instead of `<button>`. */
  href?: string;
  children?: ReactNode;
}

const NAV_ITEM_CLASSES = cn(
  'inline-flex items-center gap-polaris-2xs rounded-polaris-md px-3 py-1.5',
  'text-polaris-body2 font-medium font-polaris text-label-neutral',
  'hover:bg-accent-brand-normal-subtle hover:text-label-normal transition-colors',
  'focus-visible:outline-none focus-visible:shadow-polaris-focus',
  'no-underline'
);

export const NavbarItem = forwardRef<HTMLElement, NavbarItemProps>(
  ({ className, active, asChild, icon, href, children, ...props }, ref) => {
    const ariaCurrent = active ? 'page' : undefined;
    const finalClass = cn(
      NAV_ITEM_CLASSES,
      active && 'bg-accent-brand-normal-subtle text-accent-brand-normal',
      className
    );

    if (asChild) {
      // Pure pass-through: consumer's child becomes the element via Radix Slot.
      // Icon slot is intentionally ignored here — Slot requires a single React
      // element child, and merging a wrapper would violate that contract.
      // Consumers wanting an icon should place it INSIDE their child element.
      // (Mirrors the Disclosure asChild branching pattern from v0.7.4.)
      if (icon && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          '[NavbarItem] icon prop is ignored when asChild is set — Slot requires a single child. Place the icon inside your child element instead.'
        );
      }
      return (
        <Slot
          ref={ref as never}
          aria-current={ariaCurrent}
          className={finalClass}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    // Element selection: href → <a>, otherwise <button>.
    // The base prop type is `ButtonHTMLAttributes` for the common button
    // case; when `href` is set we cast to render as `<a>`. Anchor-only
    // attributes (`download`, `hreflang`, `target`, ...) are still settable
    // via spread — they just aren't in the static prop autocomplete. For
    // full anchor type-safety, use `asChild` + your router's Link component.
    if (href) {
      return (
        // eslint-disable-next-line @polaris/prefer-polaris-component -- primitive layer
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-current={ariaCurrent}
          className={finalClass}
          {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {icon && (
            <span className="shrink-0 inline-flex items-center [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
        </a>
      );
    }

    return (
      // eslint-disable-next-line @polaris/prefer-polaris-component -- primitive layer
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-current={ariaCurrent}
        className={finalClass}
        {...props}
      >
        {icon && (
          <span className="shrink-0 inline-flex items-center [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);
NavbarItem.displayName = 'NavbarItem';
