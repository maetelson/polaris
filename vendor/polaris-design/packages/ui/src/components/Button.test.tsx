import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Button } from './Button';

describe('Button', () => {
  it('renders text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-accent-brand-normal');
    expect(btn).toHaveClass('text-label-inverse');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Big</Button>);
    // v0.7-rc.1 spec: lg = 48px height (was rc.0 40px). md = 40px now.
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('shows loading spinner and disables interaction when loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg.animate-spin')).toBeInTheDocument();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('honors disabled prop', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
