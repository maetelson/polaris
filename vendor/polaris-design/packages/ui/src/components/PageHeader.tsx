import { forwardRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

/* ================================================================== *
 * PageHeader / SectionHeader — page-layout primitives        v0.7.7
 * ================================================================== *
 *
 * Every page in the system reaches for the same shape: title +
 * description + optional breadcrumb (above) / back link / right-side
 * actions. Up until v0.7.6 each consumer assembled this by hand —
 * inconsistent gaps, mismatched type sizes.
 *
 * `<PageHeader>` is the canonical page-level wrapper; `<SectionHeader>`
 * is its smaller sibling for in-page sections (above a Card grid, a
 * settings group, etc.).
 *
 * Composed with slots only — no internal state. Pair with `<Container>`
 * to constrain width.
 */

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Page title. Renders as the chosen heading level. */
  title: ReactNode;
  /** Sub-description rendered below the title. */
  description?: ReactNode;
  /** Slot above the title — typically a `<Breadcrumb>`. */
  breadcrumb?: ReactNode;
  /** Slot directly above the title — typically a back link or eyebrow tag. */
  eyebrow?: ReactNode;
  /** Right-aligned actions slot — buttons, dropdown menus, etc. */
  actions?: ReactNode;
  /** Heading level — defaults to `h1`. Use `h2` when this header sits inside another semantic landmark. */
  as?: 'h1' | 'h2';
  /** Add a bottom divider line. Default: `true`. Pass `false` for a flat header. */
  divider?: boolean;
}

/**
 * Page-level header — title + description + breadcrumb + actions.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   breadcrumb={<Breadcrumb>...</Breadcrumb>}
 *   title="문서 분석"
 *   description="제안서·IR 자료·계약 문서를 한 곳에서."
 *   actions={
 *     <>
 *       <Button variant="tertiary" size="sm">필터</Button>
 *       <Button size="sm">+ 새 문서</Button>
 *     </>
 *   }
 * />
 * ```
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  ({ className, title, description, breadcrumb, eyebrow, actions, as = 'h1', divider = true, ...props }, ref) => {
    const Heading = as;
    return (
      <header
        ref={ref}
        className={cn(
          'font-polaris',
          'flex flex-col gap-polaris-2xs',
          divider && 'pb-polaris-md mb-polaris-lg border-b border-line-neutral',
          className
        )}
        {...props}
      >
        {breadcrumb && <div className="mb-polaris-2xs">{breadcrumb}</div>}
        <div className="flex flex-wrap items-start justify-between gap-polaris-md">
          <div className="min-w-0 flex flex-col gap-polaris-3xs">
            {eyebrow && (
              <div className="text-polaris-caption1 text-label-alternative uppercase tracking-wider">
                {eyebrow}
              </div>
            )}
            <Heading
              className={cn(
                'text-label-normal',
                as === 'h1' ? 'text-polaris-title' : 'text-polaris-heading2'
              )}
            >
              {title}
            </Heading>
            {description && (
              <p className="text-polaris-body2 text-label-neutral">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-polaris-2xs">{actions}</div>
          )}
        </div>
      </header>
    );
  }
);
PageHeader.displayName = 'PageHeader';

/* ─── SectionHeader ─────────────────────────────────────────────── */

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Section title. */
  title: ReactNode;
  /** Sub-description rendered below the title. */
  description?: ReactNode;
  /** Right-aligned actions slot. */
  actions?: ReactNode;
  /** Heading level — defaults to `h2`. */
  as?: 'h2' | 'h3';
}

/**
 * Section-level header — sits *outside* a Card (Card.Header is for the
 * card's own internal header). Smaller type scale than PageHeader.
 *
 * @example
 * ```tsx
 * <SectionHeader title="최근 활동" description="지난 7일" actions={<Button size="sm">전체 보기</Button>} />
 * <div className="grid grid-cols-3 gap-4">{cards}</div>
 * ```
 */
export const SectionHeader = forwardRef<HTMLElement, SectionHeaderProps>(
  ({ className, title, description, actions, as = 'h2', ...props }, ref) => {
    const Heading = as;
    return (
      <header
        ref={ref}
        className={cn(
          'font-polaris flex flex-wrap items-end justify-between gap-polaris-md mb-polaris-md',
          className
        )}
        {...props}
      >
        <div className="min-w-0 flex flex-col gap-polaris-4xs">
          <Heading
            className={cn(
              'text-label-normal',
              as === 'h2' ? 'text-polaris-heading2' : 'text-polaris-heading3'
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className="text-polaris-body2 text-label-neutral">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-polaris-2xs">{actions}</div>
        )}
      </header>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';
