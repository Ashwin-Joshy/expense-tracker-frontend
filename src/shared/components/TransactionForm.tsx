import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createTransaction } from "../../features/transactions/transactionsSlice";
import { formatMoney } from "../../shared/lib/formatMoney";
import { todayISO } from "../../shared/lib/dateISO";
import { TextField, SelectField, Button } from "../../shared/components";

type Props = {
  type: "expense" | "credit";
  categories: string[];
  title: string;
  buttonLabel: string;
  exampleAmount: number;
  placeholder: string;
};

type FormState = {
  title: string;
  amount: string;
  category: string;
  dateISO: string;
  note: string;
};

export default function TransactionForm({
  type,
  categories,
  title,
  buttonLabel,
  exampleAmount,
  placeholder,
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currencyCode } = useAppSelector((s) => s.settings);

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
        type,
        title: form.title.trim(),
        amount: Math.round(parsedAmount * 100) / 100,
        category: form.category,
        dateISO: form.dateISO,
        note: form.note.trim().length > 0 ? form.note.trim() : undefined,
      }),
    ).unwrap();

    navigate("/transactions");
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            All fields are required except Note.
          </p>
        </div>
        <div className="text-sm text-zinc-400">
          Example: {formatMoney(exampleAmount, currencyCode)}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-emerald-900/30 bg-zinc-950/40 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.05)]"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder={placeholder}
              error={submitted ? errors.title : undefined}
            />
          </div>

          <TextField
            label="Amount"
            value={form.amount}
            onChange={(e) => setField("amount", e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            error={submitted ? errors.amount : undefined}
          />

          <SelectField
            label="Category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            options={categories}
            placeholder="Select..."
            error={submitted ? errors.category : undefined}
          />

          <TextField
            label="Date"
            type="date"
            value={form.dateISO}
            onChange={(e) => setField("dateISO", e.target.value)}
            error={submitted ? errors.dateISO : undefined}
          />

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-medium text-zinc-400">
              Note (optional)
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              placeholder="Any extra details..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button type="submit" disabled={!canSubmit}>
            {buttonLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
