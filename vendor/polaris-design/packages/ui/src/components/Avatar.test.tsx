import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarFallback, AvatarGroup } from './Avatar';

describe('Avatar', () => {
  it('renders fallback when no image is provided', () => {
    render(
      <Avatar>
        <AvatarFallback>이</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('이')).toBeInTheDocument();
  });

  it('applies size classes (sm/md/lg)', () => {
    const { container, rerender } = render(
      <Avatar size="sm">
        <AvatarFallback>x</AvatarFallback>
      </Avatar>
    );
    expect(container.firstChild).toHaveClass('h-7');
    rerender(
      <Avatar size="lg">
        <AvatarFallback>x</AvatarFallback>
      </Avatar>
    );
    expect(container.firstChild).toHaveClass('h-11');
  });
});

describe('AvatarGroup', () => {
  it('renders all children when count is below max', () => {
    render(
      <AvatarGroup max={4}>
        <Avatar><AvatarFallback>김</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>이</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>박</AvatarFallback></Avatar>
      </AvatarGroup>
    );
    expect(screen.getByText('김')).toBeInTheDocument();
    expect(screen.getByText('이')).toBeInTheDocument();
    expect(screen.getByText('박')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it('truncates to max + shows +N overflow', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar><AvatarFallback>1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>2</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>3</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>4</AvatarFallback></Avatar>
      </AvatarGroup>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).toBeNull();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('propagates size to children + overflow indicator', () => {
    const { container } = render(
      <AvatarGroup size="lg" max={1}>
        <Avatar><AvatarFallback>1</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>2</AvatarFallback></Avatar>
      </AvatarGroup>
    );
    // First avatar inherits size="lg" → h-11.
    const avatars = container.querySelectorAll('[class*="h-11"]');
    expect(avatars.length).toBeGreaterThanOrEqual(1);
  });
});
