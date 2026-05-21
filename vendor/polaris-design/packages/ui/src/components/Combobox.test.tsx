import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Combobox, type ComboboxOption } from './Combobox';

const CITIES: ComboboxOption[] = [
  { value: 'seoul',  label: '서울' },
  { value: 'busan',  label: '부산' },
  { value: 'daegu',  label: '대구' },
];

describe('Combobox — single', () => {
  it('renders the placeholder when no value is selected', () => {
    render(<Combobox options={CITIES} placeholder="도시 선택" />);
    expect(screen.getByText('도시 선택')).toBeInTheDocument();
  });

  it('opens the popover on click and renders options', async () => {
    const user = userEvent.setup();
    render(<Combobox options={CITIES} placeholder="도시 선택" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('서울')).toBeInTheDocument();
    expect(screen.getByText('부산')).toBeInTheDocument();
  });

  it('selecting an option fires onChange with the value (single mode)', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Combobox options={CITIES} onChange={onChange} placeholder="도시 선택" />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('서울'));
    expect(onChange).toHaveBeenCalledWith('seoul');
  });

  it('controlled value reflects in the trigger label', () => {
    function Controlled() {
      const [v, setV] = useState<string>('busan');
      return <Combobox options={CITIES} value={v} onChange={setV as (v: string | null) => void} placeholder="x" />;
    }
    render(<Controlled />);
    expect(screen.getByText('부산')).toBeInTheDocument();
  });

  it('clear button (×) clears the selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Combobox options={CITIES} value="seoul" onChange={onChange} placeholder="도시 선택" />);
    await user.click(screen.getByRole('button', { name: '선택 해제' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('clear button is a sibling of the trigger (not nested) and is keyboard-focusable', async () => {
    const user = userEvent.setup();
    render(<Combobox options={CITIES} value="seoul" placeholder="x" />);
    const trigger = screen.getByRole('combobox');
    const clear = screen.getByRole('button', { name: '선택 해제' });
    // The clear button must NOT be a descendant of the combobox button
    // (interactive-in-interactive nesting is invalid HTML / a11y).
    expect(trigger.contains(clear)).toBe(false);
    // It also has to be reachable via keyboard — the previous tabIndex={-1}
    // hid it from the tab order.
    expect(clear).not.toHaveAttribute('tabindex', '-1');
    // And tab from the trigger should land somewhere reachable (smoke check
    // that the clear is in the natural tab order).
    trigger.focus();
    await user.tab();
    // The popover trigger likely gains aria-expanded on focus shifts; we only
    // assert that the clear button is *focusable* (focus didn't get stuck).
    expect(document.activeElement).not.toBe(trigger);
  });

  it('clicking clear does NOT open the popover (sibling element, no propagation)', async () => {
    const user = userEvent.setup();
    render(<Combobox options={CITIES} value="seoul" placeholder="x" />);
    await user.click(screen.getByRole('button', { name: '선택 해제' }));
    // Popover stays closed — combobox aria-expanded should remain false.
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Combobox — multiple', () => {
  it('renders selected count when multiple values', () => {
    render(<Combobox multiple options={CITIES} value={['seoul', 'busan']} placeholder="x" />);
    expect(screen.getByText('2개 선택됨')).toBeInTheDocument();
  });

  it('toggling option in multi mode adds/removes from array', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Combobox
        multiple
        options={CITIES}
        value={['seoul']}
        onChange={onChange}
        placeholder="x"
      />
    );
    await user.click(screen.getByRole('combobox'));
    // 부산 추가
    await user.click(await screen.findByText('부산'));
    expect(onChange).toHaveBeenLastCalledWith(['seoul', 'busan']);
  });
});
