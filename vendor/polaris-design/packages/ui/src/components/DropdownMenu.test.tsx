import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuFormItem,
} from './DropdownMenu';
import { Button } from './Button';

/**
 * `<form action={fn}>` is a React 19 + Next.js feature. In our React 18 jsdom
 * env it stringifies the function and never calls it on submit. Instead we
 * spy on `HTMLFormElement.prototype.requestSubmit` to verify the component
 * triggers the right submit pathway for both pointer and keyboard activations.
 */
function FormMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuFormItem
          action="/auth/sign-out"
          hiddenFields={{ scope: 'session' }}
        >
          로그아웃
        </DropdownMenuFormItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenuFormItem', () => {
  let requestSubmitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    requestSubmitSpy = vi.spyOn(HTMLFormElement.prototype, 'requestSubmit').mockImplementation(() => {});
  });
  afterEach(() => {
    requestSubmitSpy.mockRestore();
  });

  it('triggers form.requestSubmit() on pointer click', async () => {
    render(<FormMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /로그아웃/ }));
    expect(requestSubmitSpy).toHaveBeenCalled();
  });

  it('triggers form.requestSubmit() on keyboard activation (Enter)', async () => {
    const user = userEvent.setup();
    render(<FormMenu />);
    // Open menu via keyboard so focus lands on the trigger first, then Radix
    // moves focus to first menuitem on ArrowDown.
    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(requestSubmitSpy).toHaveBeenCalled();
  });

  it('renders hidden inputs from hiddenFields', async () => {
    render(<FormMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const hidden = document.querySelector('input[type="hidden"][name="scope"]') as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe('session');
  });
});
