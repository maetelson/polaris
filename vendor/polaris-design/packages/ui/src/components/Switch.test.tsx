import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders an unchecked switch by default', () => {
    render(<Switch aria-label="라이트 모드" />);
    const sw = screen.getByRole('switch', { name: '라이트 모드' });
    expect(sw).toBeInTheDocument();
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles checked state on click', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="알림" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not fire when disabled', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="알림" disabled onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders label + clicking the label toggles the switch (htmlFor wiring)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="이메일 알림" onCheckedChange={onChange} />);
    await user.click(screen.getByText('이메일 알림'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders hint text below when no error', () => {
    render(<Switch label="공개" helperText="다른 팀에게도 보임" />);
    expect(screen.getByText('다른 팀에게도 보임')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders error with role=alert and aria-invalid on the switch', () => {
    render(<Switch label="공개" error="권한이 없습니다" />);
    expect(screen.getByRole('alert')).toHaveTextContent('권한이 없습니다');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });
});
