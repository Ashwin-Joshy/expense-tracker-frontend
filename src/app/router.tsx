import { createBrowserRouter } from "react-router-dom";
import NotFound from "../shared/components/NotFound";
import RootLayout from "../shared/components/RootLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import TransactionsPage from "../features/transactions/pages/TransactionsPage";
import AddExpensePage from "../features/expenses/pages/AddExpensePage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import AddCreditPage from "../features/credits/pages/AddCreditPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RequireAuth from "../features/auth/components/RequireAuth";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "add-expense", element: <AddExpensePage /> },
      { path: "add-credit", element: <AddCreditPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
