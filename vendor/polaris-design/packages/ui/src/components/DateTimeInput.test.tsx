import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateTimeInput, TimeInput } from './DateTimeInput';

describe('DateTimeInput', () => {
  it('renders a native datetime-local input with the provided label', () => {
    const { container } = render(<DateTimeInput label="만료일" />);
    expect(screen.getByText('만료일')).toBeInTheDocument();
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('datetime-local');
  });

  it('flips border + renders alert when error is provided', () => {
    const { container } = render(<DateTimeInput label="x" error="필수" />);
    expect(screen.getByRole('alert')).toHaveTextContent('필수');
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveClass('border-state-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders hint text when hint provided (no alert role)', () => {
    render(<DateTimeInput label="x" helperText="브라우저 시간대 기준" />);
    expect(screen.getByText('브라우저 시간대 기준')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('forwards value/onChange to the underlying input', () => {
    const { container } = render(
      <DateTimeInput label="x" value="2026-12-31T23:59" readOnly />
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-12-31T23:59');
  });
});

describe('TimeInput', () => {
  it('renders a native time input', () => {
    const { container } = render(<TimeInput label="알림 시각" />);
    expect(screen.getByText('알림 시각')).toBeInTheDocument();
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('time');
  });

  it('flips border on error', () => {
    const { container } = render(<TimeInput label="x" error="시각 필수" />);
    expect(screen.getByRole('alert')).toHaveTextContent('시각 필수');
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveClass('border-state-error');
  });
});
