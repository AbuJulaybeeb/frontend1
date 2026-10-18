/**
 * Top Tippers Table
 * Lists a creator's top supporters sorted by total tip amount.
 *
 * Mobile-first: the `responsive-table` class (see `src/app/globals.css`) turns
 * each row into a stacked card below the `md` breakpoint and prints the column
 * name from every cell's `data-label`. No column is removed, so the total
 * tipped and the last tip date both stay visible on a 320px phone, and the
 * table never needs horizontal scrolling.
 */

import type { TopTipper } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

export interface TopTippersTableProps {
  data: TopTipper[];
  loading?: boolean;
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

function TopTippersSkeleton() {
  const rows = Array.from({ length: 5 });
  return (
    <div
      className="w-full overflow-x-auto rounded-lg border"
      data-testid="top-tippers-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <table className="responsive-table w-full text-sm">
        <caption className="sr-only">Loading top tippers&#x2010;&#x2010;</caption>
        <thead className="border-b bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Rank
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Tipper
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Total Tipped
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Tips
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Last Tip
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold">
              Latest Message
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, index) => (
            <tr key={index} className="border-b transition">
              <td data-label="Rank" className="px-4 py-3">
                <SkeletonBar className="h-4 w-8" />
              </td>
              <td data-label="Tipper" className="px-4 py-3">
                <SkeletonBar className="h-4 u-w-32" />
              </td>
              <td data-label="Total Tipped" className="px-4 py-3">
                <SkeletonBar className="h-4 w-20" />
              </td>
              <td data-label="Tips" className="px-4 py-3">
                <SkeletonBar className="h-4 w-10" />
              </td>
              <td data-label="Last Tip" className="px-4 py-3">
                <SkeletonBar className="h-4 w-24" />
              </td>
              <td data-label="Latest Message" className="px-4 py-3">
                <SkeletonBar className="h-4 u-w-48" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TopTipperTable({ data, loading }: TopTippersTableProps): JSX.Element {
  if (loading) {
    return <TopTippersSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No tippers for this period
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <div
      className="w-full max-h-96 overflow-x-auto overflow-y-auto rounded-lg border"
      data-testid="top-tippers-table"
    >
      <table className="responsive-table w-full text-sm">
        <caption className="sr-only">
          Top tippers for this period, ranked by total amount tipped, highest first.
        </caption>
        <thead className="border-b bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold sticky top-0 z-10 bg-muted">
              Rank
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold sticky top-0 z-10 bg-muted">
              Tipper
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold sticky top-0 z-10 bg-muted">
              Total Tipped
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold sticky top-0 z-10 bg-muted">
              Tips
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold sticky top-0 z-10 bg-muted">
              Last Tip
            </th>
            <th scope="col" className="px-4 py-3 text-left font-semibold sticky top-0 z-10 bg-muted">
              Latest Message
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((tipper, index) => (
            <tr key={tipper.id} className="border-b hover:bg-muted/30 transition">
              <td data-label="Rank" className="px-4 py-3 text-muted-foreground">
                #{index + 1}
              </td>
              <td data-label="Tipper" className="px-4 py-3 font-medium">
                {tipper.name}
              </td>
              <td data-label="Total Tipped" className="px-4 py-3 font-semibold">
                {formatCurrency(tipper.totalAmount)}
              </td>
              <td data-label="Tips" className="px-4 py-3">
                {tipper.tipCount}
              </td>
              <td data-label="Last Tip" className="px-4 py-3 text-muted-foreground">
                {formatDate(tipper.lastTipAt)}
              </td>
              <td
                data-label="Latest Message"
                className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate"
              >
                {tipper.latestMessage ? tipper.latestMessage : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}