import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { bootstrapApp } from "../../app/bootstrap";
import Navbar from "./Navbar";

const RootLayout = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;
    dispatch(bootstrapApp());
  }, [dispatch, token]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
