import { forwardRef, createContext, useContext, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * Polaris table primitive — semantic `<table>` with token-driven styling and
 * a `density` axis. Sorting affordance is built into `<TableHead sortable>`;
 * virtualization and column-def codegen remain out of scope (planned as
 * `DataTable` on top of this primitive).
 *
 * The density context propagates to TableRow/TableCell so callers don't have
 * to thread a prop through every cell.
 */

type Density = 'compact' | 'comfortable' | 'relaxed';

const DensityContext = createContext<Density>('comfortable');

const ROW_PAD: Record<Density, string> = {
  compact:     'py-1.5',
  comfortable: 'py-2.5',
  relaxed:     'py-4',
};

const CELL_PAD_X = 'px-3';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Vertical row padding. Default: `comfortable`. */
  density?: Density;
  /** Container className — applied to the wrapper that handles overflow. */
  containerClassName?: string;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, density = 'comfortable', ...props }, ref) => (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-polaris-md border border-line-neutral',
        containerClassName
      )}
    >
      <DensityContext.Provider value={density}>
        <table
          ref={ref}
          data-density={density}
          className={cn('w-full text-polaris-body2 font-polaris', className)}
          {...props}
        />
      </DensityContext.Provider>
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-fill-neutral text-label-neutral', className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('divide-y divide-line-neutral', className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('bg-fill-neutral text-label-neutral border-t border-line-neutral', className)}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Mark this row as selected (e.g. checkbox-bulk-action UIs). Applies a
   * brand-tinted background + sets `aria-selected="true"`. Pair with the
   * `<TableSelectionBar>` row to provide a consistent feedback loop.
   */
  selected?: boolean;
  /**
   * Mark the row as clickable. When set together with `onClick`, the row
   * becomes a real keyboard-activatable target:
   *   - `tabIndex={0}` so it joins the tab order
   *   - Enter / Space fire the `onClick` handler (mouse-only regression
   *     guard — without this, a `clickable` row would only respond to
   *     pointer input despite the visual affordance)
   *   - `cursor-pointer` + stronger hover tint + `shadow-polaris-focus`
   *
   * If you only want the *visual* hover state (e.g. each cell already
   * contains its own `<Link>` and the row itself is not a click target),
   * omit `onClick` — the keyboard wiring then no-ops too.
   *
   * NOTE: For navigating to a detail page, the most accessible pattern
   * is still wrapping the first cell's content in a real `<Link>` so
   * the link gets the URL semantics. `clickable` is for in-page actions
   * (open drawer, select row, etc.) where `onClick` is the source of truth.
   */
  clickable?: boolean;
}

/** Selectors that mark a descendant as "owns its own click" — the row
 *  click handler skips when the click bubbled up through one of these.
 *  Without this, clicking a checkbox / action button / dropdown trigger
 *  inside a clickable row would BOTH toggle the descendant AND fire
 *  the row's onClick (e.g. open a detail drawer for a row whose row-
 *  action menu the user just opened). Covers native + ARIA roles. */
const ROW_INTERACTIVE_DESCENDANT_SELECTOR =
  'button, a, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="switch"], [role="tab"], [role="combobox"]';

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, clickable, onClick, onKeyDown, tabIndex, ...props }, ref) => {
    const isInteractive = clickable && Boolean(onClick);

    /** Walk up from `target` until we hit `currentTarget`. If we cross
     *  an interactive element along the way, the click belongs to that
     *  descendant — suppress the row handler. */
    const clickOriginatedFromDescendant = (
      e: React.SyntheticEvent<HTMLTableRowElement>
    ): boolean => {
      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el !== e.currentTarget) {
        if (el.matches?.(ROW_INTERACTIVE_DESCENDANT_SELECTOR)) return true;
        el = el.parentElement;
      }
      return false;
    };

    const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (!isInteractive) return;
      // A descendant button/checkbox/menu item should own its click —
      // the row's onClick must NOT fire on top of that, otherwise a
      // simple row-action menu (kebab-menu in the last cell) opens AND
      // navigates / selects the row simultaneously.
      if (clickOriginatedFromDescendant(e)) return;
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      // Don't intercept Enter/Space if the focus is on a child interactive
      // element (button / link / input) — that element should handle it.
      if (e.target !== e.currentTarget) return;
      if (!isInteractive) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLTableRowElement>);
      }
    };

    return (
      <tr
        ref={ref}
        aria-selected={selected || undefined}
        data-state={selected ? 'selected' : undefined}
        // Only join the tab order when actually interactive — caller
        // can still force tabIndex=-1 if they manage focus themselves.
        tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
        // Always wire our composed onClick (no-op when not interactive).
        // The original onClick is consumed via destructuring above so it
        // doesn't get re-applied through `{...props}`.
        onClick={isInteractive ? handleClick : onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'transition-colors',
          // Hover background — stronger when clickable so it reads as actionable.
          clickable
            ? 'cursor-pointer hover:bg-fill-neutral focus-visible:outline-none focus-visible:bg-fill-neutral focus-visible:shadow-polaris-focus'
            : 'hover:bg-fill-neutral/50',
          // Selection takes priority over hover.
          selected && 'bg-accent-brand-normal-subtle hover:bg-accent-brand-normal-subtle',
          className
        )}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

/** Sort direction for `<TableHead sortable>`. `null` means unsorted (cycle starts at asc). */
export type TableSortDirection = 'asc' | 'desc' | null;

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Render the header cell content as a sort-toggle button.
   *
   * When set, the cell:
   *   - wraps `children` in a `<button>` with `aria-sort` reflecting the
   *     current direction (`ascending` / `descending` / `none`)
   *   - shows a leading chevron that visually encodes direction
   *     (matched icon + `aria-sort` for AT users — color alone is not used)
   *   - on click, calls `onSortChange(nextDirection)` cycling
   *     `null → asc → desc → null` (or your `cycle`)
   *
   * Pair with parent state (`useState<TableSortDirection>` per column) and
   * a `useMemo` that re-sorts the row data based on the active column.
   *
   * @example
   * ```tsx
   * const [sort, setSort] = useState<{ key: 'name' | 'created'; dir: TableSortDirection }>({ key: 'name', dir: 'asc' });
   * <TableHead
   *   sortable
   *   sortDirection={sort.key === 'name' ? sort.dir : null}
   *   onSortChange={(dir) => setSort({ key: 'name', dir })}
   * >
   *   이름
   * </TableHead>
   * ```
   */
  sortable?: boolean;
  /** Current sort direction (null = unsorted). Only meaningful when `sortable`. */
  sortDirection?: TableSortDirection;
  /** Fires with the next direction in the cycle. Only used when `sortable`. */
  onSortChange?: (direction: TableSortDirection) => void;
  /**
   * Direction cycle order. Default: `['asc', 'desc', null]` — three states.
   * Pass `['asc', 'desc']` for two-state (always sorted, no clear).
   */
  cycle?: TableSortDirection[];
  /**
   * Apply `whitespace-nowrap` so this header's content stays on one line.
   * Mirrors `<TableCell nowrap>` so a single column's `<th>` and `<td>`
   * can match without sprinkling `className="whitespace-nowrap"` on
   * each row. Single-line "날짜 / 금액 / ID" header columns benefit;
   * for `sortable` headers it also keeps the chevron + label inline
   * during horizontal scroll. v0.7.7 had this on TableCell only —
   * v0.8 closes the API symmetry gap.
   */
  nowrap?: boolean;
}

const DEFAULT_SORT_CYCLE: TableSortDirection[] = ['asc', 'desc', null];

function nextSortDirection(
  current: TableSortDirection,
  cycle: TableSortDirection[]
): TableSortDirection {
  const i = cycle.indexOf(current);
  if (i === -1) return cycle[0] ?? null;
  return cycle[(i + 1) % cycle.length] ?? null;
}

function SortIcon({ direction }: { direction: TableSortDirection }) {
  if (direction === 'asc') {
    return <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
  if (direction === 'desc') {
    return <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
  return (
    <ChevronsUpDown
      className="h-3.5 w-3.5 shrink-0 text-label-assistive"
      aria-hidden="true"
    />
  );
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSortChange, cycle, nowrap, children, ...props }, ref) => {
    const density = useContext(DensityContext);
    const baseClass = cn(
      CELL_PAD_X,
      ROW_PAD[density],
      'text-left font-semibold text-polaris-caption1 uppercase tracking-wider',
      nowrap && 'whitespace-nowrap',
      className
    );

    if (!sortable) {
      return <th ref={ref} scope="col" className={baseClass} {...props}>{children}</th>;
    }

    const direction: TableSortDirection = sortDirection ?? null;
    const ariaSort: React.AriaAttributes['aria-sort'] =
      direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';

    const handleClick = () => {
      if (!onSortChange) return;
      onSortChange(nextSortDirection(direction, cycle ?? DEFAULT_SORT_CYCLE));
    };

    return (
      <th ref={ref} scope="col" aria-sort={ariaSort} className={baseClass} {...props}>
        {/* eslint-disable-next-line @polaris/prefer-polaris-component -- primitive layer */}
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'inline-flex items-center gap-polaris-3xs',
            '-mx-1 px-1 rounded-polaris-xs',
            'transition-colors hover:text-label-normal',
            'focus-visible:outline-none focus-visible:shadow-polaris-focus',
            direction !== null && 'text-label-normal'
          )}
        >
          <span>{children as ReactNode}</span>
          <SortIcon direction={direction} />
        </button>
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Apply `whitespace-nowrap` so this cell's content stays on one line
   * regardless of column width. Common for date / amount / ID columns
   * where wrapping a number across two lines is worse than horizontal
   * scroll. Without this prop consumers were adding `className="whitespace-nowrap"`
   * on most cells in dense data tables.
   */
  nowrap?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, nowrap, ...props }, ref) => {
    const density = useContext(DensityContext);
    return (
      <td
        ref={ref}
        className={cn(
          CELL_PAD_X,
          ROW_PAD[density],
          'text-label-normal',
          nowrap && 'whitespace-nowrap',
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-2 text-polaris-caption1 text-label-alternative', className)}
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';
