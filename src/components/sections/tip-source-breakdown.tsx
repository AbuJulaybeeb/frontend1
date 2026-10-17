/**
 * Tip Source Breakdown
 * Pie chart of tip earnings by source/category, for the creator analytics dashboard.
 */

'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TipSourceBreakdownEntry } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { CHART_COLORS, LEGEND_WRAPPER_STYLE, TOOLTIP_CONTENT_STYLE } from '@/utils/chart-config';

export interface TipSourceBreakdownProps {
  data: TipSourceBreakdownEntry[];
}

export function TipSourceBreakdown({ data }: TipSourceBreakdownProps): JSX.Element {
  const total = data.reduce((sum, entry) => sum + entry.amount, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No tips for this period
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-80" data-testid="tip-source-breakdown-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="source"
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="75%"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.source} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              formatCurrency(Number(value)),
              String(name),
            ]}
            contentStyle={TOOLTIP_CONTENT_STYLE}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={LEGEND_WRAPPER_STYLE}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
