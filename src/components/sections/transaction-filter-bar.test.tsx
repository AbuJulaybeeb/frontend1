import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFilterBar } from './transaction-filter-bar';
import type { TransactionFilterState } from '@/hooks/use-transaction-filter';

const baseFilters: TransactionFilterState = {
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
  messageKeyword: '',
  status: 'all',
  sortField: 'date',
  sortDirection: 'desc',
};

describe('TransactionFilterBar', () => {
  it('renders all filter controls', () => {
    render(
      <TransactionFilterBar
        filters={baseFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        onExport={vi.fn()}
        resultCount={0}
      />
    );

    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByLabelText('Min amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Max amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Message search')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    expect(screen.getByLabelText('Order')).toBeInTheDocument();
  });

  it('calls onChange with the field key and new value when a filter changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TransactionFilterBar
        filters={baseFilters}
        onChange={onChange}
        onReset={vi.fn()}
        onExport={vi.fn()}
        resultCount={0}
      />
    );

    await user.selectOptions(screen.getByLabelText('Status'), 'confirmed');
    expect(onChange).toHaveBeenCalledWith('status', 'confirmed');
  });

  it('calls onReset when the Reset button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <TransactionFilterBar
        filters={baseFilters}
        onChange={vi.fn()}
        onReset={onReset}
        onExport={vi.fn()}
        resultCount={0}
      />
    );

    await user.click(screen.getByText('Reset'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('shows the result count on the export button and disables it when there are no results', () => {
    render(
      <TransactionFilterBar
        filters={baseFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        onExport={vi.fn()}
        resultCount={0}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export csv \(0\)/i });
    expect((exportButton.closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables the export button and calls onExport when there are results', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(
      <TransactionFilterBar
        filters={baseFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        onExport={onExport}
        resultCount={5}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export csv \(5\)/i });
    expect((exportButton as HTMLButtonElement).disabled).toBe(false);

    await user.click(exportButton as HTMLButtonElement);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('renders optional Excel and PDF export actions', async () => {
    const user = userEvent.setup();
    const onExportExcel = vi.fn();
    const onExportPdf = vi.fn();

    render(
      <TransactionFilterBar
        filters={baseFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        onExport={vi.fn()}
        onExportExcel={onExportExcel}
        onExportPdf={onExportPdf}
        resultCount={2}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Excel' }));
    await user.click(screen.getByRole('button', { name: 'PDF' }));

    expect(onExportExcel).toHaveBeenCalledTimes(1);
    expect(onExportPdf).toHaveBeenCalledTimes(1);
  });

  // The reflow is verified in a real browser (e2e/mobile-responsive.spec.ts);
  // these assertions pin the responsive classes it depends on (#168).
  describe('responsive layout (#168)', () => {
    it('collapses the date and amount range to one column on narrow screens', () => {
      render(
        <TransactionFilterBar
          filters={baseFilters}
          onChange={vi.fn()}
          onReset={vi.fn()}
          onExport={vi.fn()}
          resultCount={0}
        />
      );

      const bar = screen.getByTestId('transaction-filter-bar');
      const rangeGrid = bar.firstElementChild as HTMLElement;

      expect(rangeGrid).toHaveClass('grid-cols-1');
      expect(rangeGrid).toHaveClass('sm:grid-cols-2');
      expect(rangeGrid).toHaveClass('md:grid-cols-4');
    });

    it('lets every grid and flex child shrink so a long value cannot widen the bar', () => {
      render(
        <TransactionFilterBar
          filters={baseFilters}
          onChange={vi.fn()}
          onReset={vi.fn()}
          onExport={vi.fn()}
          resultCount={0}
        />
      );

      const bar = screen.getByTestId('transaction-filter-bar');
      const controlsRow = bar.children[1] as HTMLElement;

      expect(controlsRow.className).toContain('grid-cols-2');
      expect(controlsRow.className).toContain('sm:flex');
      expect(controlsRow.querySelectorAll('.min-w-0').length).toBeGreaterThan(0);
    });

    it('keeps the keyword search full width on a phone and flexible from sm upwards', () => {
      render(
        <TransactionFilterBar
          filters={baseFilters}
          onChange={vi.fn()}
          onReset={vi.fn()}
          onExport={vi.fn()}
          resultCount={0}
        />
      );

      const keywordField = screen.getByLabelText('Message search').parentElement as HTMLElement;

      expect(keywordField).toHaveClass('col-span-2');
      expect(keywordField).toHaveClass('w-full');
      expect(keywordField).toHaveClass('sm:flex-1');
    });

    it('gives every action a 44px touch target that relaxes once there is room', () => {
      render(
        <TransactionFilterBar
          filters={baseFilters}
          onChange={vi.fn()}
          onReset={vi.fn()}
          onExport={vi.fn()}
          onExportExcel={vi.fn()}
          onExportPdf={vi.fn()}
          resultCount={3}
        />
      );

      for (const name of [
        'Reset',
        'Export CSV (3)',
        'Excel',
        'PDF',
      ]) {
        const control = screen.getByRole('button', { name });
        expect(control.className).toContain('min-h-[44px]');
        expect(control.className).toContain('sm:min-h-0');
      }
    });
  });
});
