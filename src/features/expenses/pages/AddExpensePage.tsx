import { useAppSelector } from "../../../app/hooks";
import { TransactionForm } from "../../../shared/components";

export default function AddExpensePage() {
  const { expenseCategories } = useAppSelector((s) => s.settings);

  return (
    <TransactionForm
      type="expense"
      categories={expenseCategories}
      title="Add Expense"
      buttonLabel="Save Expense"
      exampleAmount={12.5}
      placeholder="e.g., Coffee, Groceries..."
    />
  );
}
