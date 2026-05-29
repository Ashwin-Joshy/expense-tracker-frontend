import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Card } from '../../../shared/components';
import { formatMoney } from '../../../shared/lib/formatMoney';
import type { CurrencyCode } from '../../settings/settingsSlice';
import type { DayOfWeekPoint } from '../lib/dashboardCompute';
import { CHART_COLORS, TOOLTIP_STYLE, AXIS_PROPS } from '../lib/chartTheme';

type Props = {
  data: DayOfWeekPoint[];
  currencyCode: CurrencyCode;
};

function CustomTooltip({ active, payload, label, currencyCode }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: DayOfWeekPoint }>;
  label?: string;
  currencyCode: CurrencyCode;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2">
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      <p className="text-xs">
        <span className="text-zinc-400">Total: </span>
        <span className="font-medium text-zinc-100">
          {formatMoney(p.total, currencyCode)}
        </span>
      </p>
      <p className="text-xs">
        <span className="text-zinc-400">Avg: </span>
        <span className="font-medium text-zinc-100">
          {formatMoney(p.avg, currencyCode)}
        </span>
      </p>
      <p className="text-xs text-zinc-500">{p.count} transaction(s)</p>
    </div>
  );
}

export default function DayOfWeekChart({ data, currencyCode }: Props) {
  const hasData = data.some(d => d.total > 0);
  const maxTotal = Math.max(...data.map(d => d.total));

  return (
    <Card>
      <h2 className="text-sm font-semibold text-zinc-100">Spending by Day</h2>
      <p className="mt-1 text-xs text-zinc-500">Last 30 days</p>
      <div className="mt-4 h-48">
        {!hasData ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No expenses in the last 30 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="day" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} width={45} />
              <Tooltip
                content={<CustomTooltip currencyCode={currencyCode} />}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.total === maxTotal && maxTotal > 0
                      ? CHART_COLORS.emerald
                      : CHART_COLORS.emerald + '80'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
