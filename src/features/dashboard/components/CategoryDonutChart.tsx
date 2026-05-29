import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../../../shared/components';
import { formatMoney } from '../../../shared/lib/formatMoney';
import type { CurrencyCode } from '../../settings/settingsSlice';
import type { CategorySlice } from '../lib/dashboardCompute';
import { TOOLTIP_STYLE } from '../lib/chartTheme';

type Props = {
  data: CategorySlice[];
  currencyCode: CurrencyCode;
};

function CustomTooltip({ active, payload, currencyCode }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  currencyCode: CurrencyCode;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={TOOLTIP_STYLE} className="px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: p.payload.color }}
        />
        <span className="text-xs text-zinc-300">{p.name}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-zinc-100">
        {formatMoney(p.value, currencyCode)}
      </p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-zinc-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function CategoryDonutChart({ data, currencyCode }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <Card>
        <h2 className="text-sm font-semibold text-zinc-100">Categories</h2>
        <p className="mt-3 text-sm text-zinc-400">No expenses this month.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-zinc-100">Categories</h2>
      <p className="mt-1 text-xs text-zinc-500">This month's breakdown</p>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius="55%"
              outerRadius="80%"
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip currencyCode={currencyCode} />}
            />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs text-zinc-500">Total: </span>
        <span className="text-sm font-semibold text-zinc-200">
          {formatMoney(total, currencyCode)}
        </span>
      </div>
    </Card>
  );
}
