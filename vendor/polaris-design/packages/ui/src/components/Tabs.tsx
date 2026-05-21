import { createContext, forwardRef, useContext } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../lib/cn';

/**
 * Tabs — Radix-backed tab group.
 *
 * Two visual variants:
 *   - `pill` (default) — filled background segment, `data-state=active`
 *     gets a white surface with `shadow-polaris-xs`. Compact, good for
 *     toolbar-style segmented controls inside cards.
 *   - `underline` — flat row; active tab gets a `accent-brand-normal`
 *     border-bottom. Standard page-navigation tab style. Hands off the
 *     bottom border to consumers (don't double up).
 *
 * The variant is set on `<TabsList>` and propagates to `<TabsTrigger>`
 * via context — no need to pass it through every trigger.
 */

type TabsVariant = 'pill' | 'underline';
const TabsVariantContext = createContext<TabsVariant>('pill');

export const Tabs = TabsPrimitive.Root;

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /** Visual variant. Default: `pill`. */
  variant?: TabsVariant;
}

export const TabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = 'pill', ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex items-center font-polaris',
        variant === 'pill' && 'gap-1 rounded-polaris-md bg-fill-neutral p-1',
        variant === 'underline' && 'gap-polaris-md border-b border-line-neutral',
        className
      )}
      {...props}
    />
  </TabsVariantContext.Provider>
));
TabsList.displayName = 'TabsList';

/**
 * Tab trigger button. Inherits visual variant from the surrounding
 * `<TabsList variant>` via context.
 *
 * **RSC / URL-routed tabs (v0.8.0-rc.8 confirmed pattern)** — Radix's
 * `asChild` is forwarded through props, so the trigger can render as a
 * `<Link>` for URL-driven tabs in React Server Components:
 *
 * ```tsx
 * // app/page.tsx (server component)
 * export default async function Page({ searchParams }) {
 *   const tab = searchParams.tab ?? 'docs';
 *   return (
 *     <Tabs value={tab}>
 *       <TabsList variant="underline">
 *         <TabsTrigger value="docs" asChild>
 *           <Link href="?tab=docs">문서</Link>
 *         </TabsTrigger>
 *         <TabsTrigger value="settings" asChild>
 *           <Link href="?tab=settings">설정</Link>
 *         </TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="docs">server-rendered docs</TabsContent>
 *       <TabsContent value="settings">server-rendered settings</TabsContent>
 *     </Tabs>
 *   );
 * }
 * ```
 *
 * Clicking the trigger navigates via `<Link>`, the server re-renders
 * with the new `tab` searchParam, and `<Tabs value={tab}>` reflects.
 */
export const TabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap font-medium font-polaris transition-colors',
        'focus-visible:outline-none focus-visible:shadow-polaris-focus',
        'disabled:opacity-50 disabled:pointer-events-none',
        // Pill variant — filled segment with active surface lift.
        variant === 'pill' && [
          'rounded-polaris-sm px-3 py-1.5 text-polaris-body2',
          'text-label-neutral hover:text-label-normal',
          'data-[state=active]:bg-background-base data-[state=active]:text-label-normal data-[state=active]:shadow-polaris-xs',
        ],
        // Underline variant — flat row, active gets a brand bottom-border.
        // -mb-px aligns the active border with TabsList's bottom border so
        // they fuse into one underline (rather than stacking 2px).
        variant === 'underline' && [
          'relative -mb-px px-1 pb-3 pt-1 text-polaris-body2',
          'text-label-neutral hover:text-label-normal',
          'border-b-2 border-transparent',
          'data-[state=active]:border-accent-brand-normal data-[state=active]:text-label-normal',
        ],
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3 focus-visible:outline-none focus-visible:shadow-polaris-focus rounded-polaris-md',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
