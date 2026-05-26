import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  addCategory,
  deleteCategory,
} from "../settingsSlice";

function CategoryList(props: {
  title: string;
  hint: string;
  categories: string[];
  onAdd: (value: string) => void;
  onDelete: (value: string) => void;
}) {
  const [next, setNext] = useState("");
  const canAdd = useMemo(() => next.trim().length > 0, [next]);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold text-zinc-100">{props.title}</div>
        <div className="mt-1 text-sm text-zinc-400">{props.hint}</div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="w-full max-w-sm rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          placeholder="New category"
        />
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => {
            props.onAdd(next);
            setNext("");
          }}
          className="rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-emerald-900/30 bg-zinc-950/40">
        <div className="border-b border-white/5 bg-white/[0.02] px-4 py-3 text-xs font-medium text-zinc-400">
          Categories ({props.categories.length})
        </div>
        <ul className="divide-y divide-white/5">
          {props.categories.map((c) => (
            <li
              key={c}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="text-sm text-zinc-200">{c}</div>
              <button
                type="button"
                onClick={() => props.onDelete(c)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function CategoriesSettings() {
  const dispatch = useAppDispatch();
  const { expenseCategories, creditCategories } = useAppSelector((s) => s.settings);

  return (
    <div className="space-y-6">
      <CategoryList
        title="Expense categories"
        hint="Used in Add Expense."
        categories={expenseCategories}
        onAdd={(name) => dispatch(addCategory({ kind: "expense", name }))}
        onDelete={(name) => dispatch(deleteCategory({ kind: "expense", name }))}
      />

      <CategoryList
        title="Credit categories"
        hint="Used in Add Credit."
        categories={creditCategories}
        onAdd={(name) => dispatch(addCategory({ kind: "credit", name }))}
        onDelete={(name) => dispatch(deleteCategory({ kind: "credit", name }))}
      />
    </div>
  );
}
