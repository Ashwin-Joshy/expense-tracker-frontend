import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from '../../../shared/components';
import { formatMoney } from '../../../shared/lib/formatMoney';
import type { CurrencyCode } from '../../settings/settingsSlice';
import type { MonthComparison } from '../lib/dashboardCompute';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_PROPS } from '../lib/chartTheme';

type Props = {
  data: MonthComparison[];
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
          <span className="text-zinc-400">
            {p.dataKey === 'income' ? 'Income' : 'Expense'}: </span>
          <span className="font-medium text-zinc-100">
            {formatMoney(p.value, currencyCode)}
          </span>
        </p>
      ))}
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="mt-3 flex justify-center gap-5">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: CHART_COLORS.emerald }} />
        <span className="text-xs text-zinc-400">Income</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: CHART_COLORS.rose }} />
        <span className="text-xs text-zinc-400">Expense</span>
      </div>
    </div>
  );
}

export default function IncomeVsExpenseChart({ data, currencyCode }: Props) {
  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  return (
    <Card>
      <h2 className="text-sm font-semibold text-zinc-100">Income vs Expense</h2>
      <p className="mt-1 text-xs text-zinc-500">Last 6 months</p>
      <div className="mt-4 h-56">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No transactions in the last 6 months.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="month" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} width={45} />
              <Tooltip
                content={<CustomTooltip currencyCode={currencyCode} />}
              />
              <Legend content={<CustomLegend />} />
              <Bar
                dataKey="income"
                fill={CHART_COLORS.emerald}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="expense"
                fill={CHART_COLORS.rose}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
