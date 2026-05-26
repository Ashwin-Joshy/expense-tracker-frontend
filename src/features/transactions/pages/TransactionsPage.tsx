import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { monthRangeISO } from "../../../shared/lib/dateISO";
import { formatMoney } from "../../../shared/lib/formatMoney";
import { removeTransaction } from "../transactionsSlice";
import { Card, SelectField, TextField } from "../../../shared/components";

type DateFilter = "all" | "currentMonth" | "previousMonth" | "custom";

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { currencyCode } = useAppSelector((s) => s.settings);
  const items = useAppSelector((s) => s.transactions.items);

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customFromISO, setCustomFromISO] = useState("");
  const [customToISO, setCustomToISO] = useState("");

  const activeRange = useMemo(() => {
    if (dateFilter === "all") return { fromISO: undefined, toISO: undefined };

    const now = new Date();
    if (dateFilter === "currentMonth") {
      return monthRangeISO(now);
    }

    if (dateFilter === "previousMonth") {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return monthRangeISO(prevMonth);
    }

    const fromISO = customFromISO.trim().length > 0 ? customFromISO : undefined;
    const toISO = customToISO.trim().length > 0 ? customToISO : undefined;
    return { fromISO, toISO };
  }, [customFromISO, customToISO, dateFilter]);

  const isCustomRangeInvalid =
    dateFilter === "custom" &&
    !!activeRange.fromISO &&
    !!activeRange.toISO &&
    activeRange.fromISO > activeRange.toISO;

  const filteredItems = useMemo(() => {
    if (items.length === 0) return items;
    if (dateFilter === "all") return items;
    if (isCustomRangeInvalid) return [];

    const { fromISO, toISO } = activeRange;
    return items.filter((t) => {
      if (fromISO && t.dateISO < fromISO) return false;
      if (toISO && t.dateISO > toISO) return false;
      return true;
    });
  }, [activeRange, dateFilter, isCustomRangeInvalid, items]);

  const totals = useMemo(() => {
    let totalCredit = 0;
    let totalDebt = 0;
    for (const t of filteredItems) {
      if (t.type === "credit") totalCredit += t.amount;
      else totalDebt += t.amount;
    }
    return { totalCredit, totalDebt };
  }, [filteredItems]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Your saved transactions (synced to the database).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/add-expense"
            className="inline-flex items-center rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200"
          >
            Add Expense
          </Link>
          <Link
            to="/add-credit"
            className="inline-flex items-center rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200"
          >
            Add Credit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SelectField
              label="Filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              options={[
                { value: "all", label: "All" },
                { value: "currentMonth", label: "Current Month" },
                { value: "previousMonth", label: "Previous Month" },
                { value: "custom", label: "Custom" },
              ]}
              className="max-w-sm"
            />

            {dateFilter === "custom" ? (
              <div className="flex flex-wrap items-end gap-3">
                <TextField
                  label="From"
                  type="date"
                  value={customFromISO}
                  onChange={(e) => setCustomFromISO(e.target.value)}
                />
                <TextField
                  label="To"
                  type="date"
                  value={customToISO}
                  onChange={(e) => setCustomToISO(e.target.value)}
                />
              </div>
            ) : null}
          </div>

          {isCustomRangeInvalid ? (
            <div className="mt-2 text-xs text-rose-300">
              "From" date must be on or before "To" date.
            </div>
          ) : null}
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-5">
          <Card>
            <div className="text-xs font-medium text-zinc-400">
              Total Credit
            </div>
            <div className="mt-1 text-lg font-semibold text-emerald-200">
              {formatMoney(totals.totalCredit, currencyCode)}
            </div>
          </Card>
          <Card>
            <div className="text-xs font-medium text-zinc-400">Total Debt</div>
            <div className="mt-1 text-lg font-semibold text-rose-200">
              {formatMoney(totals.totalDebt, currencyCode)}
            </div>
          </Card>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="text-sm font-semibold text-zinc-100">No transactions</div>
          <div className="mt-2 text-sm text-zinc-400">
            Add your first expense to see it here.
          </div>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <div className="text-sm font-semibold text-zinc-100">
            No transactions for this filter
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            Try selecting a different date range.
          </div>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-emerald-900/30 bg-zinc-950/40">
          <div className="grid grid-cols-12 gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-3 text-xs font-medium text-zinc-400">
            <div className="col-span-3">Date</div>
            <div className="col-span-4">Title</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <ul className="divide-y divide-white/5">
            {filteredItems.map((t) => (
              <li key={t.id} className="px-4 py-3">
                <div className="grid grid-cols-12 items-start gap-3">
                  <div className="col-span-3 text-sm text-zinc-300">{t.dateISO}</div>
                  <div className="col-span-4">
                    <div className="text-sm font-medium text-zinc-100">
                      {t.title}
                    </div>
                    {t.note ? (
                      <div className="mt-1 text-xs text-zinc-500">{t.note}</div>
                    ) : null}
                  </div>
                  <div className="col-span-3 text-sm text-zinc-300">{t.category}</div>
                  <div className="col-span-2 text-right">
                    {t.type === "credit" ? (
                      <div className="text-sm font-semibold text-emerald-300">
                        +{formatMoney(t.amount, currencyCode)}
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-rose-300">
                        -{formatMoney(t.amount, currencyCode)}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => dispatch(removeTransaction(t.id))}
                      className="mt-1 text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
