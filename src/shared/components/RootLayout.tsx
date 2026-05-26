import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { bootstrapApp } from "../../app/bootstrap";
import Navbar from "./Navbar";

const RootLayout = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const settingsHydrated = useAppSelector((s) => s.settings.hydrated);
  const transactionsHydrated = useAppSelector((s) => s.transactions.hydrated);
  const needsHydration = token && (!settingsHydrated || !transactionsHydrated);

  useEffect(() => {
    if (!needsHydration) return;
    dispatch(bootstrapApp());
  }, [dispatch, needsHydration]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {needsHydration ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-zinc-400">Loading your data…</div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default RootLayout;
