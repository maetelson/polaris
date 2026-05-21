import { Children, forwardRef, isValidElement, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { cn } from '../lib/cn';

/**
 * Stat — KPI / metric tile.
 *
 * Use for the top-of-dashboard counters that summarize an entity:
 * "조회수 1,234 / +12%". Three slots, all optional except `value`:
 *
 *   - `label`     — what the number measures (e.g. "조회수")
 *   - `value`     — the headline number (string or node — pre-format on the
 *                   call site so locale/units stay your concern)
 *   - `delta`     — change indicator (e.g. "+12%"); `tone` colors it
 *   - `icon`      — leading icon (16-24 px)
 *   - `helper`    — small text below the value (e.g. comparison window)
 *
 * Tones for the `delta` indicator:
 *   - `neutral`  — `label-neutral` (default)
 *   - `positive` — `state-success`  (e.g. "+12%")
 *   - `negative` — `state-error`    (e.g. "-3%")
 *   - `accent`   — `accent-brand-normal`
 *
 * Stat does NOT render its own card. Wrap in a `<Card>` (or compose
 * a grid of Stats) to get the surface — keeps composition flexible
 * for dashboard layouts that need their own border/spacing.
 *
 * Always pair the visual delta with a sign (+/-) so negative values
 * are conveyed via more than the red color alone (WCAG 1.4.1).
 *
 * @example
 * ```tsx
 * <Card variant="padded">
 *   <Stat label="조회수" value="1,234" delta="+12%" deltaVariant="positive" />
 * </Card>
 * ```
 *
 * @example Grid of stats
 * ```tsx
 * <div className="grid grid-cols-2 md:grid-cols-4 gap-polaris-md">
 *   <Card variant="padded"><Stat label="조회" value={views} /></Card>
 *   <Card variant="padded"><Stat label="고유 방문" value={unique} /></Card>
 *   <Card variant="padded"><Stat label="다운로드" value={downloads} /></Card>
 *   <Card variant="padded"><Stat label="차단" value={denied} deltaVariant="negative" /></Card>
 * </div>
 * ```
 */

const deltaVariants = cva(
  'inline-flex items-center gap-polaris-4xs text-polaris-helper font-medium',
  {
    variants: {
      variant: {
        neutral:  'text-label-neutral',
        positive: 'text-state-success',
        negative: 'text-state-error',
        accent:   'text-accent-brand-normal',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);

export interface StatProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What the value measures (e.g. "조회수"). */
  label: ReactNode;
  /**
   * The headline number.
   *
   * - **`number`** (or `bigint`): formatted via `Intl.NumberFormat` with
   *   the user's locale (browser `navigator.language` — `ko-KR` etc.).
   *   `1234` → `"1,234"` automatically. Fine-tune via `numberFormat`.
   * - **`ReactNode`** (string / JSX): rendered as-is. Pre-format yourself
   *   when you need locale-aware formatting outside of the default.
   *
   * Why both: the default behavior covers ~90% of dashboards (raw count
   * → comma-formatted string). Custom currency / percentage / abbreviated
   * (`1.2M`) cases stay flexible by passing a string.
   */
  value: ReactNode | number | bigint;
  /**
   * Custom `Intl.NumberFormat` options applied when `value` is a number.
   * Ignored when `value` is a string/ReactNode.
   * @example `{ style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }`
   * @example `{ style: 'percent', maximumFractionDigits: 1 }`
   */
  numberFormat?: Intl.NumberFormatOptions;
  /** BCP-47 locale for `numberFormat`. Default: `undefined` → browser default. */
  numberLocale?: string;
  /** Change indicator (e.g. "+12%"). Color via `deltaVariant`. */
  delta?: ReactNode;
  /** Color tone for `delta`. Default: `"neutral"`. */
  deltaVariant?: VariantProps<typeof deltaVariants>['variant'];
  /** Leading icon (16-24px). Renders to the left of the label. */
  icon?: ReactNode;
  /** Small text below the value (e.g. comparison window: "지난 7일 기준"). */
  helper?: ReactNode;
  /**
   * Render a Skeleton placeholder in place of the value (and delta, if
   * present). The label / icon / helper still render so the tile keeps
   * its shape and labeled structure during async fetches. Use this
   * during initial data-load — once data arrives, drop `loading={false}`.
   */
  loading?: boolean;
}

/** Format a numeric `value` via `Intl.NumberFormat`; pass anything else through.
 *  We check for `number | bigint` rather than typeof === 'number' so that
 *  TypeScript narrowing aligns with the union in `StatProps['value']`. */
function formatStatValue(
  value: ReactNode | number | bigint,
  options?: Intl.NumberFormatOptions,
  locale?: string
): ReactNode {
  if (typeof value === 'number' || typeof value === 'bigint') {
    try {
      return new Intl.NumberFormat(locale, options).format(value);
    } catch {
      // Bad locale / bad options — fall back to raw string.
      return String(value);
    }
  }
  return value;
}

export const Stat = forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, numberFormat, numberLocale, delta, deltaVariant, icon, helper, loading, ...props }, ref) => {
    const formattedValue = formatStatValue(value, numberFormat, numberLocale);
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-polaris-3xs font-polaris', className)}
        {...props}
      >
        <div className="flex items-center gap-polaris-3xs text-polaris-body2 text-label-neutral">
          {icon && (
            <span className="inline-flex items-center justify-center text-label-alternative [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
              {icon}
            </span>
          )}
          <span>{label}</span>
        </div>
        {loading ? (
          // Heading-1 sized skeleton (≈ 32px line) to keep the tile height
          // stable when data lands. Delta gets a pill skeleton next to it.
          <div className="flex items-baseline gap-polaris-2xs">
            <Skeleton shape="bare" className="h-8 w-24 rounded-polaris-sm" />
            {delta !== undefined && (
              <Skeleton shape="bare" className="h-4 w-10 rounded-polaris-pill" />
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-polaris-2xs">
            <span className="text-polaris-heading1 text-label-normal tabular-nums">{formattedValue}</span>
            {delta && (
              <span className={cn(deltaVariants({ variant: deltaVariant }))}>{delta}</span>
            )}
          </div>
        )}
        {helper && (
          <p className="text-polaris-helper text-label-alternative">{helper}</p>
        )}
      </div>
    );
  }
);
Stat.displayName = 'Stat';

/* ================================================================== *
 * StatGroup — equal-height KPI grid                          v0.7.8
 * ================================================================== *
 *
 * Most dashboards reach for the same shape: 2-4 KPI tiles in a row,
 * each `<Card><Stat /></Card>`, all the same height. Without StatGroup
 * each consumer wires `grid grid-cols-{n} gap-polaris-md` + `<Card>`
 * around every Stat by hand, and *equal height* requires CSS care
 * (auto-rows-fr or items-stretch + h-full).
 *
 * `<StatGroup>` is a thin wrapper that:
 *   1. Lays out children as a responsive grid (auto cols × `cols`, mobile
 *      stacks to 1 → 2 columns)
 *   2. Wraps each *direct* `<Stat>` child in a `<Card variant="padded">`
 *      with `h-full` so all tiles align even when one has `helper` text
 *      and another doesn't
 *   3. Skips wrapping for non-`Stat` children (custom card content stays
 *      as-is)
 *
 * @example 4 KPI tiles
 * ```tsx
 * <StatGroup cols={4}>
 *   <Stat label="조회수" value={1234} delta="+12%" deltaVariant="positive" />
 *   <Stat label="고유 방문" value={892} />
 *   <Stat label="다운로드" value={148} icon={<DownloadIcon />} />
 *   <Stat label="차단" value={7} helper="지난 7일" />
 * </StatGroup>
 * ```
 *
 * @example 2 KPIs + 1 custom card
 * ```tsx
 * <StatGroup cols={3}>
 *   <Stat label="총 매출" value={3500000} numberFormat={{ style: 'currency', currency: 'KRW' }} />
 *   <Stat label="구독자" value={subscribers} />
 *   <Card variant="padded">  // custom block — passed through as-is
 *     <CardTitle>차트</CardTitle>
 *     <Sparkline data={...} />
 *   </Card>
 * </StatGroup>
 * ```
 */

export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns at md+. Default: 4. Mobile collapses to 1 → 2. */
  cols?: 2 | 3 | 4 | 5 | 6;
  /** Skip auto-wrapping children in `<Card variant="padded">`. Default: false. */
  unwrapped?: boolean;
}

const COLS_CLASS: Record<NonNullable<StatGroupProps['cols']>, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(
  ({ cols = 4, unwrapped, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        // `auto-rows-fr` makes every grid row the same height — sibling
        // Stat tiles align even when one has `helper` text and another
        // doesn't. Without it, intrinsic-height rows leave the helper-
        // tiles taller than the bare-tile siblings.
        className={cn('grid auto-rows-fr gap-polaris-md', COLS_CLASS[cols], className)}
        {...props}
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;
          if (unwrapped) return child;
          // Auto-wrap only `<Stat>` children. Anything else (custom Card,
          // chart, etc.) passes through so the consumer keeps full control.
          if (child.type === Stat) {
            return (
              <Card variant="padded" className="h-full">
                {child}
              </Card>
            );
          }
          return child;
        })}
      </div>
    );
  }
);
StatGroup.displayName = 'StatGroup';
