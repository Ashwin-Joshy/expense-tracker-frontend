import { Card } from '../../../shared/components';
import { formatMoney } from '../../../shared/lib/formatMoney';
import type { CurrencyCode } from '../../settings/settingsSlice';
import type { StatsResult } from '../lib/dashboardCompute';

type Props = {
  stats: StatsResult;
  currencyCode: CurrencyCode;
  transactionCount: number;
};

type StatItem = {
  label: string;
  value: number;
  change: number | null;
};

function TrendBadge({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-xs text-zinc-500">&mdash;</span>;
  }

  const isPositive = change > 0;
  const color = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const arrow = isPositive ? '↑' : '↓';

  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export default function StatCards({ stats, currencyCode, transactionCount }: Props) {
  const items: StatItem[] = [
    { label: 'This Month', value: stats.monthNet, change: stats.monthChange },
    { label: 'Last 7 Days', value: stats.last7Net, change: stats.weekChange },
    { label: 'Avg / Day', value: stats.avgPerDay, change: null },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((s) => (
        <Card key={s.label} className="shadow-[0_0_0_1px_rgba(16,185,129,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">{s.label}</span>
            <TrendBadge change={s.change} />
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-50">
            {formatMoney(s.value, currencyCode)}
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {transactionCount === 0
              ? 'Add transactions to populate.'
              : `${transactionCount} total transaction(s).`}
          </div>
        </Card>
      ))}
    </section>
  );
}
