import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './Table';

describe('Table — primitive', () => {
  it('renders a semantic table with rows + cells', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>홍길동</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '홍길동' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '이름' })).toBeInTheDocument();
  });
});

describe('TableHead — sortable', () => {
  it('renders a button when `sortable` is set', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable>이름</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole('button', { name: /이름/ })).toBeInTheDocument();
  });

  it('does NOT render a button when `sortable` is unset', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('reflects sortDirection via aria-sort on the th', () => {
    const { rerender } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection={null}>
              이름
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'none');

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="asc">
              이름
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'ascending');

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="desc">
              이름
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'descending');
  });

  it('cycles null → asc → desc → null on click via onSortChange', async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection={null} onSortChange={onSortChange}>
              이름
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    await user.click(screen.getByRole('button'));
    expect(onSortChange).toHaveBeenLastCalledWith('asc');

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="asc" onSortChange={onSortChange}>
              이름
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    await user.click(screen.getByRole('button'));
    expect(onSortChange).toHaveBeenLastCalledWith('desc');

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="desc" onSortChange={onSortChange}>
              이름
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    await user.click(screen.getByRole('button'));
    expect(onSortChange).toHaveBeenLastCalledWith(null);
  });

  it('honors a custom 2-state cycle', async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              sortable
              sortDirection="asc"
              onSortChange={onSortChange}
              cycle={['asc', 'desc']}
            >
              이름
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    await user.click(screen.getByRole('button'));
    // asc → next in [asc, desc] = desc (no null)
    expect(onSortChange).toHaveBeenCalledWith('desc');
  });
});

describe('TableRow — clickable a11y', () => {
  it('clickable + onClick: tabIndex=0 + Enter/Space fire onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow clickable onClick={onClick} data-testid="row">
            <TableCell>홍길동</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const row = screen.getByTestId('row');
    expect(row).toHaveAttribute('tabindex', '0');

    row.focus();
    expect(document.activeElement).toBe(row);
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('clickable WITHOUT onClick: no tabIndex (purely visual)', () => {
    render(
      <Table>
        <TableBody>
          <TableRow clickable data-testid="row">
            <TableCell>cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId('row')).not.toHaveAttribute('tabindex');
  });

  it('clicking a descendant button does NOT fire row.onClick (descendant owns the click)', async () => {
    // The whole point of having an action button inside a clickable row
    // is that the button does its own thing — opening the row drawer
    // simultaneously is a UX bug. The previous implementation let the
    // click bubble straight through to row.onClick.
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onBtnClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow clickable onClick={onRowClick} data-testid="row">
            <TableCell>
              <button type="button" onClick={onBtnClick}>액션</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await user.click(screen.getByRole('button', { name: '액션' }));
    expect(onBtnClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('clicking a checkbox inside the row does NOT fire row.onClick', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onCheck = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow clickable onClick={onRowClick}>
            <TableCell>
              <input type="checkbox" aria-label="선택" onChange={onCheck} />
            </TableCell>
            <TableCell>홍길동</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await user.click(screen.getByRole('checkbox', { name: '선택' }));
    expect(onCheck).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('clicking a TableCell area (no descendant interactive) DOES fire row.onClick', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow clickable onClick={onRowClick}>
            <TableCell data-testid="cell">홍길동</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    await user.click(screen.getByTestId('cell'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('TableCell nowrap prop applies whitespace-nowrap', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell nowrap data-testid="c">2026-12-31</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId('c')).toHaveClass('whitespace-nowrap');
  });

  it('TableHead nowrap prop applies whitespace-nowrap (API symmetry with TableCell)', () => {
    // v0.8 closes the rc.0 gap: TableCell got `nowrap` in v0.7.7 but
    // TableHead didn't, so single-line "날짜 / 금액 / ID" header columns
    // still wrapped on narrow viewports. Mirroring the prop keeps the
    // <th> + <td> pair in lockstep.
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead nowrap data-testid="h">2026-12-31</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByTestId('h')).toHaveClass('whitespace-nowrap');
  });

  it('TableHead nowrap stacks with sortable mode', () => {
    // The class lands on the <th> wrapper, not the inner button — so
    // the chevron + label stay together as a single nowrap unit during
    // horizontal scroll.
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead nowrap sortable data-testid="h">이름</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByTestId('h')).toHaveClass('whitespace-nowrap');
  });

  it('keyboard activation: focus on the row, Enter fires onClick exactly once', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow clickable onClick={onRowClick} data-testid="row">
            <TableCell>홍길동</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    screen.getByTestId('row').focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});
