import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { formatMoney } from "../../../shared/lib/formatMoney";
import { createTransaction } from "../../transactions/transactionsSlice";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type FormState = {
  title: string;
  amount: string;
  category: string;
  dateISO: string;
  note: string;
};

export default function AddExpensePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { expenseCategories, currencyCode } = useAppSelector((s) => s.settings);

  const [form, setForm] = useState<FormState>({
    title: "",
    amount: "",
    category: "",
    dateISO: todayISO(),
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const parsedAmount = useMemo(() => {
    const num = Number(form.amount);
    if (!Number.isFinite(num)) return null;
    return num;
  }, [form.amount]);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (form.title.trim().length === 0) next.title = "Title is required.";
    if (form.category.trim().length === 0)
      next.category = "Category is required.";
    if (form.dateISO.trim().length === 0) next.dateISO = "Date is required.";

    if (form.amount.trim().length === 0) next.amount = "Amount is required.";
    else if (parsedAmount === null || parsedAmount <= 0) {
      next.amount = "Amount must be greater than 0.";
    }

    return next;
  }, [form, parsedAmount]);

  const canSubmit = Object.keys(errors).length === 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit || parsedAmount === null) return;

    await dispatch(
      createTransaction({
        type: "expense",
        title: form.title.trim(),
        amount: Math.round(parsedAmount * 100) / 100,
        category: form.category,
        dateISO: form.dateISO,
        note: form.note.trim().length > 0 ? form.note.trim() : undefined,
      }),
    ).unwrap();

    navigate("/transactions");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Add Expense
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            All fields are required except Note.
          </p>
        </div>
        <div className="text-sm text-zinc-400">
          Example: {formatMoney(12.5, currencyCode)}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-emerald-900/30 bg-zinc-950/40 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.05)]"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <div className="text-xs font-medium text-zinc-400">Title</div>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              placeholder="e.g., Coffee, Groceries..."
            />
            {submitted && errors.title ? (
              <div className="text-xs text-rose-300">{errors.title}</div>
            ) : null}
          </label>

          <label className="space-y-2">
            <div className="text-xs font-medium text-zinc-400">Amount</div>
            <input
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              inputMode="decimal"
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              placeholder="0.00"
            />
            {submitted && errors.amount ? (
              <div className="text-xs text-rose-300">{errors.amount}</div>
            ) : null}
          </label>

          <label className="space-y-2">
            <div className="text-xs font-medium text-zinc-400">Category</div>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <option
                value=""
                disabled
                hidden
                className="bg-zinc-900 text-zinc-400"
              >
                Select...
              </option>
              {expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {submitted && errors.category ? (
              <div className="text-xs text-rose-300">{errors.category}</div>
            ) : null}
          </label>

          <label className="space-y-2">
            <div className="text-xs font-medium text-zinc-400">Date</div>
            <input
              type="date"
              value={form.dateISO}
              onChange={(e) =>
                setForm((f) => ({ ...f, dateISO: e.target.value }))
              }
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
            {submitted && errors.dateISO ? (
              <div className="text-xs text-rose-300">{errors.dateISO}</div>
            ) : null}
          </label>

          <label className="space-y-2 sm:col-span-2">
            <div className="text-xs font-medium text-zinc-400">
              Note (optional)
            </div>
            <textarea
              value={form.note}
              onChange={(e) =>
                setForm((f) => ({ ...f, note: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              placeholder="Any extra details..."
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="submit"
            className="rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canSubmit}
          >
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}
