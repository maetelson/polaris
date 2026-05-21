import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stat, StatGroup } from './Stat';

describe('Stat', () => {
  it('renders label + value', () => {
    render(<Stat label="조회수" value="1,234" />);
    expect(screen.getByText('조회수')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders delta when provided', () => {
    render(<Stat label="조회수" value="1,234" delta="+12%" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('omits delta region when delta not provided', () => {
    render(<Stat label="조회수" value="1,234" />);
    expect(screen.queryByText('+12%')).not.toBeInTheDocument();
  });

  it('applies positive tone color to delta', () => {
    render(<Stat label="x" value="1" delta="+5%" deltaVariant="positive" />);
    expect(screen.getByText('+5%')).toHaveClass('text-state-success');
  });

  it('applies negative tone color to delta', () => {
    render(<Stat label="x" value="1" delta="-3%" deltaVariant="negative" />);
    expect(screen.getByText('-3%')).toHaveClass('text-state-error');
  });

  it('renders helper text when provided', () => {
    render(<Stat label="x" value="1" helper="지난 7일 기준" />);
    expect(screen.getByText('지난 7일 기준')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <Stat label="x" value="1" icon={<svg data-testid="ic" />} />
    );
    expect(container.querySelector('[data-testid="ic"]')).toBeInTheDocument();
  });

  it('formats numeric value via Intl.NumberFormat (locale-aware comma)', () => {
    render(<Stat label="조회수" value={1234567} numberLocale="en-US" />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('honors numberFormat options (currency)', () => {
    render(
      <Stat
        label="매출"
        value={3500000}
        numberLocale="en-US"
        numberFormat={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
      />
    );
    expect(screen.getByText('$3,500,000')).toBeInTheDocument();
  });

  it('passes ReactNode value through unchanged (string / pre-formatted)', () => {
    render(<Stat label="x" value="1.2M" />);
    expect(screen.getByText('1.2M')).toBeInTheDocument();
  });
});

describe('StatGroup', () => {
  it('wraps each Stat child in a Card with h-full (equal heights)', () => {
    const { container } = render(
      <StatGroup cols={3}>
        <Stat label="a" value={1} />
        <Stat label="b" value={2} />
        <Stat label="c" value={3} helper="지난 7일" />
      </StatGroup>
    );
    // Each direct child of the grid is a Card wrapper with h-full.
    const wrappers = container.firstElementChild?.children;
    expect(wrappers?.length).toBe(3);
    Array.from(wrappers ?? []).forEach((el) => {
      expect(el.className).toContain('h-full');
    });
  });

  it('passes non-Stat children through as-is (no auto-wrap)', () => {
    render(
      <StatGroup cols={2}>
        <Stat label="a" value={1} />
        <div data-testid="custom">차트</div>
      </StatGroup>
    );
    // The custom div is rendered without an extra Card wrapper around it.
    const custom = screen.getByTestId('custom');
    // Its parent is the grid container directly (not a Card).
    expect(custom.parentElement?.tagName.toLowerCase()).toBe('div');
    expect(custom.parentElement?.className).toContain('grid');
  });

  it('cols=4 applies grid-cols-2 md:grid-cols-4', () => {
    const { container } = render(
      <StatGroup cols={4}>
        <Stat label="a" value={1} />
      </StatGroup>
    );
    expect(container.firstChild).toHaveClass('md:grid-cols-4');
  });
});
