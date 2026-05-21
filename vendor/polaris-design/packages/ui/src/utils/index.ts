/**
 * `@polaris/ui/utils` — server-safe pure utilities (v0.8.0-rc.8 NEW).
 *
 * Why a separate subpath: every other `@polaris/ui` bundle gets a
 * `"use client"` directive prepended at build time (see tsup config)
 * because component code uses React hooks / context. Pure helpers
 * imported alongside would force the entire client boundary into
 * React Server Components, even though the helper itself has no
 * client-only dependency.
 *
 * **Rule** for additions to this subpath: NO imports from React,
 * Radix, Tailwind classes, or any other client-coupled module. Only
 * primitives and standard Web APIs (Intl, etc.). If a helper has a
 * React dependency (returns JSX / uses hooks), it belongs in
 * `src/components/` and stays inside the `"use client"` barrel.
 *
 * Current exports:
 *   - `pageNumberItems(current, total, siblings)` — compute the visible
 *     page-number sequence with ellipses around the current page.
 *     Use case: RSC consumers rendering pagination as `<Link href>`
 *     instead of using our `<Pagination>` client component.
 *   - `PAGE_ELLIPSIS` — sentinel string for ellipsis positions.
 *   - `PageNumberItem` — the union type (`number | typeof PAGE_ELLIPSIS`).
 *
 * @example RSC pagination (Next.js App Router)
 * ```tsx
 * // app/contracts/page.tsx — SERVER COMPONENT
 * import { pageNumberItems, PAGE_ELLIPSIS } from '@polaris/ui/utils';
 * import Link from 'next/link';
 *
 * export default async function ContractsPage({ searchParams }) {
 *   const page = Number(searchParams.page ?? 1);
 *   const total = await getTotalPages();
 *   const items = pageNumberItems(page, total);
 *   return (
 *     <nav aria-label="Pagination">
 *       {items.map((it, i) =>
 *         it === PAGE_ELLIPSIS
 *           ? <span key={`e${i}`} aria-hidden>…</span>
 *           : <Link key={it} href={`?page=${it}`} aria-current={it === page}>{it}</Link>
 *       )}
 *     </nav>
 *   );
 * }
 * ```
 */

/** Sentinel value indicating an ellipsis position in `pageNumberItems()` output. */
export const PAGE_ELLIPSIS = '…' as const;

/** Element type returned by `pageNumberItems()`: either a 1-based page number
 *  or the `PAGE_ELLIPSIS` sentinel string. */
export type PageNumberItem = number | typeof PAGE_ELLIPSIS;

/**
 * Compute the visible page-number sequence with ellipses around the current
 * page. Returns numbers for clickable items and `PAGE_ELLIPSIS` for gaps.
 *
 * Example: `pageNumberItems(7, 20)` → `[1, '…', 5, 6, 7, 8, 9, '…', 20]`
 *
 * Pure function — safe to use in RSC, edge runtimes, web workers, etc.
 *
 * @param current   Current page (1-based).
 * @param total     Total page count.
 * @param siblings  Pages shown on each side of `current`. Default: 2.
 */
export function pageNumberItems(
  current: number,
  total: number,
  siblings = 2,
): PageNumberItem[] {
  if (total <= 0) return [];
  if (total <= 7 + (siblings - 2) * 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const items: PageNumberItem[] = [1];
  if (start > 2) items.push(PAGE_ELLIPSIS);
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push(PAGE_ELLIPSIS);
  items.push(total);
  return items;
}
