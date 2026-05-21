/**
 * Ribbon — toolbar pattern for editor-style products (Office docs, MD editor,
 * spreadsheet, presentation, PDF tools). Compact density, icon-first buttons,
 * grouped layout with vertical separators, optional tabs across the top.
 *
 * Composable primitives — use just what you need:
 *
 * Layout:
 * - `<Ribbon>` — root container (no tabs needed for single-panel toolbars)
 * - `<RibbonTabs>` / `<RibbonTabList>` / `<RibbonTab>` / `<RibbonContent>` — tabbed mode
 * - `<RibbonGroup>` — group of related controls with optional bottom label
 * - `<RibbonStack>` — vertical column inside a group (e.g. 2-row icon clusters)
 * - `<RibbonRow>` — horizontal row inside a `RibbonStack`
 * - `<RibbonSeparator>` — full-height divider between groups
 * - `<RibbonRowDivider>` — short divider between clusters within a single row
 *
 * Controls (use `size="sm"` for icon-only, `size="lg"` for icon-over-label):
 * - `<RibbonButton>` — plain button. Labels accept `\n` for line breaks at lg.
 * - `<RibbonMenuButton>` — single button that opens a dropdown (no main action)
 * - `<RibbonSplitButton>` — main action + dropdown chevron. At lg the chevron
 *    becomes a strip below the label (Office paste-button pattern).
 * - `<RibbonToggleGroup>` / `<RibbonToggleItem>` — single/multiple selection toggles
 *
 * Tab-less single-panel example (MD editor):
 * ```tsx
 * <Ribbon>
 *   <div className="flex items-stretch px-1 py-1">
 *     <RibbonGroup label="서식">
 *       <RibbonToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
 *         <RibbonToggleItem value="bold" icon={<Bold />} tooltip="굵게 (⌘B)" />
 *         <RibbonToggleItem value="italic" icon={<Italic />} tooltip="기울임 (⌘I)" />
 *       </RibbonToggleGroup>
 *     </RibbonGroup>
 *   </div>
 * </Ribbon>
 * ```
 *
 * Tabbed example (Office-style):
 * ```tsx
 * <Ribbon>
 *   <RibbonTabs value={tab} onValueChange={setTab}>
 *     <RibbonTabList>
 *       <RibbonTab value="home">홈</RibbonTab>
 *       <RibbonTab value="insert">삽입</RibbonTab>
 *     </RibbonTabList>
 *     <RibbonContent value="home">…</RibbonContent>
 *     <RibbonContent value="insert">…</RibbonContent>
 *   </RibbonTabs>
 * </Ribbon>
 * ```
 */
import { forwardRef, type ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { Slot } from '@radix-ui/react-slot';
import { ChevronDownIcon } from '../icons';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { SimpleTooltip } from '../components/Tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../components/DropdownMenu';

/** Wrap children in a span with `whitespace-pre-line` so `\n` in labels
 *  produces a hard line break and the text stays centered (`size="lg"`). */
const LgLabel = ({ children }: { children: ReactNode }) => (
  <span className="leading-tight whitespace-pre-line text-center">{children}</span>
);

/** Chevron rendered next to / below a label to signal a dropdown trigger. */
const TriggerChevron = ({ stacked = false }: { stacked?: boolean }) => (
  <ChevronDownIcon
    size={12}
    className={cn('shrink-0 text-label-alternative', stacked ? 'mt-0' : 'ml-0.5')}
    aria-hidden="true"
  />
);

/* ----- Root ----- */

export const Ribbon = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      // `data-polaris-ribbon` — stable selector for e2e snapshots and any
      // host that needs to grab the ribbon root without depending on
      // tailwind class strings (those churn between releases — see
      // visual.spec.ts breakage at v0.7→v0.8 transition).
      data-polaris-ribbon=""
      className={cn(
        'font-polaris text-label-normal bg-background-base border-b border-line-neutral',
        className
      )}
      {...props}
    />
  )
);
Ribbon.displayName = 'Ribbon';

/* ----- Tabs (Office-style: 파일 / 홈 / 삽입 / ...) ----- */

export const RibbonTabs = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, activationMode = 'manual', ...props }, ref) => (
  // `manual` matches Office's actual ribbon a11y pattern: arrow keys move
  // focus across tabs without immediately switching the visible panel.
  // Screen-reader users can survey tabs without losing their current
  // panel; pressing Space/Enter then commits. Pass activationMode="automatic"
  // explicitly to opt back into Radix's default.
  <TabsPrimitive.Root
    ref={ref}
    activationMode={activationMode}
    className={cn('flex flex-col', className)}
    {...props}
  />
));
RibbonTabs.displayName = 'RibbonTabs';

export const RibbonTabList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Tabs can overflow on narrow viewports (Office tabs are 8 items).
      // Allow horizontal scroll, hide the scrollbar on md+ where the
      // tabs usually fit, leave a thin native scrollbar on mobile.
      'flex items-center gap-4 px-4 h-9 border-b border-line-neutral',
      'overflow-x-auto overflow-y-hidden',
      'md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden',
      className
    )}
    {...props}
  />
));
RibbonTabList.displayName = 'RibbonTabList';

export const RibbonTab = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex items-center px-1 py-1.5 text-polaris-body2 text-label-alternative transition-colors',
      'hover:text-label-normal',
      'focus-visible:outline-none focus-visible:shadow-polaris-focus',
      // Active state: color shift + the brand-color underline accent below.
      // No bold — Office's actual ribbon doesn't bold the active tab label
      // (the underline + label-normal color is enough to indicate active).
      'data-[state=active]:text-label-normal',
      'data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:bg-accent-brand-normal',
      className
    )}
    {...props}
  />
));
RibbonTab.displayName = 'RibbonTab';

export const RibbonContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Radix sets `hidden` attribute on inactive panels, but tailwind's
      // `flex` would otherwise win and the inactive panel would still claim
      // its padding box. Force display:none when inactive so the ribbon
      // height collapses to just the active panel.
      'data-[state=inactive]:hidden',
      // Hide the horizontal scrollbar visually on desktop — Office ribbons
      // hide it too, and on wide screens the controls usually fit.
      //
      // `overflow-y-clip` is required because CSS spec promotes
      // `overflow-y: visible` to `auto` whenever `overflow-x` is non-visible.
      // Without it, the panel grows a stray vertical scrollbar whenever any
      // child briefly exceeds panel height.
      //
      // `min-h-20` (80px = lg button 64 + py-1 padding 8 + slack 8) keeps the
      // panel the same height across tabs even when one tab has a 3-row sm
      // stack (~72px) and others only have lg buttons (~64px). Without this
      // the active panel grows to fit its tallest group, so swapping tabs
      // visibly nudges the ribbon height.
      'flex items-stretch gap-0 px-1 py-1 min-h-20 overflow-x-auto overflow-y-clip',
      // On md+ viewports hide the scrollbar (controls usually fit). Below
      // md the controls almost always overflow on phones / split panes —
      // we leave the browser's native thin scrollbar visible so users
      // get a clear affordance to scroll horizontally instead of the
      // ribbon silently clipping.
      'md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden',
      '[scrollbar-width:thin]',
      'focus-visible:outline-none',
      className
    )}
    {...props}
  />
));
RibbonContent.displayName = 'RibbonContent';

/* ----- Group + Separator ----- */

export interface RibbonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional small label rendered below the group items (Office-style). */
  label?: ReactNode;
}

export const RibbonGroup = forwardRef<HTMLDivElement, RibbonGroupProps>(
  ({ className, label, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-stretch shrink-0 px-1',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-0 flex-1 min-h-16">{children}</div>
      {label && (
        <div className="mt-0.5 text-center text-polaris-caption1 font-normal text-label-alternative leading-tight whitespace-pre-line">
          {label}
        </div>
      )}
    </div>
  )
);
RibbonGroup.displayName = 'RibbonGroup';

/**
 * Stack of 2-3 small buttons (e.g. 잘라내기 / 복사 / 서식복사 next to a large
 * paste button). Use inside `RibbonGroup` to lay items in a vertical column
 * matching Office ribbon density.
 *
 * Children are left-aligned (icon → label) — matches Office where a stack
 * of secondary actions reads top-to-bottom from a common x-position.
 */
export const RibbonStack = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-stretch gap-0',
        '[&_button]:justify-start',
        className
      )}
      {...props}
    />
  )
);
RibbonStack.displayName = 'RibbonStack';

/**
 * Horizontal row of small buttons. Use inside `RibbonStack` to compose a
 * group with multiple rows of icon buttons (Office's classic 2-row format
 * inside a single group).
 */
export const RibbonRow = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-0', className)}
      {...props}
    />
  )
);
RibbonRow.displayName = 'RibbonRow';

export const RibbonSeparator = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      className={cn('mx-0 my-1 w-px shrink-0 bg-line-neutral', className)}
      {...props}
    />
  )
);
RibbonSeparator.displayName = 'RibbonSeparator';

/**
 * Short vertical divider used WITHIN a `RibbonRow` to separate button
 * clusters in the same row. Distinct from `RibbonSeparator` (which spans
 * the full ribbon height to divide groups). Office's bottom-row pattern of
 * `B I U S | X₁ X² | A_ A_ | A▢ A_ E` uses this between clusters.
 */
export const RibbonRowDivider = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      className={cn('mx-1 h-4 w-px shrink-0 bg-line-neutral self-center', className)}
      {...props}
    />
  )
);
RibbonRowDivider.displayName = 'RibbonRowDivider';

/* ----- RibbonButton ----- */

const ribbonButtonStyles = cva(
  cn(
    'inline-flex items-center justify-center gap-1 rounded-polaris-sm text-label-normal transition-colors shrink-0',
    'hover:bg-accent-brand-normal-subtle',
    'focus-visible:outline-none focus-visible:shadow-polaris-focus',
    'disabled:opacity-40 disabled:pointer-events-none aria-disabled:opacity-40 aria-disabled:pointer-events-none',
    'data-[state=on]:bg-accent-brand-normal-subtle data-[state=on]:text-accent-brand-normal'
  ),
  {
    variants: {
      size: {
        sm: 'h-6 min-w-6 px-0.5 text-polaris-body2',
        md: 'h-8 min-w-8 px-2 text-polaris-body2',
        // lg label is 12px regular — `text-polaris-caption1` ships with
        // weight 700 per the type spec, but Office's lg ribbon buttons
        // (붙여넣기 / 페이지 설정 / …) render labels in regular weight,
        // so we explicitly override with `font-normal`.
        lg: 'flex-col h-16 min-w-14 px-1 py-1 text-polaris-caption1 font-normal gap-0.5',
      },
    },
    defaultVariants: { size: 'sm' },
  }
);

export interface RibbonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ribbonButtonStyles> {
  /** Leading icon. For `size="lg"` it's stacked above the label. */
  icon?: ReactNode;
  /** Optional tooltip. Useful when the button is icon-only. */
  tooltip?: ReactNode;
  /** Render as the child element (e.g. for `<Link>` wrap). */
  asChild?: boolean;
}

/** Icon-only buttons (no visible label) need an accessible name. Tooltips
 *  are visual-only — when the consumer didn't pass an explicit `aria-label`
 *  and the tooltip is a string, we use it as the accessible name. JSX
 *  tooltips still require the consumer to set `aria-label` explicitly. */
function inferAriaLabel(
  children: ReactNode,
  tooltip: ReactNode,
  explicit: string | undefined
): string | undefined {
  if (explicit) return explicit;
  if (children) return undefined;
  return typeof tooltip === 'string' ? tooltip : undefined;
}

export const RibbonButton = forwardRef<HTMLButtonElement, RibbonButtonProps>(
  ({ className, size, icon, tooltip, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const ariaLabel = inferAriaLabel(children, tooltip, props['aria-label']);
    const inner = (
      // eslint-disable-next-line @polaris/prefer-polaris-component -- primitive layer
      <Comp
        ref={ref as never}
        type={asChild ? undefined : 'button'}
        className={cn(ribbonButtonStyles({ size }), className)}
        {...props}
        aria-label={ariaLabel}
      >
        {icon}
        {children && (size === 'lg' ? <LgLabel>{children}</LgLabel> : <span>{children}</span>)}
      </Comp>
    );
    if (tooltip) {
      return <SimpleTooltip label={tooltip}>{inner}</SimpleTooltip>;
    }
    return inner;
  }
);
RibbonButton.displayName = 'RibbonButton';

/* ----- RibbonMenuButton ----- */

export interface RibbonMenuButtonProps extends Omit<RibbonButtonProps, 'children' | 'onClick'> {
  children?: ReactNode;
  /** Dropdown content (typically `<DropdownMenuItem>` children). */
  menu: ReactNode;
}

/**
 * Single button that opens a dropdown when clicked. Unlike `RibbonSplitButton`
 * there is no separate main action — the entire button IS the menu trigger.
 * Office uses this for option-style controls (여백, 용지 방향, 크기, 단, …).
 * At `size="lg"` the chevron renders below the label.
 */
export const RibbonMenuButton = forwardRef<HTMLButtonElement, RibbonMenuButtonProps>(
  ({ size = 'lg', icon, children, menu, className, ...props }, ref) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <RibbonButton ref={ref} size={size} icon={icon} className={className} {...props}>
          {children}
          <TriggerChevron stacked={size === 'lg'} />
        </RibbonButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">{menu}</DropdownMenuContent>
    </DropdownMenu>
  )
);
RibbonMenuButton.displayName = 'RibbonMenuButton';

/* ----- RibbonSplitButton ----- */

export interface RibbonSplitButtonProps extends Omit<RibbonButtonProps, 'children'> {
  /** Main action button label / content. */
  children?: ReactNode;
  /** Dropdown panel content. */
  menu: ReactNode;
  /** Tooltip for the dropdown chevron specifically. */
  menuTooltip?: ReactNode;
  /** aria-label for the chevron when there's no visible label. */
  menuLabel?: string;
}

/**
 * Main action + dropdown chevron, with the two halves hovering independently
 * (Office pattern). Layout adapts to size:
 * - `sm` / `md` — horizontal: `[icon][▾]`
 * - `lg`         — vertical: icon+label on top, chevron strip below
 *
 * Use this when there's a meaningful default action (paste, strikethrough,
 * find) AND alternative options behind a dropdown. If there's no main action,
 * use `RibbonMenuButton` instead.
 */
export const RibbonSplitButton = forwardRef<HTMLButtonElement, RibbonSplitButtonProps>(
  (
    {
      className,
      size = 'sm',
      icon,
      tooltip,
      children,
      menu,
      menuTooltip,
      menuLabel = '더보기',
      onClick,
      // Pulled out so we can apply it to BOTH the main button AND the menu
      // trigger — otherwise a `disabled` split button still opens its menu.
      disabled,
      ...props
    },
    ref
  ) => {
    const chevronIcon = <ChevronDownIcon size={12} aria-hidden="true" />;

    // When disabled, skip mounting `DropdownMenu` entirely. Radix's
    // `DropdownMenuTrigger asChild` doesn't always honor a child button's
    // native `disabled` (it intercepts pointer events earlier), so the
    // menu could still open. Rendering a plain disabled chevron button
    // is the cleanest guarantee.
    if (size === 'lg') {
      const lgMain = (
        <RibbonButton
          ref={ref}
          size="lg"
          icon={icon}
          tooltip={tooltip}
          onClick={onClick}
          disabled={disabled}
          className="h-12 rounded-b-none pb-0"
          {...props}
        >
          {children}
        </RibbonButton>
      );
      return (
        <div className={cn('inline-flex flex-col items-stretch shrink-0 rounded-polaris-sm', className)}>
          {lgMain}
          {disabled ? (
            <RibbonButton
              size="sm"
              tooltip={menuTooltip}
              aria-label={menuLabel}
              disabled
              className="h-4 min-w-0 px-0 py-0 rounded-t-none self-stretch"
              icon={chevronIcon}
            />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <RibbonButton
                  size="sm"
                  tooltip={menuTooltip}
                  aria-label={menuLabel}
                  className="h-4 min-w-0 px-0 py-0 rounded-t-none self-stretch"
                  icon={chevronIcon}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">{menu}</DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    }
    const smMain = (
      <RibbonButton
        ref={ref}
        size={size}
        icon={icon}
        tooltip={tooltip}
        onClick={onClick}
        disabled={disabled}
        className="rounded-r-none"
        {...props}
      >
        {children}
      </RibbonButton>
    );
    return (
      <div className={cn('inline-flex rounded-polaris-sm', className)}>
        {smMain}
        {disabled ? (
          <RibbonButton
            size={size}
            tooltip={menuTooltip}
            aria-label={menuLabel}
            disabled
            className="rounded-l-none min-w-0 px-0.5"
            icon={chevronIcon}
          />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <RibbonButton
                size={size}
                tooltip={menuTooltip}
                aria-label={menuLabel}
                className="rounded-l-none min-w-0 px-0.5"
                icon={chevronIcon}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">{menu}</DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }
);
RibbonSplitButton.displayName = 'RibbonSplitButton';

/* ----- ToggleGroup / ToggleItem -----
 *
 * Use for mutually-exclusive (`type="single"`) or independent (`type="multiple"`)
 * toggleable controls — alignment, text marks (B/I/U), view modes. The "on"
 * state uses the brand tint via `data-[state=on]` in the shared button cva.
 *
 * Example (paragraph alignment):
 * ```tsx
 * <RibbonToggleGroup type="single" value={align} onValueChange={(v) => v && setAlign(v)}>
 *   <RibbonToggleItem value="left" icon={<AlignLeft />} tooltip="왼쪽 정렬" />
 *   <RibbonToggleItem value="center" icon={<AlignCenter />} tooltip="가운데 정렬" />
 * </RibbonToggleGroup>
 * ```
 */

type ToggleGroupRootProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>;

export const RibbonToggleGroup = forwardRef<HTMLDivElement, ToggleGroupRootProps>(
  ({ className, ...props }, ref) => {
    // Radix's Root is a discriminated union (single vs multiple). Cast to a
    // plain forwardRef so we can pass through props without TS narrowing here.
    const Root = ToggleGroupPrimitive.Root as React.ForwardRefExoticComponent<
      ToggleGroupRootProps & React.RefAttributes<HTMLDivElement>
    >;
    return <Root ref={ref} className={cn('inline-flex items-center gap-0', className)} {...props} />;
  }
);
RibbonToggleGroup.displayName = 'RibbonToggleGroup';

export interface RibbonToggleItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof ribbonButtonStyles> {
  /** Leading icon. For `size="lg"` it's stacked above the label. */
  icon?: ReactNode;
  /** Optional tooltip. Useful when icon-only. */
  tooltip?: ReactNode;
}

export const RibbonToggleItem = forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  RibbonToggleItemProps
>(({ className, size, icon, tooltip, children, ...props }, ref) => {
  const ariaLabel = inferAriaLabel(children, tooltip, props['aria-label']);
  const inner = (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(ribbonButtonStyles({ size }), className)}
      {...props}
      aria-label={ariaLabel}
    >
      {icon}
      {children && (size === 'lg' ? <LgLabel>{children}</LgLabel> : <span>{children}</span>)}
    </ToggleGroupPrimitive.Item>
  );
  if (tooltip) {
    return <SimpleTooltip label={tooltip}>{inner}</SimpleTooltip>;
  }
  return inner;
});
RibbonToggleItem.displayName = 'RibbonToggleItem';

/** Exposed for downstream packages building custom ribbon-like controls
 *  (e.g. a checkable toggle that isn't part of a ToggleGroup). */
export { ribbonButtonStyles };
