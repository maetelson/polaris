import { forwardRef, useId, type ElementType, type ReactNode } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { MoreHorizontal } from 'lucide-react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './Select';
import { cn } from '../lib/cn';

export const Pagination = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1 font-polaris', className)}
      {...props}
    />
  )
);
Pagination.displayName = 'Pagination';

export interface PaginationItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Current page indicator. Renders `aria-current="page"`. */
  active?: boolean;
  /**
   * Render the child element instead of a `<button>`. Useful for URL-driven
   * pagination in Next.js App Router:
   * `<PaginationItem asChild active={n === current}><Link href={`?page=${n}`}>{n}</Link></PaginationItem>`
   */
  asChild?: boolean;
}

export const PaginationItem = forwardRef<HTMLElement, PaginationItemProps>(
  ({ className, active, asChild, children, ...props }, ref) => {
    const Comp: ElementType = asChild ? Slot : 'button';
    const buttonProps = asChild ? {} : { type: 'button' as const };
    return (
      // eslint-disable-next-line @polaris/prefer-polaris-component -- primitive layer
      <Comp
        ref={ref as never}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'inline-flex h-9 min-w-9 items-center justify-center rounded-polaris-md px-3 text-polaris-body2 font-medium transition-colors',
          'focus-visible:outline-none focus-visible:shadow-polaris-focus',
          'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none',
          active
            ? 'bg-accent-brand-normal text-label-inverse'
            : 'text-label-normal hover:bg-accent-brand-normal-subtle',
          className
        )}
        {...buttonProps}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
PaginationItem.displayName = 'PaginationItem';

export interface PaginationStepProps extends PaginationItemProps {
  /** aria-label override. Default: `이전 페이지` / `다음 페이지`. */
  label?: string;
  /**
   * Custom icon to render before (Prev) / after (Next) the label. Default:
   * `ChevronLeftIcon` / `ChevronRightIcon` at 16px. Pass `null` to omit
   * the icon entirely.
   *
   * Compatible with `asChild`: when both are set, the icon is rendered as
   * a sibling of the user's child element via Radix `Slottable` — no
   * `React.Children.only` violation. Prior to v0.8.0-rc.8 the chevron and
   * `children` were spread as two siblings into `<Slot>`, which broke
   * the asChild + `<Link>` pattern that RSC consumers need.
   */
  icon?: ReactNode;
}

export const PaginationPrev = forwardRef<HTMLElement, PaginationStepProps>(
  ({ className, children, label = '이전 페이지', icon, asChild, ...props }, ref) => {
    const chevron = icon === null
      ? null
      : icon ?? <ChevronLeftIcon size={16} aria-hidden="true" />;
    // Slot path: chevron sits as a SIBLING of `<Slottable>{children}</Slottable>`.
    // Radix Slot finds Slottable, extracts the user's element as the render
    // target, and re-inserts siblings (chevron) into the cloned element's
    // children alongside the user's original children. Wrapping both chevron
    // and children inside Slottable would crash (Slottable expects a single
    // child as the merge target).
    if (asChild) {
      return (
        <PaginationItem ref={ref} className={className} aria-label={label} asChild {...props}>
          {chevron}
          <Slottable>{children}</Slottable>
        </PaginationItem>
      );
    }
    return (
      <PaginationItem ref={ref} className={className} aria-label={label} {...props}>
        {chevron}
        {children}
      </PaginationItem>
    );
  }
);
PaginationPrev.displayName = 'PaginationPrev';

export const PaginationNext = forwardRef<HTMLElement, PaginationStepProps>(
  ({ className, children, label = '다음 페이지', icon, asChild, ...props }, ref) => {
    const chevron = icon === null
      ? null
      : icon ?? <ChevronRightIcon size={16} aria-hidden="true" />;
    if (asChild) {
      return (
        <PaginationItem ref={ref} className={className} aria-label={label} asChild {...props}>
          <Slottable>{children}</Slottable>
          {chevron}
        </PaginationItem>
      );
    }
    return (
      <PaginationItem ref={ref} className={className} aria-label={label} {...props}>
        {children}
        {chevron}
      </PaginationItem>
    );
  }
);
PaginationNext.displayName = 'PaginationNext';

export const PaginationEllipsis = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn('inline-flex h-9 min-w-9 items-center justify-center text-label-alternative', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

// Pure pagination utilities (sentinel + computation) moved to
// `@polaris/ui/utils` in v0.8.0-rc.8 so RSC consumers can import them
// without dragging the client bundle in. Re-exported here for
// back-compat — existing `import { pageNumberItems } from '@polaris/ui'`
// keeps working.
import { PAGE_ELLIPSIS, pageNumberItems, type PageNumberItem } from '../utils';
export { PAGE_ELLIPSIS, pageNumberItems };
export type { PageNumberItem };

/* ================================================================== *
 * PaginationFooter — high-level wrapper                  v0.7.5 NEW
 * ================================================================== *
 *
 * `<Pagination>` + helpers cover navigation buttons, but most tables
 * also need (a) a "rows per page" selector and (b) a "X-Y of N" total
 * indicator. Consumers were reaching for `<Select>` separately and
 * laying out the row by hand on every page. `PaginationFooter` bundles
 * the standard pattern.
 *
 * Layout (left → right):
 *
 *   [ "X-Y of N" 인디케이터 ]   …   [ pageSize Select ]   [ ‹ 1 2 … N › ]
 *
 * Each region is independently optional — pass `showTotal={false}` /
 * `pageSizeOptions={undefined}` to hide.
 *
 * Controlled component: parent owns `page` + `pageSize` state and
 * receives `onPageChange` / `onPageSizeChange` callbacks. The page number
 * sequence with ellipses is computed from `pageNumberItems(page, totalPages)`.
 *
 * @example
 * ```tsx
 * <PaginationFooter
 *   page={page}
 *   pageSize={pageSize}
 *   total={total}
 *   onPageChange={setPage}
 *   onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
 *   pageSizeOptions={[10, 25, 50, 100]}
 * />
 * ```
 */

/**
 * Shared (mode-agnostic) props for PaginationFooter — every render mode
 * needs page / total / pageSize, an optional page-size selector, and the
 * shared visual options.
 */
interface PaginationFooterCommonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current page (1-based). */
  page: number;
  /** Total item count (used for the `X-Y of N` indicator and to derive `totalPages`). */
  total: number;
  /** Page size. */
  pageSize: number;
  /** Page size options for the selector. Default: `[10, 25, 50, 100]`. */
  pageSizeOptions?: number[];
  /** Required to show the page-size selector — passing this opts in. Typically also resets the page to 1. */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Show the page-size selector. Default: `true` *iff* `onPageSizeChange`
   * is provided. See JSDoc on the prop below for legacy fallback details.
   */
  showPageSize?: boolean;
  /** Hide the `X-Y of N` indicator. */
  showTotal?: boolean;
  /** Sibling pages on each side of the current page. Default: 2. */
  siblings?: number;
  /** Localized label parts. */
  labels?: {
    /** "X-Y of N" renderer. Default: `"{start}-{end} / {total}"`. */
    total?: (start: number, end: number, total: number) => ReactNode;
    /** Label for the page-size selector. Default: "페이지당". */
    pageSize?: ReactNode;
  };
}

/**
 * Controlled mode — parent owns `page` in React state and reacts to
 * `onPageChange` to update it. Used inside client components.
 */
interface PaginationFooterControlledProps extends PaginationFooterCommonProps {
  /** Required in controlled mode. Fires when the user picks a page. */
  onPageChange: (page: number) => void;
  buildHref?: never;
  linkAs?: never;
}

/**
 * Anchor mode — each pagination item is rendered as a real `<a>` /
 * `<Link>` with `href={buildHref(p)}`. Use inside client islands that
 * want URL-state pagination (Next.js App Router + Link). `onPageChange`
 * stays optional — supplies prefetch / optimistic UI / scroll behavior
 * *in addition to* the anchor navigation.
 *
 * ⚠ **Server Component caveat** — `@polaris/ui` root bundle is `"use client"`,
 * so PaginationFooter is itself a client component. `buildHref` (function)
 * and `linkAs` (component) cannot be passed from a React Server Component
 * — they're not serializable. Two safe RSC patterns:
 *
 *   1. **Client island** — wrap PaginationFooter in a `'use client'`
 *      file and pass `page` / `pageSize` / `total` (serializable) from
 *      the server; the island declares `buildHref` / `linkAs` locally.
 *   2. **Raw `<Link>` assembly** — for pure-RSC pagination, use
 *      `pageNumberItems` from `@polaris/ui/utils` (server-safe) and
 *      render `<Link>` elements directly. Skip PaginationFooter.
 *
 * @example Client-island pattern
 * ```tsx
 * // app/contracts/page.tsx (SERVER COMPONENT)
 * import { ContractsPagination } from './pagination-island';
 * export default async function Page({ searchParams }) {
 *   const page = Number(searchParams.page ?? 1);
 *   const total = await getTotalCount();
 *   return <ContractsPagination page={page} total={total} pageSize={20} />;
 * }
 *
 * // app/contracts/pagination-island.tsx (CLIENT COMPONENT)
 * 'use client';
 * import Link from 'next/link';
 * import { PaginationFooter } from '@polaris/ui';
 * export function ContractsPagination(props) {
 *   return <PaginationFooter {...props}
 *     buildHref={(p) => `?page=${p}`}
 *     linkAs={Link}
 *   />;
 * }
 * ```
 */
interface PaginationFooterAnchorProps extends PaginationFooterCommonProps {
  /**
   * Required in anchor mode — function `(page) => href` invoked per item.
   * Returns the navigation URL for each page link.
   */
  buildHref: (page: number) => string;
  /**
   * Element type for anchor-mode rendering. Default: `'a'`. Pass a custom
   * `<Link>` component (Next.js, React Router, TanStack) for client-side
   * routing + prefetch. Receives a string `href` prop.
   *
   * ⚠ Same serializability caveat as `buildHref` — must be declared inside
   * a client component / island. See `PaginationFooterAnchorProps` JSDoc
   * above for safe RSC patterns.
   */
  linkAs?: ElementType;
  /**
   * Optional in anchor mode — fires *in addition to* native anchor navigation.
   * Use for prefetch / optimistic UI / scroll behavior. The anchor's `href`
   * still drives the actual page transition.
   */
  onPageChange?: (page: number) => void;
}

/**
 * Discriminated union — exactly one of (controlled `onPageChange`) or
 * (anchor `buildHref`) is required. TypeScript catches the mistake at
 * compile time, preventing the rc.7 footgun where a `<PaginationFooter>`
 * with neither rendered an inert (un-clickable) toolbar.
 */
export type PaginationFooterProps =
  | PaginationFooterControlledProps
  | PaginationFooterAnchorProps;

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const PaginationFooter = forwardRef<HTMLDivElement, PaginationFooterProps>(
  (
    {
      page,
      total,
      pageSize,
      pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
      onPageChange,
      buildHref,
      linkAs,
      onPageSizeChange,
      showPageSize,
      showTotal = true,
      siblings = 2,
      labels,
      className,
      ...props
    },
    ref
  ) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, total);
    const items = pageNumberItems(safePage, totalPages, siblings);
    const pageSizeId = useId();

    const totalLabel =
      labels?.total ?? ((s, e, t) => `${s}-${e} / ${t.toLocaleString()}`);
    const pageSizeLabel = labels?.pageSize ?? '페이지당';

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-center justify-between gap-polaris-sm font-polaris',
          className
        )}
        {...props}
      >
        {showTotal ? (
          <p className="text-polaris-body3 text-label-alternative">
            {totalLabel(start, end, total)}
          </p>
        ) : (
          <span aria-hidden="true" />
        )}

        <div className="flex items-center gap-polaris-sm">
          {/* Resolve showPageSize: explicit boolean wins; otherwise default
            *  to "show iff change-handler + options are present" (legacy).
            *  Passing `pageSizeOptions={undefined}` still hides the selector
            *  for backwards-compat with v0.7.5 callers, but is no longer
            *  the recommended way (`showPageSize={false}` reads better). */}
          {(showPageSize ?? Boolean(pageSizeOptions && onPageSizeChange)) && pageSizeOptions && onPageSizeChange ? (
            <div className="flex items-center gap-polaris-2xs">
              <label
                htmlFor={pageSizeId}
                className="text-polaris-body3 text-label-alternative"
              >
                {pageSizeLabel}
              </label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange(Number(v))}
              >
                <SelectTrigger id={pageSizeId} className="h-9 w-[5.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <Pagination>
            {(() => {
              // Render mode selector: anchor mode wins when `buildHref` is
              // set (RSC-friendly), otherwise controlled `onClick`.
              const LinkComp: ElementType = linkAs ?? 'a';
              const prevPage = Math.max(1, safePage - 1);
              const nextPage = Math.min(totalPages, safePage + 1);
              const prevDisabled = safePage <= 1;
              const nextDisabled = safePage >= totalPages;
              return (
                <>
                  {buildHref ? (
                    <PaginationPrev
                      asChild={!prevDisabled}
                      disabled={prevDisabled}
                      onClick={onPageChange ? () => onPageChange(prevPage) : undefined}
                    >
                      {!prevDisabled ? <LinkComp href={buildHref(prevPage)} /> : null}
                    </PaginationPrev>
                  ) : (
                    <PaginationPrev
                      disabled={prevDisabled}
                      onClick={onPageChange ? () => onPageChange(prevPage) : undefined}
                    />
                  )}
                  {items.map((it, i) =>
                    it === PAGE_ELLIPSIS ? (
                      <PaginationEllipsis key={`ellipsis-${i}`} />
                    ) : buildHref ? (
                      <PaginationItem key={it} active={it === safePage} asChild>
                        <LinkComp
                          href={buildHref(it)}
                          aria-current={it === safePage ? 'page' : undefined}
                          onClick={onPageChange ? () => onPageChange(it) : undefined}
                        >
                          {it}
                        </LinkComp>
                      </PaginationItem>
                    ) : (
                      <PaginationItem
                        key={it}
                        active={it === safePage}
                        onClick={onPageChange ? () => onPageChange(it) : undefined}
                      >
                        {it}
                      </PaginationItem>
                    )
                  )}
                  {buildHref ? (
                    <PaginationNext
                      asChild={!nextDisabled}
                      disabled={nextDisabled}
                      onClick={onPageChange ? () => onPageChange(nextPage) : undefined}
                    >
                      {!nextDisabled ? <LinkComp href={buildHref(nextPage)} /> : null}
                    </PaginationNext>
                  ) : (
                    <PaginationNext
                      disabled={nextDisabled}
                      onClick={onPageChange ? () => onPageChange(nextPage) : undefined}
                    />
                  )}
                </>
              );
            })()}
          </Pagination>
        </div>
      </div>
    );
  }
);
PaginationFooter.displayName = 'PaginationFooter';
