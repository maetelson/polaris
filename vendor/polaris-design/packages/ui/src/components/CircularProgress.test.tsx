import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from './CircularProgress';

describe('CircularProgress', () => {
  it('renders progressbar with ARIA value when determinate', () => {
    render(<CircularProgress value={42} aria-label="저장 중" />);
    const bar = screen.getByRole('progressbar', { name: '저장 중' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits aria-valuenow when indeterminate (no value)', () => {
    render(<CircularProgress aria-label="loading" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('omits aria-valuenow when value=null (explicit indeterminate)', () => {
    render(<CircularProgress value={null} aria-label="loading" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('clamps value to [min, max]', () => {
    render(<CircularProgress value={150} aria-label="x" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('applies size variant class to the wrapper', () => {
    render(<CircularProgress size="lg" value={50} aria-label="lg" />);
    expect(screen.getByRole('progressbar')).toHaveClass('h-8');
  });

  it('applies tone class to the foreground arc', () => {
    const { container } = render(
      <CircularProgress tone="success" value={50} aria-label="ok" />
    );
    const arcs = container.querySelectorAll('circle');
    // 2 circles: track (first) + arc (second). Tone class on the arc.
    expect(arcs[1]?.getAttribute('class')).toContain('stroke-state-success');
  });
});
