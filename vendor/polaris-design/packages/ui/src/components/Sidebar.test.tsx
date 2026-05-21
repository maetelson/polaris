import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Home } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarSection, SidebarItem } from './Sidebar';

describe('Sidebar', () => {
  it('marks active item with brand-primary classes and aria-current', () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection>
            <SidebarItem icon={<Home />} label="Home" active />
            <SidebarItem icon={<Home />} label="Files" />
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    );
    const home = screen.getByRole('button', { name: /Home/ });
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(home).toHaveClass('bg-accent-brand-normal-subtle');
    expect(home).toHaveClass('text-accent-brand-normal');

    const files = screen.getByRole('button', { name: /Files/ });
    expect(files).not.toHaveAttribute('aria-current');
  });

  it('hides label when sidebar is collapsed', () => {
    render(
      <Sidebar collapsed>
        <SidebarBody>
          <SidebarSection title="Files">
            <SidebarItem icon={<Home />} label="Recent" />
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.queryByText('Files')).not.toBeInTheDocument();
    expect(screen.queryByText('Recent')).not.toBeInTheDocument();
  });

  it('renders trailing slot when provided', () => {
    render(
      <Sidebar>
        <SidebarBody>
          <SidebarSection>
            <SidebarItem icon={<Home />} label="Inbox" trailing={<span>12</span>} />
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
    );
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
