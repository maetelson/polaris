import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders with role="progressbar" and ARIA value when determinate', () => {
    render(<Progress value={47} aria-label="업로드" />);
    const bar = screen.getByRole('progressbar', { name: '업로드' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '47');
  });

  it('omits aria-valuenow when indeterminate (value omitted)', () => {
    render(<Progress aria-label="loading" />);
    const bar = screen.getByRole('progressbar', { name: 'loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('omits aria-valuenow when value=null (explicit indeterminate)', () => {
    render(<Progress value={null} aria-label="loading" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('clamps value to [min, max]', () => {
    render(<Progress value={150} aria-label="over" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps negative value to min', () => {
    render(<Progress value={-10} aria-label="under" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('honors custom min/max', () => {
    render(<Progress value={5} min={0} max={10} aria-label="docs" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
    expect(bar).toHaveAttribute('aria-valuenow', '5');
  });

  it('applies tone variant classes to the fill', () => {
    const { container } = render(<Progress value={50} variant="success" aria-label="ok" />);
    // Fill is the inner div (the only child of the progressbar root).
    const fill = container.querySelector('[role="progressbar"] > div');
    expect(fill).toHaveClass('bg-state-success');
  });

  it('applies size variant to the track', () => {
    render(<Progress value={50} size="lg" aria-label="big" />);
    expect(screen.getByRole('progressbar')).toHaveClass('h-3');
  });
});
