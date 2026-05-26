import { useAppSelector } from "../../../app/hooks";
import { TransactionForm } from "../../../shared/components";

export default function AddCreditPage() {
  const { creditCategories } = useAppSelector((s) => s.settings);

  return (
    <TransactionForm
      type="credit"
      categories={creditCategories}
      title="Add Credit"
      buttonLabel="Save Credit"
      exampleAmount={1000}
      placeholder="e.g., Salary, Refund..."
    />
  );
}
