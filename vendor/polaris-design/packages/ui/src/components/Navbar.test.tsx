import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarActions,
  NavbarItem,
} from './Navbar';

describe('Navbar — landmarks', () => {
  it('renders <header> + nested <nav> for screen-reader navigation', () => {
    render(
      <Navbar>
        <NavbarBrand>Brand</NavbarBrand>
        <NavbarNav>
          <NavbarItem>대시보드</NavbarItem>
        </NavbarNav>
        <NavbarActions>
          <button>로그인</button>
        </NavbarActions>
      </Navbar>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument(); // <header>
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // <nav>
  });
});

describe('NavbarItem', () => {
  it('renders as a <button> by default', () => {
    render(<NavbarItem>대시보드</NavbarItem>);
    const el = screen.getByRole('button', { name: '대시보드' });
    expect(el.tagName).toBe('BUTTON');
    expect(el).toHaveAttribute('type', 'button');
  });

  it('renders as <a href> when href is provided (no asChild)', () => {
    render(<NavbarItem href="/dashboard">대시보드</NavbarItem>);
    const el = screen.getByRole('link', { name: '대시보드' });
    expect(el.tagName).toBe('A');
    expect(el).toHaveAttribute('href', '/dashboard');
  });

  it('asChild forwards Slot to a custom element (e.g. Next.js <Link>)', () => {
    render(
      <NavbarItem asChild active>
        <a href="/docs" data-testid="link">문서</a>
      </NavbarItem>
    );
    const el = screen.getByTestId('link');
    expect(el.tagName).toBe('A');
    // active prop wires aria-current="page" through Slot.
    expect(el).toHaveAttribute('aria-current', 'page');
  });

  it('active=true sets aria-current="page" + brand tint class', () => {
    render(<NavbarItem active>대시보드</NavbarItem>);
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('aria-current', 'page');
    expect(el).toHaveClass('bg-accent-brand-normal-subtle');
    expect(el).toHaveClass('text-accent-brand-normal');
  });

  it('active=false omits aria-current entirely', () => {
    render(<NavbarItem>x</NavbarItem>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-current');
  });

  it('renders icon slot before children', () => {
    render(
      <NavbarItem icon={<svg data-testid="ic" />}>대시보드</NavbarItem>
    );
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });

  it('fires onClick when used as a button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavbarItem onClick={onClick}>x</NavbarItem>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
