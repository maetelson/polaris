import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

describe('Accordion', () => {
  it('opens an item on click and shows its content', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>제목 A</AccordionTrigger>
          <AccordionContent>본문 A</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText('본문 A')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '제목 A' }));
    expect(screen.getByText('본문 A')).toBeInTheDocument();
  });

  it('type="single" closes the previously open item when another opens', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>body-A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>body-B</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(screen.getByText('body-A')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.queryByText('body-A')).not.toBeInTheDocument();
    expect(screen.getByText('body-B')).toBeInTheDocument();
  });

  it('type="multiple" allows multiple opens', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple">
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>body-A</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>B</AccordionTrigger>
          <AccordionContent>body-B</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    await user.click(screen.getByRole('button', { name: 'A' }));
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByText('body-A')).toBeInTheDocument();
    expect(screen.getByText('body-B')).toBeInTheDocument();
  });

  it('aria-expanded reflects open state', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionContent>body</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByRole('button', { name: 'A' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('hideChevron suppresses the chevron icon', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger hideChevron>A</AccordionTrigger>
          <AccordionContent>body</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('svg')).toBeNull();
  });
});
