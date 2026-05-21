import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileInput, FileDropZone } from './FileInput';

function makeFile(name: string, sizeBytes = 1024, type = 'text/plain') {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('FileInput', () => {
  it('renders trigger button + label', () => {
    render(<FileInput label="첨부 파일" />);
    expect(screen.getByText('첨부 파일')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /파일 선택/ })).toBeInTheDocument();
  });

  it('shows error treatment when error prop is set', () => {
    render(<FileInput label="x" error="필수 항목" />);
    expect(screen.getByRole('alert')).toHaveTextContent('필수 항목');
  });

  it('fires onFilesChange after a file is picked', async () => {
    const onFilesChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<FileInput label="x" onFilesChange={onFilesChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('a.txt');
    await user.upload(input, file);
    expect(onFilesChange).toHaveBeenCalledWith([file]);
  });

  it('shows "파일 외 N개" summary when multiple files are picked', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileInput label="x" multiple />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')]);
    expect(screen.getByText(/a\.txt 외 2개/)).toBeInTheDocument();
  });

  it('removing a file from the list calls onFilesChange with the trimmed array', async () => {
    const onFilesChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <FileInput label="x" multiple onFilesChange={onFilesChange} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const a = makeFile('a.txt');
    const b = makeFile('b.txt');
    await user.upload(input, [a, b]);
    onFilesChange.mockClear();
    await user.click(screen.getByRole('button', { name: /a\.txt 제거/ }));
    expect(onFilesChange).toHaveBeenCalledWith([b]);
  });
});

describe('FileDropZone', () => {
  it('renders accessible role=button + activates input on Enter', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileDropZone />);
    const zone = screen.getByRole('button');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    zone.focus();
    await user.keyboard('{Enter}');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('routes accepted files via onFilesChange', () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileDropZone accept=".txt" onFilesChange={onFilesChange} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('a.txt');
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFilesChange).toHaveBeenCalledWith([file]);
  });

  it('routes oversize files via onReject (file-too-large)', () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileDropZone
        maxSize={500}
        onFilesChange={onFilesChange}
        onReject={onReject}
      />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const big = makeFile('big.txt', 2000);
    fireEvent.change(input, { target: { files: [big] } });
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalled();
    const rejection = onReject.mock.calls[0]?.[0][0];
    expect(rejection?.code).toBe('file-too-large');
    expect(rejection?.file).toBe(big);
  });

  it('routes wrong-type files via onReject (file-invalid-type)', () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileDropZone accept=".pdf" onFilesChange={onFilesChange} onReject={onReject} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const wrong = makeFile('a.docx');
    fireEvent.change(input, { target: { files: [wrong] } });
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalled();
    expect(onReject.mock.calls[0]?.[0][0]?.code).toBe('file-invalid-type');
  });

  it('does not activate when disabled', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileDropZone disabled />);
    const zone = screen.getByRole('button');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    await user.click(zone);
    expect(clickSpy).not.toHaveBeenCalled();
    expect(zone).toHaveAttribute('aria-disabled', 'true');
  });

  it('limits dropped files to 1 when multiple is omitted (single-file constraint)', () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileDropZone onFilesChange={onFilesChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')] },
    });
    // multiple omitted (default false) → only first file passes through.
    expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.txt' })]);
  });

  it('passes all dropped files when multiple=true', () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileDropZone multiple onFilesChange={onFilesChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile('a.txt'), makeFile('b.txt')] },
    });
    expect(onFilesChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'a.txt' }),
      expect.objectContaining({ name: 'b.txt' }),
    ]);
  });

  it('composes consumer onClick with our picker activation (both fire)', async () => {
    const user = userEvent.setup();
    const consumerOnClick = vi.fn();
    const { container } = render(<FileDropZone onClick={consumerOnClick} />);
    const zone = screen.getByRole('button');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    await user.click(zone);
    expect(consumerOnClick).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('consumer can preventDefault to opt out of picker activation', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FileDropZone
        onClick={(e) => {
          e.preventDefault();
        }}
      />
    );
    const zone = screen.getByRole('button');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    await user.click(zone);
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
