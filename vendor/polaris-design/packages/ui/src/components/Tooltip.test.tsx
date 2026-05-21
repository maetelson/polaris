import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider, SimpleTooltip } from './Tooltip';
import { Button } from './Button';

describe('SimpleTooltip', () => {
  it('renders the trigger child immediately', () => {
    render(
      <TooltipProvider>
        <SimpleTooltip label="설명">
          <Button>도움</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );
    expect(screen.getByRole('button', { name: '도움' })).toBeInTheDocument();
  });

  it('shows tooltip text after focusing the trigger', async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <SimpleTooltip label="저장하기">
          <Button>저장</Button>
        </SimpleTooltip>
      </TooltipProvider>
    );
    const btn = screen.getByRole('button', { name: '저장' });
    await userEvent.tab();
    btn.focus();
    // Radix renders the tooltip both visibly and in a hidden screen-reader
    // span — both have the same text. Match by role to disambiguate.
    expect(await screen.findByRole('tooltip')).toHaveTextContent('저장하기');
  });
});
