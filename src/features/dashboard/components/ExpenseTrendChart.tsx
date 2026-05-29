import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '../../../shared/components';
import { formatMoney } from '../../../shared/lib/formatMoney';
import type { CurrencyCode } from '../../settings/settingsSlice';
import type { TrendPoint } from '../lib/dashboardCompute';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_PROPS } from '../lib/chartTheme';

type Props = {
  data: TrendPoint[];
  currencyCode: CurrencyCode;
};

function CustomTooltip({ active, payload, label, currencyCode }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  currencyCode: CurrencyCode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2">
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs">
          <span className="text-zinc-400">{p.dataKey === 'expense' ? 'Spent' : 'Income'}: </span>
          <span className="font-medium text-zinc-100">
            {formatMoney(p.value, currencyCode)}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function ExpenseTrendChart({ data, currencyCode }: Props) {
  const hasData = data.some(d => d.expense > 0 || d.income > 0);

  return (
    <Card>
      <h2 className="text-sm font-semibold text-zinc-100">Spending Trend</h2>
      <p className="mt-1 text-xs text-zinc-500">Last 30 days</p>
      <div className="mt-4 h-56">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No transactions in the last 30 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.rose} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.rose} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis
                dataKey="shortLabel"
                {...AXIS_PROPS}
                interval={4}
              />
              <YAxis {...AXIS_PROPS} width={45} />
              <Tooltip
                content={<CustomTooltip currencyCode={currencyCode} />}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke={CHART_COLORS.emerald}
                fill="url(#incomeGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke={CHART_COLORS.rose}
                fill="url(#expenseGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
