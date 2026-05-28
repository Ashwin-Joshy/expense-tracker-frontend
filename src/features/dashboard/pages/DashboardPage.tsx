import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadAllTransactions } from "../../transactions/transactionsSlice";
import { formatMoney } from "../../../shared/lib/formatMoney";
import { parseDateISO } from "../../../shared/lib/dateISO";
import { Card } from "../../../shared/components";
import ChatButton from "../../aiChat/components/ChatButton";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { currencyCode } = useAppSelector((s) => s.settings);
  const transactions = useAppSelector((s) => s.transactions.items);

  useEffect(() => {
    dispatch(loadAllTransactions());
  }, [dispatch]);

  const computed = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLast7 = new Date(startOfToday);
    startOfLast7.setDate(startOfLast7.getDate() - 6);

    let monthNet = 0;
    let last7Net = 0;

    const recent = transactions.slice(0, 6);

    for (const t of transactions) {
      const dt = parseDateISO(t.dateISO);
      if (!dt) continue;

      const signed = t.type === "credit" ? t.amount : -t.amount;
      if (dt >= startOfMonth && dt <= startOfToday) monthNet += signed;
      if (dt >= startOfLast7 && dt <= startOfToday) last7Net += signed;
    }

    const avgPerDay = last7Net / 7;

    return {
      stats: [
        { label: "This Month", value: monthNet },
        { label: "Last 7 Days", value: last7Net },
        { label: "Avg / Day", value: avgPerDay },
      ],
      recent,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Overview based on your transactions.
          </p>
        </div>

        <Link
          to="/add-expense"
          className="inline-flex items-center rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200"
        >
          Add an expense
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {computed.stats.map((s) => (
          <Card key={s.label} className="shadow-[0_0_0_1px_rgba(16,185,129,0.05)]">
            <div className="text-xs font-medium text-zinc-400">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold text-zinc-50">
              {formatMoney(s.value, currencyCode)}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              {transactions.length === 0
                ? "Add transactions to populate."
                : `${transactions.length} total transaction(s).`}
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-100">
              Recent Activity
            </h2>
            <Link
              to="/transactions"
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              View all
            </Link>
          </div>

          {computed.recent.length === 0 ? (
            <div className="mt-3 text-sm text-zinc-400">
              No recent activity yet.
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {computed.recent.slice(0, 4).map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-zinc-200">{row.title}</div>
                    <div className="text-xs text-zinc-500">
                      {row.dateISO} • {row.category}
                    </div>
                  </div>
                  <span
                    className={
                      row.type === "credit"
                        ? "shrink-0 font-medium text-emerald-300"
                        : "shrink-0 font-medium text-rose-300"
                    }
                  >
                    {row.type === "credit"
                      ? `+${formatMoney(row.amount, currencyCode)}`
                      : `-${formatMoney(row.amount, currencyCode)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-100">Tips</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Update your categories and currency from Settings.
          </p>
          <div className="mt-4 rounded-lg border border-emerald-500/10 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 text-sm text-zinc-200">
            Your data is stored in the database and syncs across reloads.
          </div>
        </Card>
      </section>
      <ChatButton />
    </div>
  );
}
