import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader, SectionHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title as h1 by default', () => {
    render(<PageHeader title="문서 분석" />);
    expect(screen.getByRole('heading', { level: 1, name: '문서 분석' })).toBeInTheDocument();
  });

  it('renders description, breadcrumb, eyebrow, actions in their slots', () => {
    render(
      <PageHeader
        title="t"
        description="d"
        breadcrumb={<nav aria-label="bc">bc</nav>}
        eyebrow="새 기능"
        actions={<button>x</button>}
      />
    );
    expect(screen.getByText('d')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'bc' })).toBeInTheDocument();
    expect(screen.getByText('새 기능')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'x' })).toBeInTheDocument();
  });

  it('renders title as h2 when as="h2"', () => {
    render(<PageHeader title="t" as="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('omits the divider line when divider=false', () => {
    const { container } = render(<PageHeader title="t" divider={false} />);
    expect(container.firstChild).not.toHaveClass('border-b');
  });
});

describe('SectionHeader', () => {
  it('renders title as h2 by default', () => {
    render(<SectionHeader title="최근 활동" />);
    expect(screen.getByRole('heading', { level: 2, name: '최근 활동' })).toBeInTheDocument();
  });

  it('renders title as h3 when as="h3"', () => {
    render(<SectionHeader title="t" as="h3" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders actions slot to the right', () => {
    render(<SectionHeader title="t" actions={<button>전체 보기</button>} />);
    expect(screen.getByRole('button', { name: '전체 보기' })).toBeInTheDocument();
  });
});
