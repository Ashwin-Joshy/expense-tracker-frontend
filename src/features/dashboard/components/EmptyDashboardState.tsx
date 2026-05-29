import { Link } from 'react-router-dom';
import { Card } from '../../../shared/components';

export default function EmptyDashboardState() {
  return (
    <Card className="col-span-full">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
          <svg
            className="h-8 w-8 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">
          No transactions yet
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          Add your first expense or income to see your dashboard come alive.
        </p>
        <Link
          to="/add-expense"
          className="mt-4 inline-flex items-center rounded-md border border-emerald-500/25 bg-emerald-500/12 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200"
        >
          Add your first transaction
        </Link>
      </div>
    </Card>
  );
}
