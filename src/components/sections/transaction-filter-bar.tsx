/**
 * Transaction Filter Bar
 * Date range, amount range, status, and sort controls for transaction history,
 * plus CSV, Excel, and PDF export of the currently filtered rows.
 *
 * Mobile-first: the date/amount grid collapses to a single column below `sm`
 * and the keyword/select/reset row becomes a two-column grid, so no control is
 * squeezed or pushed off a 320px screen. From `sm` upwards the layout is the
 * original single wrapping row, and interactive controls fall back to their
 * compact size once there is room for them next to each other.
 */

'use client';

import { Download } from 'lucide-react';
import type { TransactionFilterState } from '@/hooks/use-transaction-filter';

export interface TransactionFilterBarProps {
  filters: TransactionFilterState;
  onChange: <K extends keyof TransactionFilterState>(
    key: K,
    value: TransactionFilterState[K]
  ) => void;
  onReset: () => void;
  onExport: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  resultCount: number;
  /** When true, renders a skeleton placeholder instead of the filter controls. */
  loading?: boolean;
}

export function TransactionFilterBar({
  filters,
  onChange,
  onReset,
  onExport,
  onExportExcel,
  onExportPdf,
  resultCount,
  loading = false,
}: TransactionFilterBarProps): JSX.Element {
  if (loading) {
    return (
      <div
        className="border rounded-lg p-4 space-y-3 animate-pulse"
        data-testid="transaction-filter-bar-skeleton"
        aria-busy="true"
        aria-label="Loading transaction filters"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="min-w-0">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="mt-1 h-8 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
          <div className="col-span-2 w-full min-w-0 sm:col-span-1 sm:w-auto sm:flex-1 sm:min-w-52">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="mt-1 h-8 w-full rounded bg-muted" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="min-w-0">
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="mt-1 h-8 w-full rounded bg-muted" />
            </div>
          ))}
          <div className="col-span-2 ml-auto flex flex-wrap items-center gap-2 sm:col-span-1">
            <div className="h-11 w-24 rounded bg-muted" />
            <div className="h-11 w-16 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const exportDisabled = resultCount === 0;

  return (
    <div className="border rounded-lg p-4 space-y-3" data-testid="transaction-filter-bar">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="min-w-0">
          <label htmlFor="filter-date-from" className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange('dateFrom', e.target.value)}
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="filter-date-to" className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange('dateTo', e.target.value)}
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="filter-min-amount" className="text-xs font-medium text-muted-foreground">
            Min amount
          </label>
          <input
            id="filter-min-amount"
            type="number"
            min="0"
            step="0.01"
            value={filters.minAmount}
            onChange={(e) => onChange('minAmount', e.target.value)}
            placeholder="0"
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="filter-max-amount" className="text-xs font-medium text-muted-foreground">
            Max amount
          </label>
          <input
            id="filter-max-amount"
            type="number"
            min="0"
            step="0.01"
            value={filters.maxAmount}
            onChange={(e) => onChange('maxAmount', e.target.value)}
            placeholder="Any"
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          />
        </div>
      </div>

      {/* Two columns on a phone so the selects pair up instead of each claiming
          a full-width row; a single wrapping row from `sm` upwards. `min-w-0`
          keeps the grid and flex children able to shrink below their content
          width, which is what prevents a long value from widening the bar. */}
      <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        <div className="col-span-2 w-full min-w-0 sm:col-span-1 sm:w-auto sm:flex-1 sm:min-w-52">
          <label
            htmlFor="filter-message-keyword"
            className="text-xs font-medium text-muted-foreground"
          >
            Message search
          </label>
          <input
            id="filter-message-keyword"
            type="search"
            value={filters.messageKeyword}
            onChange={(e) => onChange('messageKeyword', e.target.value)}
            placeholder="Search message or tipper"
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="filter-status" className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => onChange('status', e.target.value as TransactionFilterState['status'])}
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="min-w-0">
          <label htmlFor="filter-sort-field" className="text-xs font-medium text-muted-foreground">
            Sort by
          </label>
          <select
            id="filter-sort-field"
            value={filters.sortField}
            onChange={(e) =>
              onChange('sortField', e.target.value as TransactionFilterState['sortField'])
            }
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>

        {/* The "Newest / Highest first" option needs the full width on a phone,
            so it gets its own row instead of being clipped next to a sibling. */}
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <label
            htmlFor="filter-sort-direction"
            className="text-xs font-medium text-muted-foreground"
          >
            Order
          </label>
          <select
            id="filter-sort-direction"
            value={filters.sortDirection}
            onChange={(e) =>
              onChange(
                'sortDirection',
                e.target.value as TransactionFilterState['sortDirection']
              )
            }
            className="block w-full mt-1 px-2 py-1.5 border rounded text-sm"
          >
            <option value="desc">Newest / Highest first</option>
            <option value="asc">Oldest / Lowest first</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="col-span-2 min-h-[44px] w-full px-3 py-1.5 text-sm border rounded hover:bg-muted transition sm:col-span-1 sm:min-h-0 sm:w-auto"
        >
          Reset
        </button>

        {/* Full-width row on a phone, pushed to the far right from `sm` upwards
            where it sits next to the other controls again. */}
        <div className="col-span-2 ml-auto flex flex-wrap items-center gap-2 sm:col-span-1">
          <button
            type="button"
            onClick={onExport}
            disabled={exportDisabled}
            aria-label={`Export CSV (${resultCount})`}
            className="flex min-h-[44px] items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed sm:min-h-0"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            CSV ({resultCount})
          </button>
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              disabled={exportDisabled}
              className="min-h-[44px] px-3 py-1.5 text-sm border rounded hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed sm:min-h-0"
            >
              Excel
            </button>
          )}
          {onExportPdf && (
            <button
              type="button"
              onClick={onExportPdf}
              disabled={exportDisabled}
              className="min-h-[44px] px-3 py-1.5 text-sm border rounded hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed sm:min-h-0"
            >
              PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}