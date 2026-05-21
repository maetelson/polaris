import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Pagination,
  PaginationItem,
  PaginationPrev,
  PaginationNext,
  PaginationEllipsis,
  PaginationFooter,
  pageNumberItems,
  PAGE_ELLIPSIS,
} from './Pagination';

describe('Pagination', () => {
  it('renders with proper nav landmark and aria-label', () => {
    render(
      <Pagination>
        <PaginationItem active>1</PaginationItem>
      </Pagination>
    );
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('marks the active page with aria-current', () => {
    render(
      <Pagination>
        <PaginationItem>1</PaginationItem>
        <PaginationItem active>2</PaginationItem>
        <PaginationItem>3</PaginationItem>
      </Pagination>
    );
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('fires onClick on item click', async () => {
    const onClick = vi.fn();
    render(
      <Pagination>
        <PaginationItem onClick={onClick}>1</PaginationItem>
      </Pagination>
    );
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('PaginationPrev and Next render with directional aria labels', () => {
    render(
      <Pagination>
        <PaginationPrev />
        <PaginationNext />
      </Pagination>
    );
    expect(screen.getByRole('button', { name: /prev|이전/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next|다음/i })).toBeInTheDocument();
  });

  it('PaginationEllipsis renders as a non-interactive span', () => {
    const { container } = render(
      <Pagination>
        <PaginationEllipsis />
      </Pagination>
    );
    // ellipsis should not be a button
    expect(container.querySelector('button')).toBeNull();
  });
});

describe('pageNumberItems()', () => {
  it('returns full sequence when total is small', () => {
    expect(pageNumberItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('inserts ellipses around the current page', () => {
    expect(pageNumberItems(7, 20)).toEqual([1, PAGE_ELLIPSIS, 5, 6, 7, 8, 9, PAGE_ELLIPSIS, 20]);
  });
});

describe('PaginationFooter', () => {
  it('renders the X-Y of N indicator', () => {
    render(
      <PaginationFooter page={2} pageSize={10} total={45} onPageChange={() => {}} />
    );
    expect(screen.getByText('11-20 / 45')).toBeInTheDocument();
  });

  it('hides total indicator when showTotal=false', () => {
    render(
      <PaginationFooter
        page={1}
        pageSize={10}
        total={20}
        showTotal={false}
        onPageChange={() => {}}
      />
    );
    expect(screen.queryByText('1-10 / 20')).not.toBeInTheDocument();
  });

  it('hides page-size selector when onPageSizeChange is omitted', () => {
    render(
      <PaginationFooter page={1} pageSize={10} total={20} onPageChange={() => {}} />
    );
    expect(screen.queryByText('페이지당')).not.toBeInTheDocument();
  });

  it('renders page-size selector when onPageSizeChange is provided', () => {
    render(
      <PaginationFooter
        page={1}
        pageSize={10}
        total={100}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
      />
    );
    expect(screen.getByText('페이지당')).toBeInTheDocument();
  });

  it('fires onPageChange when a numbered button is clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PaginationFooter page={1} pageSize={10} total={50} onPageChange={onPageChange} />
    );
    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables prev on page 1 and next on the last page', () => {
    const { unmount } = render(
      <PaginationFooter page={1} pageSize={10} total={20} onPageChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled();
    unmount();

    render(<PaginationFooter page={2} pageSize={10} total={20} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled();
  });

  it('clamps an out-of-range page to the valid window', () => {
    render(
      <PaginationFooter page={99} pageSize={10} total={20} onPageChange={() => {}} />
    );
    expect(screen.getByText('11-20 / 20')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('showPageSize={false} hides the selector even with onPageSizeChange set', () => {
    render(
      <PaginationFooter
        page={1}
        pageSize={10}
        total={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        showPageSize={false}
      />
    );
    expect(screen.queryByText('페이지당')).toBeNull();
  });

  it('showPageSize={true} forces the selector visible (legacy behavior)', () => {
    render(
      <PaginationFooter
        page={1}
        pageSize={10}
        total={50}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        showPageSize
      />
    );
    expect(screen.getByText('페이지당')).toBeInTheDocument();
  });
});

describe('PaginationPrev / PaginationNext — asChild + icon (v0.8.0-rc.8 RSC fix)', () => {
  it('PaginationPrev renders default chevron icon as button', () => {
    const { container } = render(<PaginationPrev label="prev" />);
    // Default icon present (svg child of the button)
    expect(container.querySelector('button > svg')).toBeInTheDocument();
  });

  it('PaginationPrev asChild + Link wrapper does NOT explode with Children.only', () => {
    // Pre-rc.8: this rendered <Slot> with [Chevron, "이전"] → React.Children.only
    // exploded. Post-rc.8: Slottable wraps the children so Slot sees a
    // single render target (the <a>), chevron sits as sibling.
    expect(() =>
      render(
        <PaginationPrev asChild>
          <a href="/?page=1">이전</a>
        </PaginationPrev>
      )
    ).not.toThrow();
    const anchor = screen.getByRole('link', { name: /이전 페이지/ });
    expect(anchor).toBeInTheDocument();
    expect(anchor.getAttribute('href')).toBe('/?page=1');
    // Chevron still rendered alongside the link text
    expect(anchor.querySelector('svg')).toBeInTheDocument();
  });

  it('PaginationNext asChild + custom icon overrides the default chevron', () => {
    render(
      <PaginationNext asChild icon={<span data-testid="custom-icon">→</span>}>
        <a href="/?page=2">다음</a>
      </PaginationNext>
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('icon={null} omits the chevron entirely', () => {
    const { container } = render(<PaginationPrev icon={null}>이전</PaginationPrev>);
    expect(container.querySelector('button > svg')).toBeNull();
  });
});

// ─── Type-level test: discriminated union enforcement ─────────────
// Compile-time only. If `@ts-expect-error` stops triggering, the union
// regressed back to "both optional" — the rc.7 footgun where neither
// callback nor anchor was wired and the toolbar rendered inert.
function _typeTest_PaginationFooterUnion() {
  // ✓ controlled mode — onPageChange required
  const _a = <PaginationFooter page={1} total={50} pageSize={10} onPageChange={() => {}} />;
  // ✓ anchor mode — buildHref required
  const _b = <PaginationFooter page={1} total={50} pageSize={10} buildHref={(p) => `?p=${p}`} />;
  // ✓ both modes co-exist
  const _c = (
    <PaginationFooter
      page={1} total={50} pageSize={10}
      buildHref={(p) => `?p=${p}`}
      onPageChange={() => {}}
    />
  );
  // ✗ neither — must be a type error
  // @ts-expect-error -- discriminated union requires onPageChange OR buildHref
  const _d = <PaginationFooter page={1} total={50} pageSize={10} />;
  return [_a, _b, _c, _d];
}

describe('PaginationFooter — buildHref anchor mode (RSC)', () => {
  it('renders <a> elements with href when buildHref is set', () => {
    render(
      <PaginationFooter
        page={2}
        pageSize={10}
        total={50}
        buildHref={(p) => `?page=${p}`}
      />
    );
    // Each page number is an anchor with the correct href
    const link1 = screen.getByRole('link', { name: '1' });
    const link3 = screen.getByRole('link', { name: '3' });
    expect(link1.getAttribute('href')).toBe('?page=1');
    expect(link3.getAttribute('href')).toBe('?page=3');
  });

  it('active page anchor has aria-current="page"', () => {
    render(
      <PaginationFooter
        page={2}
        pageSize={10}
        total={50}
        buildHref={(p) => `?page=${p}`}
      />
    );
    const link2 = screen.getByRole('link', { name: '2' });
    expect(link2.getAttribute('aria-current')).toBe('page');
  });

  it('renders prev/next as anchors with adjacent page hrefs', () => {
    render(
      <PaginationFooter
        page={3}
        pageSize={10}
        total={50}
        buildHref={(p) => `?page=${p}`}
      />
    );
    const prev = screen.getByRole('link', { name: /이전 페이지/ });
    const next = screen.getByRole('link', { name: /다음 페이지/ });
    expect(prev.getAttribute('href')).toBe('?page=2');
    expect(next.getAttribute('href')).toBe('?page=4');
  });

  it('disables prev/next at boundaries (no anchor rendered, falls back to disabled button)', () => {
    render(
      <PaginationFooter
        page={1}
        pageSize={10}
        total={50}
        buildHref={(p) => `?page=${p}`}
      />
    );
    // First page → prev is disabled button, not a link
    const prevButton = screen.getByRole('button', { name: /이전 페이지/ });
    expect(prevButton).toHaveAttribute('disabled');
  });

  it('controlled mode unchanged when buildHref is omitted', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PaginationFooter
        page={1}
        pageSize={10}
        total={50}
        onPageChange={onPageChange}
      />
    );
    // Page items are still buttons
    expect(screen.queryByRole('link', { name: '2' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
