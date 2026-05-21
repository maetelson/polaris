import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders text content', () => {
    render(<Badge>NEW</Badge>);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('applies neutral subtle variant by default', () => {
    render(<Badge>x</Badge>);
    expect(screen.getByText('x')).toHaveClass('bg-neutral-100');
  });

  it('uses subtle tone by default', () => {
    render(<Badge variant="danger">만료</Badge>);
    // tone=subtle (default) for danger uses /15 alpha background
    expect(screen.getByText('만료').className).toMatch(/bg-state-error/);
  });

  it('applies solid tone classes when tone="solid"', () => {
    render(
      <Badge variant="primary" tone="solid">
        new
      </Badge>
    );
    expect(screen.getByText('new')).toHaveClass('bg-accent-brand-normal');
    expect(screen.getByText('new')).toHaveClass('text-label-inverse');
  });

  it('applies outline tone classes when tone="outline" — WCAG AA *-strong tokens', () => {
    render(
      <Badge variant="danger" tone="outline">
        정책 위반
      </Badge>
    );
    const el = screen.getByText('정책 위반');
    // Transparent bg + 1px border + the WCAG-AA `*-strong` state tier
    // (ramp 70 light / ramp 30 dark — passes 4.5:1 AA at 12px).
    expect(el).toHaveClass('bg-transparent');
    expect(el).toHaveClass('border');
    expect(el).toHaveClass('border-state-error-strong');
    expect(el).toHaveClass('text-state-error-strong');
  });

  it('outline tone applies neutral border-strong + label-normal text for neutral variant', () => {
    render(
      <Badge variant="neutral" tone="outline">
        초안
      </Badge>
    );
    expect(screen.getByText('초안')).toHaveClass('border-line-strong');
    expect(screen.getByText('초안')).toHaveClass('text-label-normal');
  });

  it('outline tone uses brand-strong / ai-strong (not -normal) for primary/secondary', () => {
    const { rerender } = render(
      <Badge variant="primary" tone="outline">검토 중</Badge>
    );
    expect(screen.getByText('검토 중')).toHaveClass('text-accent-brand-strong');

    rerender(<Badge variant="secondary" tone="outline">AI 임시</Badge>);
    expect(screen.getByText('AI 임시')).toHaveClass('text-ai-strong');
  });

  it('outline tone uses label-normal text for file variants (file ramp-50 fails AA at 12px)', () => {
    render(
      <Badge variant="docx" tone="outline">DOCX</Badge>
    );
    const el = screen.getByText('DOCX');
    // Border keeps the file color (visual identity) but text shifts to
    // label-normal so 12px text passes WCAG AA on white.
    expect(el).toHaveClass('border-file-docx');
    expect(el).toHaveClass('text-label-normal');
  });

  it('renders dismissible × button + fires onDismiss', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const { vi } = await import('vitest');
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<Badge dismissible onDismiss={onDismiss}>filter</Badge>);
    await user.click(screen.getByRole('button', { name: '제거' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('dismiss hover bg is tone-aware (solid → white tint, subtle/outline → black tint)', () => {
    // On solid tone the badge text/X is WHITE on a dark filled bg —
    // a light-gray hover patch would blend with the white X. Use a
    // translucent WHITE tint instead.
    const { rerender } = render(
      <Badge variant="primary" tone="solid" dismissible>x</Badge>
    );
    expect(screen.getByRole('button', { name: '제거' }).className).toContain('hover:bg-static-white/25');

    // On subtle/outline tones the X is colored on a light bg, so the
    // visible hover patch should be a translucent BLACK tint.
    rerender(<Badge variant="primary" tone="subtle" dismissible>x</Badge>);
    expect(screen.getByRole('button', { name: '제거' }).className).toContain('hover:bg-static-black/10');

    rerender(<Badge variant="danger" tone="outline" dismissible>x</Badge>);
    expect(screen.getByRole('button', { name: '제거' }).className).toContain('hover:bg-static-black/10');
  });

  it('renders icon slot before the children', () => {
    render(<Badge icon={<svg data-testid="badge-ic" />}>완료</Badge>);
    const el = screen.getByText('완료');
    // Icon is a sibling rendered before the text.
    expect(el.parentElement?.querySelector('[data-testid="badge-ic"]')).toBeInTheDocument();
  });
});
