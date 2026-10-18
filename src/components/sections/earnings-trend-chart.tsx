/**
 * Earnings Trend Chart
 * Line chart of daily earnings over a date range, for the creator analytics dashboard.
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { EarningsTrendPoint } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  AXIS_TICK_STYLE,
  GRID_STROKE,
  PRIMARY_SERIES_COLOR,
  TOOLTIP_CONTENT_STYLE,
} from '@/utils/chart-config';

export interface EarningsTrendChartProps {
  data: EarningsTrendPoint[];
}

export function EarningsTrendChart({ data }: EarningsTrendChartProps): JSX.Element {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No earnings data for this period
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-80" data-testid="earnings-trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDate(value)}
            tick={AXIS_TICK_STYLE}
            axisLine={{ stroke: GRID_STROKE }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(value: number) => formatCurrency(value)}
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(value: unknown) => [formatCurrency(Number(value)), 'Earnings']}
            labelFormatter={(label: unknown) => (label ? formatDate(String(label)) : '')}
            contentStyle={TOOLTIP_CONTENT_STYLE}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={PRIMARY_SERIES_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
