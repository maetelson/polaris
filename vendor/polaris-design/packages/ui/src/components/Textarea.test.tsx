import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea placeholder="내용" />);
    expect(screen.getByPlaceholderText('내용')).toBeInTheDocument();
  });

  it('uses default rows=4', () => {
    render(<Textarea label="설명" />);
    expect(screen.getByLabelText('설명')).toHaveAttribute('rows', '4');
  });

  it('error sets aria-invalid', () => {
    render(<Textarea label="설명" error="필수 항목입니다" />);
    expect(screen.getByLabelText('설명')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('showCount counter updates as the user types in *uncontrolled* mode', async () => {
    const user = userEvent.setup();
    render(<Textarea label="설명" maxLength={50} showCount />);
    expect(screen.getByText('0/50')).toBeInTheDocument();
    await user.type(screen.getByLabelText('설명'), 'hello');
    expect(screen.getByText('5/50')).toBeInTheDocument();
  });

  it('showCount turns state-error color when OVER the limit (controlled value past maxLength)', () => {
    // The browser truncates user typing at `maxLength`, so `user.type`
    // can't actually push the count past it — but a controlled `value`
    // CAN exceed `maxLength` (e.g. when the parent is loading data that
    // doesn't pass through the input). The counter must turn red in
    // that case so the operator sees they're past the limit.
    render(<Textarea label="t" maxLength={3} showCount value="abcd" onChange={() => {}} />);
    const counter = screen.getByText('4/3');
    expect(counter).toHaveClass('text-state-error');
  });

  it('showCount stays in label-alternative color while AT (not over) the limit', async () => {
    const user = userEvent.setup();
    render(<Textarea label="설명" maxLength={3} showCount />);
    await user.type(screen.getByLabelText('설명'), 'abc');
    // At limit (3/3) → still alternative color (not state-error).
    expect(screen.getByText('3/3')).not.toHaveClass('text-state-error');
  });

  it('showCount counter syncs with controlled value updates', () => {
    const { rerender } = render(<Textarea label="t" maxLength={20} showCount value="" onChange={() => {}} />);
    expect(screen.getByText('0/20')).toBeInTheDocument();
    rerender(<Textarea label="t" maxLength={20} showCount value="hi" onChange={() => {}} />);
    expect(screen.getByText('2/20')).toBeInTheDocument();
  });
});
