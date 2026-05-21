import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from './Card';

describe('Card', () => {
  it('renders children inside a div', () => {
    render(<Card>content</Card>);
    expect(screen.getByText('content').tagName).toBe('DIV');
  });

  it('does not apply padding by default (bare)', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstChild).not.toHaveClass('px-5');
  });

  it('applies padding when variant="padded"', () => {
    const { container } = render(<Card variant="padded">x</Card>);
    expect(container.firstChild).toHaveClass('px-5');
    expect(container.firstChild).toHaveClass('py-4');
  });

  it('renders as the asChild element', () => {
    render(
      <Card asChild>
        <article>article content</article>
      </Card>
    );
    expect(screen.getByText('article content').tagName).toBe('ARTICLE');
  });

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>x</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('CardHeader/Title/Body/Footer compose without errors', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>제목</CardTitle>
        </CardHeader>
        <CardBody>본문</CardBody>
        <CardFooter>푸터</CardFooter>
      </Card>
    );
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('본문')).toBeInTheDocument();
    expect(screen.getByText('푸터')).toBeInTheDocument();
  });
});
