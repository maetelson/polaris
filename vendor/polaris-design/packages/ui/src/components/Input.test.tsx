import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { Input } from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="이름" />);
    expect(screen.getByPlaceholderText('이름')).toBeInTheDocument();
  });

  it('associates label and input via htmlFor/id', () => {
    render(<Input label="이름" />);
    const input = screen.getByLabelText('이름');
    expect(input).toBeInTheDocument();
    expect(input.getAttribute('id')).toBeTruthy();
  });

  it('shows hint text', () => {
    render(<Input label="이름" helperText="2~10글자" />);
    expect(screen.getByText('2~10글자')).toBeInTheDocument();
  });

  it('renders error and marks input as invalid', () => {
    render(<Input label="이메일" error="형식이 올바르지 않습니다" />);
    const input = screen.getByLabelText('이메일');
    expect(screen.getByText('형식이 올바르지 않습니다')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('accepts user typing', async () => {
    render(<Input label="이름" />);
    const input = screen.getByLabelText('이름') as HTMLInputElement;
    await userEvent.type(input, 'Miles');
    expect(input.value).toBe('Miles');
  });

  it('renders prefix slot before the input text', () => {
    render(<Input label="amount" prefix="₩" />);
    expect(screen.getByText('₩')).toBeInTheDocument();
  });

  it('renders suffix slot after the input', () => {
    render(<Input label="amount" suffix="KRW" />);
    expect(screen.getByText('KRW')).toBeInTheDocument();
  });

  it('clearable button only appears when value is present', async () => {
    function Controlled() {
      const [v, setV] = useState('');
      return <Input label="검색" clearable value={v} onChange={(e) => setV(e.target.value)} />;
    }
    const user = userEvent.setup();
    render(<Controlled />);
    expect(screen.queryByRole('button', { name: '입력 지우기' })).toBeNull();
    await user.type(screen.getByLabelText('검색'), 'hello');
    expect(screen.getByRole('button', { name: '입력 지우기' })).toBeInTheDocument();
  });

  it('clicking clear resets the value and fires onClear', async () => {
    const onClear = vi.fn();
    function Controlled() {
      const [v, setV] = useState('hello');
      return (
        <Input
          label="검색"
          clearable
          value={v}
          onChange={(e) => setV(e.target.value)}
          onClear={onClear}
        />
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: '입력 지우기' }));
    expect((screen.getByLabelText('검색') as HTMLInputElement).value).toBe('');
    expect(onClear).toHaveBeenCalled();
  });

  it('hasValue stays in sync when the parent resets controlled value to ""', () => {
    function Wrapper() {
      const [v, setV] = useState('hello');
      return (
        <>
          <Input label="이름" value={v} onChange={(e) => setV(e.target.value)} clearable />
          <button type="button" onClick={() => setV('')}>외부 리셋</button>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Wrapper />);
    // Clear button visible because the field has a value.
    expect(screen.getByRole('button', { name: '입력 지우기' })).toBeInTheDocument();
    // Reset from outside → hasValue should re-sync to false.
    return user.click(screen.getByRole('button', { name: '외부 리셋' })).then(() => {
      expect(screen.queryByRole('button', { name: '입력 지우기' })).toBeNull();
    });
  });

  it('treats value={0} as a present value (not empty) — floating label + clear visible', () => {
    // `Boolean(0)` is false, but 0 is a perfectly valid number input.
    // The floating label must lift, and the clear × must show.
    render(<Input label="amount" value={0} onChange={() => {}} clearable />);
    // Clear button visible.
    expect(screen.getByRole('button', { name: '입력 지우기' })).toBeInTheDocument();
    // Floating label has the floating-state class (top-2 + helper text size).
    const label = screen.getByText('amount');
    expect(label.className).toContain('top-2');
  });

  it('empty string and undefined are correctly treated as absent', () => {
    // `null` isn't part of `InputProps['value']` (TS forbids it), so we
    // verify only the two values consumers can actually pass: '' and
    // undefined. Either should leave the clear × hidden + the floating
    // label in its centered (placeholder-style) state.
    const { rerender } = render(
      <Input label="x" value="" onChange={() => {}} clearable />
    );
    expect(screen.queryByRole('button', { name: '입력 지우기' })).toBeNull();
    rerender(<Input label="x" value={undefined} onChange={() => {}} clearable />);
    expect(screen.queryByRole('button', { name: '입력 지우기' })).toBeNull();
  });
});
