import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { CopyButton } from './CopyButton';

/**
 * Clipboard mocking note (jsdom 25 + vitest 2 + @testing-library/user-event v14):
 *
 * `userEvent.setup()` installs its own `navigator.clipboard` polyfill on
 * first call to support `user.copy()`/`user.paste()` helpers. That
 * polyfill is installed AFTER any `beforeAll` mock we set, so we must
 * install our spy *after* `userEvent.setup()` runs in each test.
 *
 * Pattern: call `setupClipboardMock(user)` immediately after
 * `userEvent.setup()` — it spies on the user-event clipboard's
 * `writeText` and returns the spy. `vi.restoreAllMocks` in afterEach
 * cleans up so each test gets a fresh spy.
 */
function setupClipboardMock(_user: UserEvent) {
  const spy = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
  return spy;
}

describe('CopyButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('copies text to clipboard on click', async () => {
    const user = userEvent.setup();
    const writeText = setupClipboardMock(user);
    render(<CopyButton text="hello world">복사</CopyButton>);
    await user.click(screen.getByRole('button', { name: /복사/ }));
    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  it('swaps idle → copied label on success, then reverts', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setupClipboardMock(user);
    render(<CopyButton text="x" resetMs={500}>복사</CopyButton>);
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('복사됨')).toBeInTheDocument());
    vi.advanceTimersByTime(600);
    await waitFor(() => expect(screen.getByText('복사')).toBeInTheDocument());
  });

  it('fires onCopy after a successful copy', async () => {
    const onCopy = vi.fn();
    const user = userEvent.setup();
    setupClipboardMock(user);
    render(<CopyButton text="abc" onCopy={onCopy}>복사</CopyButton>);
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(onCopy).toHaveBeenCalledWith('abc'));
  });

  it('fires onError when clipboard.writeText rejects', async () => {
    const user = userEvent.setup();
    const writeText = setupClipboardMock(user);
    writeText.mockRejectedValueOnce(new Error('denied'));
    const onError = vi.fn();
    render(<CopyButton text="x" onError={onError}>복사</CopyButton>);
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(onError).toHaveBeenCalled());
  });

  it('iconOnly hides the text label but copies the same value', async () => {
    const user = userEvent.setup();
    const writeText = setupClipboardMock(user);
    render(<CopyButton text="payload" iconOnly aria-label="복사" />);
    const btn = screen.getByRole('button', { name: '복사' });
    await user.click(btn);
    expect(writeText).toHaveBeenCalledWith('payload');
  });

  it('does not copy when disabled', async () => {
    const user = userEvent.setup();
    const writeText = setupClipboardMock(user);
    render(<CopyButton text="x" disabled>복사</CopyButton>);
    await user.click(screen.getByRole('button'));
    expect(writeText).not.toHaveBeenCalled();
  });

  it('renders aria-live="polite" so screen readers announce the swap', () => {
    render(<CopyButton text="x">복사</CopyButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-live', 'polite');
  });
});
