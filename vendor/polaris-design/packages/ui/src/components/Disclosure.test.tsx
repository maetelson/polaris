import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Disclosure,
  DisclosureRoot,
  DisclosureTrigger,
  DisclosureContent,
} from './Disclosure';

describe('Disclosure', () => {
  it('renders title in trigger and hides content by default', () => {
    render(
      <Disclosure title="고급 설정">
        <p>세부 옵션</p>
      </Disclosure>
    );
    expect(screen.getByRole('button', { name: '고급 설정' })).toBeInTheDocument();
    expect(screen.queryByText('세부 옵션')).not.toBeInTheDocument();
  });

  it('toggles content on click and updates aria-expanded', async () => {
    const user = userEvent.setup();
    render(
      <Disclosure title="t">
        <p>body</p>
      </Disclosure>
    );
    const trigger = screen.getByRole('button', { name: 't' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('starts open when defaultOpen is set', () => {
    render(
      <Disclosure title="t" defaultOpen>
        <p>body</p>
      </Disclosure>
    );
    expect(screen.getByRole('button', { name: 't' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('respects controlled open prop', async () => {
    const user = userEvent.setup();
    const handleChange = (() => {}) as (o: boolean) => void;
    render(
      <Disclosure title="t" open onOpenChange={handleChange}>
        <p>body</p>
      </Disclosure>
    );
    expect(screen.getByText('body')).toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    // External state hasn't flipped, so still open.
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('hides chevron icon when hideChevron=true', () => {
    const { container } = render(
      <Disclosure title="t" hideChevron>
        <p>body</p>
      </Disclosure>
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('compound API works for custom triggers', async () => {
    const user = userEvent.setup();
    render(
      <DisclosureRoot>
        <DisclosureTrigger>커스텀</DisclosureTrigger>
        <DisclosureContent>세부</DisclosureContent>
      </DisclosureRoot>
    );
    await user.click(screen.getByRole('button', { name: '커스텀' }));
    expect(screen.getByText('세부')).toBeInTheDocument();
  });

  it('headingLevel wraps the trigger in a semantic heading element', () => {
    render(
      <Disclosure title="결제 관련" headingLevel="h2">
        <p>body</p>
      </Disclosure>
    );
    // Screen-readers expose the trigger under a heading outline (H key nav).
    expect(screen.getByRole('heading', { level: 2, name: '결제 관련' })).toBeInTheDocument();
    // The actual click target is still the button inside the heading.
    expect(screen.getByRole('button', { name: '결제 관련' })).toBeInTheDocument();
  });

  it('omits the heading wrapper when headingLevel is unset', () => {
    render(
      <Disclosure title="t">
        <p>body</p>
      </Disclosure>
    );
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('asChild forwards Radix Slot to a single custom child (no built-in chevron)', async () => {
    const user = userEvent.setup();
    render(
      <DisclosureRoot>
        <DisclosureTrigger asChild>
          <button type="button" data-testid="custom-trigger">옵션 보기</button>
        </DisclosureTrigger>
        <DisclosureContent>패널</DisclosureContent>
      </DisclosureRoot>
    );
    const trigger = screen.getByTestId('custom-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // No built-in chevron when asChild is on — only consumer's child.
    expect(trigger.querySelector('svg')).toBeNull();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('패널')).toBeInTheDocument();
  });
});
