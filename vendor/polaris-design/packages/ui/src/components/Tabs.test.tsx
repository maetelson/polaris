import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

function Sample() {
  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">Tab A</TabsTrigger>
        <TabsTrigger value="b">Tab B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Content A</TabsContent>
      <TabsContent value="b">Content B</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders the default active tab content', () => {
    render(<Sample />);
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('switches content when another tab is clicked', async () => {
    render(<Sample />);
    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('marks the active trigger with data-state=active', async () => {
    render(<Sample />);
    const tabA = screen.getByRole('tab', { name: 'Tab A' });
    expect(tabA).toHaveAttribute('data-state', 'active');
    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }));
    expect(tabA).toHaveAttribute('data-state', 'inactive');
  });
});
