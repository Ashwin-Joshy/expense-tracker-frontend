import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loadAllTransactions } from '../../transactions/transactionsSlice';
import { Card } from '../../../shared/components';
import ChatButton from '../../aiChat/components/ChatButton';
import StatCards from '../components/StatCards';
import EmptyDashboardState from '../components/EmptyDashboardState';
import ExpenseTrendChart from '../components/ExpenseTrendChart';
import CategoryDonutChart from '../components/CategoryDonutChart';
import IncomeVsExpenseChart from '../components/IncomeVsExpenseChart';
import TopCategories from '../components/TopCategories';
import DayOfWeekChart from '../components/DayOfWeekChart';
import {
  computeStats,
  computeExpenseTrend,
  computeCategoryBreakdown,
  computeMonthlyComparison,
  computeTopCategories,
  computeDayOfWeekPattern,
} from '../lib/dashboardCompute';
import { formatMoney } from '../../../shared/lib/formatMoney';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { currencyCode, expenseCategories } = useAppSelector((s) => s.settings);
  const transactions = useAppSelector((s) => s.transactions.items);

  useEffect(() => {
    dispatch(loadAllTransactions());
  }, [dispatch]);

  const stats = useMemo(() => computeStats(transactions), [transactions]);
  const trend = useMemo(() => computeExpenseTrend(transactions, 30), [transactions]);
  const categories = useMemo(
    () => computeCategoryBreakdown(transactions, expenseCategories),
    [transactions, expenseCategories],
  );
  const monthly = useMemo(() => computeMonthlyComparison(transactions, 6), [transactions]);
  const topCats = useMemo(() => computeTopCategories(transactions, 5), [transactions]);
  const dayOfWeek = useMemo(() => computeDayOfWeekPattern(transactions), [transactions]);

  const recent = transactions.slice(0, 6);
  const isEmpty = transactions.length === 0;

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

      {isEmpty ? (
        <EmptyDashboardState />
      ) : (
        <>
          <StatCards
            stats={stats}
            currencyCode={currencyCode}
            transactionCount={transactions.length}
          />

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ExpenseTrendChart data={trend} currencyCode={currencyCode} />
            <CategoryDonutChart data={categories} currencyCode={currencyCode} />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <IncomeVsExpenseChart data={monthly} currencyCode={currencyCode} />
            <TopCategories data={topCats} currencyCode={currencyCode} />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DayOfWeekChart data={dayOfWeek} currencyCode={currencyCode} />

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
              {recent.length === 0 ? (
                <div className="mt-3 text-sm text-zinc-400">
                  No recent activity yet.
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {recent.slice(0, 4).map((row) => (
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
                          row.type === 'credit'
                            ? 'shrink-0 font-medium text-emerald-300'
                            : 'shrink-0 font-medium text-rose-300'
                        }
                      >
                        {row.type === 'credit'
                          ? `+${formatMoney(row.amount, currencyCode)}`
                          : `-${formatMoney(row.amount, currencyCode)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}

      <ChatButton />
    </div>
  );
}
