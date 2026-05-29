import { Card } from '../../../shared/components';
import { formatMoney } from '../../../shared/lib/formatMoney';
import type { CurrencyCode } from '../../settings/settingsSlice';
import type { TopCategory } from '../lib/dashboardCompute';

type Props = {
  data: TopCategory[];
  currencyCode: CurrencyCode;
};

export default function TopCategories({ data, currencyCode }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <h2 className="text-sm font-semibold text-zinc-100">Top Categories</h2>
        <p className="mt-3 text-sm text-zinc-400">No expenses this month.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-zinc-100">Top Categories</h2>
      <p className="mt-1 text-xs text-zinc-500">This month's spending</p>
      <ul className="mt-4 space-y-3">
        {data.map((item) => (
          <li key={item.category}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-zinc-200">{item.category}</span>
              </div>
              <span className="font-medium text-zinc-300">
                {formatMoney(item.amount, currencyCode)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
