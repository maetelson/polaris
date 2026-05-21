import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with role=status + aria-busy + aria-label', () => {
    render(<Skeleton />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveAttribute('aria-label', '로딩 중');
  });

  it('uses motion-safe prefix on the pulse animation (reduced-motion safe)', () => {
    render(<Skeleton data-testid="rect" />);
    // The pulse must be gated on motion-safe so users with
    // prefers-reduced-motion don't see the shimmer at all.
    expect(screen.getByTestId('rect').className).toContain('motion-safe:animate-pulse');
    expect(screen.getByTestId('rect').className).not.toMatch(/(?<!:)animate-pulse/);
  });

  it('shape="text" + lines={N} renders N rows with the last shortened', () => {
    const { container } = render(<Skeleton shape="text" lines={3} data-testid="multi" />);
    const rows = container.querySelectorAll('[data-testid="multi"] > div');
    expect(rows.length).toBe(3);
    expect(rows[rows.length - 1]?.className).toContain('w-[70%]');
  });

  it('shape="circle" applies pill radius + aspect-square', () => {
    render(<Skeleton shape="circle" className="h-10 w-10" data-testid="c" />);
    const el = screen.getByTestId('c');
    expect(el.className).toContain('rounded-polaris-pill');
    expect(el.className).toContain('aspect-square');
  });
});
