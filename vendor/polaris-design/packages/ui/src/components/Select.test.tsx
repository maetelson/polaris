import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './Select';

describe('Select', () => {
  it('renders the trigger with the current value', () => {
    render(
      <Select defaultValue="docx">
        <SelectTrigger aria-label="파일 형식">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="docx">DOCX</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = screen.getByRole('combobox', { name: '파일 형식' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('DOCX');
  });

  it('SelectTrigger has whitespace-nowrap to prevent line wrapping', () => {
    render(
      <Select>
        <SelectTrigger aria-label="긴 옵션">
          <SelectValue placeholder="..." />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveClass('whitespace-nowrap');
  });
});
