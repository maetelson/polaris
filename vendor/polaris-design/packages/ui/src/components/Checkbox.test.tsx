import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with a label', () => {
    render(<Checkbox label="동의합니다" />);
    expect(screen.getByLabelText('동의합니다')).toBeInTheDocument();
  });

  it('toggles checked state on click', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="동의" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByLabelText('동의'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows error message and marks aria-invalid', () => {
    render(<Checkbox label="동의" error="필수 항목입니다" />);
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
    expect(screen.getByLabelText('동의')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not fire when disabled', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="동의" disabled onCheckedChange={onChange} />);
    await userEvent.click(screen.getByLabelText('동의'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
