import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/cn';

/* ================================================================== *
 * Table helper components — toolbar / selection bar / skeleton
 *                                                          v0.7.5 NEW
 * ================================================================== *
 *
 * The `<Table>` primitive intentionally stays unopinionated about the
 * surrounding chrome (search bars, bulk-action rows, loading shimmer).
 * These three siblings give consumers the standard SaaS table patterns
 * without forcing a specific data model.
 *
 *   <TableToolbar />        ← search + filter chips + actions slot
 *   <TableSelectionBar />   ← shown when rows are selected (replaces toolbar)
 *   <TableSkeleton />       ← async-loading placeholder
 *
 * Compose them above your `<Table>`:
 *
 * @example
 * ```tsx
 * <Card>
 *   {selected.length === 0 ? (
 *     <TableToolbar
 *       search={query}
 *       onSearchChange={setQuery}
 *       searchPlaceholder="이름, 이메일 검색"
 *       chips={[
 *         { value: 'all',    label: '전체',  count: 240 },
 *         { value: 'active', label: '활성',  count: 198 },
 *         { value: 'paused', label: '비활성', count: 42 },
 *       ]}
 *       activeChip={status}
 *       onChipChange={setStatus}
 *       actions={<Button>+ 추가</Button>}
 *     />
 *   ) : (
 *     <TableSelectionBar
 *       count={selected.length}
 *       onCancel={() => setSelected([])}
 *       actions={
 *         <>
 *           <Button variant="tertiary" size="sm">내보내기</Button>
 *           <Button variant="danger" size="sm">삭제</Button>
 *         </>
 *       }
 *     />
 *   )}
 *
 *   {loading ? (
 *     <TableSkeleton rows={5} columns={4} />
 *   ) : (
 *     <Table>…</Table>
 *   )}
 * </Card>
 * ```
 */

/* ─── TableSearchInput ──────────────────────────────────────────── */

export interface TableSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  /**
   * **Controlled mode** — current search value. Pairs with `onValueChange`.
   *
   * Leave undefined for **uncontrolled mode** (set `defaultValue` instead).
   * Uncontrolled mode pairs with native `<form action>` submission +
   * server-rendered `defaultValue` for React Server Components / Next.js
   * App Router where `onChange` callbacks can't be created.
   */
  value?: string;
  /**
   * **Uncontrolled mode** — initial search value. Required for the RSC
   * form-action pattern (server reads `?q=...` from URL and renders
   * `<TableSearchInput name="q" defaultValue={q} />`; native form submit
   * sends the user's new value to the server).
   */
  defaultValue?: string;
  /**
   * Fires on every keystroke (or after `debounceMs` if set). Required in
   * controlled mode; optional in uncontrolled mode (e.g. analytics ping).
   */
  onValueChange?: (next: string) => void;
  /** If set, debounces `onValueChange` by N ms — typical 200-300 for live search. */
  debounceMs?: number;
  /** Show a clear (×) button when the input is non-empty. Default: `true`. */
  clearable?: boolean;
  /**
   * Form name. When set, the input ships its value with the surrounding
   * `<form>` submission (works in both modes). Required for the RSC
   * pattern `<form action="/path"><TableSearchInput name="q" ... /></form>`.
   */
  name?: string;
}

/**
 * Search input with leading magnifier icon + optional debounce + clear button.
 *
 * **Two modes** (v0.8.0-rc.8+):
 *
 * 1. **Controlled** — `value` + `onValueChange`. Use in client components
 *    where you own the search state in React.
 *
 * 2. **Uncontrolled / RSC form-action** — `defaultValue` + `name`, no
 *    `onValueChange` needed. The native form submits the value when the
 *    user presses Enter; server reads from URL search params and re-renders.
 *
 *    ```tsx
 *    // RSC pattern — Next.js App Router
 *    <form action={`?`}>
 *      <TableSearchInput name="q" defaultValue={searchParams.q} />
 *      <button type="submit" hidden />
 *    </form>
 *    ```
 *
 * Mode is auto-detected: if `value` is set, controlled; else uncontrolled.
 * Stand-alone export so it can be used outside `TableToolbar`.
 */
export const TableSearchInput = forwardRef<HTMLInputElement, TableSearchInputProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      debounceMs,
      clearable = true,
      className,
      placeholder = '검색',
      'aria-label': ariaLabel,
      id: providedId,
      name,
      ...inputProps
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const id = useId();
    // `local` tracks the value for the clear button + debounce timing
    // regardless of mode. In controlled mode it mirrors `value`; in
    // uncontrolled mode it tracks the native input as the user types.
    const [local, setLocal] = useState<string>(value ?? defaultValue ?? '');
    const localRef = useRef(local);
    localRef.current = local;
    // Keep a ref to the native input so the clear button can imperatively
    // reset it in uncontrolled mode (React won't re-render the input).
    const inputRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    // Controlled mode — keep local mirror in sync if parent value changes.
    useEffect(() => {
      if (isControlled) setLocal(value);
    }, [isControlled, value]);

    // Debounce the propagation of `local` → `onValueChange`.
    useEffect(() => {
      if (!debounceMs || !onValueChange) return;
      const t = setTimeout(() => {
        if (isControlled ? localRef.current !== value : true) {
          onValueChange(localRef.current);
        }
      }, debounceMs);
      return () => clearTimeout(t);
    }, [local, debounceMs, onValueChange, value, isControlled]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setLocal(e.target.value);
      if (!debounceMs) onValueChange?.(e.target.value);
    };

    const handleClear = () => {
      setLocal('');
      if (!isControlled && inputRef.current) {
        // Uncontrolled mode — reset the native input imperatively so
        // form submission sees the cleared value.
        inputRef.current.value = '';
      }
      onValueChange?.('');
    };

    return (
      <div
        className={cn(
          'relative flex items-center font-polaris',
          className
        )}
      >
        <Search
          aria-hidden="true"
          className="absolute left-3 h-4 w-4 text-label-alternative pointer-events-none"
        />
        <input
          ref={mergedRef}
          id={providedId ?? id}
          type="search"
          name={name}
          {...(isControlled ? { value: local } : { defaultValue: defaultValue ?? '' })}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          className={cn(
            'h-9 w-full rounded-polaris-sm bg-background-base text-polaris-body2',
            'border border-line-neutral pl-9 pr-9',
            'transition-colors duration-polaris-fast',
            'focus-visible:outline-none focus-visible:border-accent-brand-normal',
            'placeholder:text-label-assistive',
            // Hide the browser's native cancel cross — our own button replaces it.
            '[&::-webkit-search-cancel-button]:hidden'
          )}
          {...inputProps}
        />
        {clearable && local !== '' && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="검색어 지우기"
            className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-polaris-sm text-label-alternative hover:bg-interaction-hover focus-visible:outline-none focus-visible:shadow-polaris-focus"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);
TableSearchInput.displayName = 'TableSearchInput';

/* ─── TableFilterChip / TableToolbar ────────────────────────────── */

export interface TableFilterChip<V extends string = string> {
  value: V;
  label: ReactNode;
  /** Optional count badge — typical "활성 (12)" pattern. */
  count?: number;
}

export interface TableToolbarProps<V extends string = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Controlled search value. Pair with `onSearchChange`. For *RSC form-action*
   * mode use `searchProps` instead (see below). Pass `undefined` AND no
   * `searchProps` to hide the search input.
   */
  search?: string;
  onSearchChange?: (next: string) => void;
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  /**
   * **Uncontrolled / RSC mode (v0.8.0-rc.8+)** — pass-through props for
   * the search input. Use this instead of `search`/`onSearchChange` when
   * you want `<form action>` form-submission instead of React state.
   *
   * ```tsx
   * // RSC pattern
   * <form action={`?`}>
   *   <TableToolbar
   *     searchProps={{ name: 'q', defaultValue: searchParams.q }}
   *     chips={...}
   *     actions={...}
   *   />
   *   <button type="submit" hidden />
   * </form>
   * ```
   *
   * Either `search` (controlled) OR `searchProps` (uncontrolled) — not both.
   * `searchPlaceholder` / `searchDebounceMs` still apply in either mode.
   */
  searchProps?: Pick<TableSearchInputProps, 'name' | 'defaultValue' | 'onValueChange'>;
  /** Quick filter chips. Pass `undefined`/empty to hide. */
  chips?: ReadonlyArray<TableFilterChip<V>>;
  activeChip?: V;
  onChipChange?: (value: V) => void;
  /** Right-aligned actions slot — typical place for "+ 추가" or column-toggle button. */
  actions?: ReactNode;
}

export function TableToolbar<V extends string = string>({
  search,
  onSearchChange,
  searchPlaceholder,
  searchDebounceMs,
  searchProps,
  chips,
  activeChip,
  onChipChange,
  actions,
  className,
  ...props
}: TableToolbarProps<V>) {
  const showSearch = (search !== undefined && onSearchChange) || !!searchProps;
  const showChips = chips && chips.length > 0;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-polaris-sm font-polaris',
        // Prevent the chips region from over-stretching when the search is wide.
        '[&>*]:min-w-0',
        className
      )}
      {...props}
    >
      {showSearch && (
        <TableSearchInput
          // Controlled mode: explicit value + handler
          value={search}
          onValueChange={onSearchChange ?? searchProps?.onValueChange}
          // Uncontrolled mode: name + defaultValue passed through searchProps
          name={searchProps?.name}
          defaultValue={searchProps?.defaultValue}
          debounceMs={searchDebounceMs}
          placeholder={searchPlaceholder}
          className="max-w-xs flex-1"
        />
      )}
      {showChips && (
        <div role="group" aria-label="필터" className="flex flex-wrap items-center gap-polaris-3xs">
          {chips.map((c) => {
            const isActive = c.value === activeChip;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChipChange?.(c.value)}
                className={cn(
                  'inline-flex items-center gap-polaris-3xs rounded-polaris-pill px-3 py-1',
                  'text-polaris-body3 font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:shadow-polaris-focus',
                  isActive
                    ? 'bg-accent-brand-normal text-label-inverse'
                    : 'bg-fill-neutral text-label-neutral hover:bg-fill-normal'
                )}
              >
                <span>{c.label}</span>
                {typeof c.count === 'number' && (
                  <span
                    className={cn(
                      'rounded-polaris-pill px-1.5 text-polaris-helper',
                      isActive
                        ? 'bg-static-white/20 text-label-inverse'
                        : 'bg-background-base text-label-alternative'
                    )}
                  >
                    {c.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {actions && <div className="ml-auto flex items-center gap-polaris-2xs">{actions}</div>}
    </div>
  );
}
TableToolbar.displayName = 'TableToolbar';

/* ─── TableSelectionBar ─────────────────────────────────────────── */

export interface TableSelectionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Selected row count (drives the `N개 선택됨` indicator). */
  count: number;
  /** Bulk-action buttons (right side). Compose with `<Button size="sm">`s. */
  actions?: ReactNode;
  /** Cancel handler — typically clears the selection. */
  onCancel?: () => void;
  /** Localized text. */
  labels?: {
    /** Default: `"{count}개 선택됨"`. */
    selected?: (count: number) => ReactNode;
    /** Default: `"선택 해제"`. */
    cancel?: ReactNode;
  };
}

/**
 * Selection bar — render *in place of* the toolbar when rows are selected.
 * Use a conditional in the parent: `selected.length === 0 ? <Toolbar/> : <SelectionBar/>`.
 *
 * Visual: brand-tinted strip with selection count + bulk action slot.
 */
export const TableSelectionBar = forwardRef<HTMLDivElement, TableSelectionBarProps>(
  ({ count, actions, onCancel, labels, className, ...props }, ref) => {
    const selectedLabel = labels?.selected ?? ((n: number) => `${n}개 선택됨`);
    const cancelLabel = labels?.cancel ?? '선택 해제';
    return (
      <div
        ref={ref}
        role="region"
        aria-label="선택된 항목 액션"
        className={cn(
          'flex items-center gap-polaris-sm font-polaris',
          'rounded-polaris-md bg-accent-brand-normal-subtle px-polaris-md py-polaris-2xs',
          className
        )}
        {...props}
      >
        <span className="text-polaris-body3 font-medium text-accent-brand-normal">
          {selectedLabel(count)}
        </span>
        <div className="ml-auto flex items-center gap-polaris-2xs">
          {actions}
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }
);
TableSelectionBar.displayName = 'TableSelectionBar';

/* ─── TableSkeleton ─────────────────────────────────────────────── */

export interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of placeholder rows. Default: 5. */
  rows?: number;
  /** Number of placeholder columns. Default: 4. */
  columns?: number;
  /** Show a header row (slightly taller, distinct background). Default: `true`. */
  showHeader?: boolean;
}

/**
 * Animated placeholder for an async-loading table.
 *
 * Visually mirrors `<Table>` (border + header band + striped rows) so
 * swapping in real data after fetch settles in place. Uses the same
 * `Skeleton` shimmer as the rest of the system, so reduced-motion users
 * get a solid block (handled by Tailwind's `motion-safe` policy).
 */
export const TableSkeleton = forwardRef<HTMLDivElement, TableSkeletonProps>(
  ({ rows = 5, columns = 4, showHeader = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="테이블 로딩 중"
        className={cn(
          'w-full overflow-hidden rounded-polaris-md border border-line-neutral font-polaris',
          className
        )}
        {...props}
      >
        {showHeader && (
          <div
            className="flex items-center gap-3 bg-fill-neutral px-3 py-2.5 border-b border-line-neutral"
            aria-hidden="true"
          >
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className="h-3 flex-1 motion-safe:animate-pulse rounded-polaris-2xs bg-fill-strong"
              />
            ))}
          </div>
        )}
        <div className="divide-y divide-line-neutral" aria-hidden="true">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-3 px-3 py-2.5">
              {Array.from({ length: columns }).map((__, c) => (
                <div
                  key={c}
                  className="h-3 flex-1 motion-safe:animate-pulse rounded-polaris-2xs bg-fill-normal"
                  // First column slightly wider, last column slightly narrower —
                  // makes the placeholder read as data, not a flat band.
                  style={{
                    flexGrow: c === 0 ? 1.4 : c === columns - 1 ? 0.6 : 1,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <span className="sr-only">로딩 중</span>
      </div>
    );
  }
);
TableSkeleton.displayName = 'TableSkeleton';
