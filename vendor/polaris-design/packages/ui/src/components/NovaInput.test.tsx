import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NovaInput } from './NovaInput';

describe('NovaInput', () => {
  it('renders the input with placeholder', () => {
    render(<NovaInput placeholder="NOVA에게 물어보세요" />);
    expect(screen.getByPlaceholderText('NOVA에게 물어보세요')).toBeInTheDocument();
  });

  it('exposes a send button by default', () => {
    render(<NovaInput sendLabel="보내기" />);
    expect(screen.getByRole('button', { name: '보내기' })).toBeInTheDocument();
  });

  it('calls onSubmit when Enter is pressed with content', async () => {
    const onSubmit = vi.fn();
    render(<NovaInput onSubmit={onSubmit} placeholder="ask" />);
    const input = screen.getByPlaceholderText('ask') as HTMLInputElement;
    await userEvent.type(input, '안녕{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('안녕');
  });

  it('does not call onSubmit when value is empty', async () => {
    const onSubmit = vi.fn();
    render(<NovaInput onSubmit={onSubmit} placeholder="ask" />);
    const input = screen.getByPlaceholderText('ask') as HTMLInputElement;
    await userEvent.type(input, '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when send button is clicked', async () => {
    const onSubmit = vi.fn();
    render(<NovaInput onSubmit={onSubmit} placeholder="ask" sendLabel="send" />);
    await userEvent.type(screen.getByPlaceholderText('ask'), 'hi');
    await userEvent.click(screen.getByRole('button', { name: 'send' }));
    expect(onSubmit).toHaveBeenCalledWith('hi');
  });
});
