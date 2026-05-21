import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileIcon } from './FileIcon';

describe('FileIcon', () => {
  it('renders an SVG with default aria-label per type', () => {
    render(<FileIcon type="docx" data-testid="docx-icon" />);
    const el = screen.getByTestId('docx-icon');
    expect(el.tagName.toLowerCase()).toBe('svg');
    expect(el).toHaveAttribute('aria-label', 'docx file');
  });

  it('respects a custom aria-label', () => {
    render(<FileIcon type="pdf" aria-label="Project plan PDF" />);
    expect(screen.getByLabelText('Project plan PDF')).toBeInTheDocument();
  });

  it('renders different SVG content per type (docx vs xlsx vs pdf)', () => {
    const { container, rerender } = render(<FileIcon type="docx" />);
    const docxHtml = container.innerHTML;
    rerender(<FileIcon type="xlsx" />);
    const xlsxHtml = container.innerHTML;
    rerender(<FileIcon type="pdf" />);
    const pdfHtml = container.innerHTML;
    expect(docxHtml).not.toEqual(xlsxHtml);
    expect(xlsxHtml).not.toEqual(pdfHtml);
  });

  it('honors size prop', () => {
    render(<FileIcon type="folder" size={64} data-testid="folder" />);
    const el = screen.getByTestId('folder');
    expect(el).toHaveAttribute('width', '64');
    expect(el).toHaveAttribute('height', '64');
  });

  it('supports the v0.7-rc.1 type set + new types (folder, image, video, zip)', () => {
    // Smoke-test — every type in the registry should render without
    // throwing. Catch regressions if a generated entry goes missing.
    const types = ['docx', 'hwp', 'xlsx', 'pptx', 'pdf', 'folder', 'image', 'video', 'zip', 'unknown'] as const;
    for (const t of types) {
      const { container, unmount } = render(<FileIcon type={t} />);
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });
});
