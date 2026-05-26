import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { bootstrapApp } from "../../../app/bootstrap";
import { login, register } from "../authSlice";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, status, errorMessage } = useAppSelector((s) => s.auth);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");

  const canSubmit = useMemo(() => {
    const e = normalizeEmail(email);
    return e.length > 0 && password.trim().length >= 6 && status !== "loading";
  }, [email, password, status]);

  useEffect(() => {
    if (!token) return;
    dispatch(bootstrapApp());
    navigate("/", { replace: true });
  }, [dispatch, navigate, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = { email: normalizeEmail(email), password: password.trim() };
    if (mode === "login") {
      await dispatch(login(payload));
      return;
    }

    await dispatch(
      register({
        ...payload,
        ...(userName.trim().length > 0 ? { userName: userName.trim() } : {}),
      }),
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <p className="text-sm text-zinc-400">
            {mode === "login" ? "Sign in to continue." : "Create your account."}
          </p>
        </header>

        <div className="rounded-2xl border border-emerald-900/30 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <div className="mb-5 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={
                mode === "login"
                  ? "flex-1 rounded-lg bg-emerald-500/18 px-3 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-500/30"
                  : "flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/8"
              }
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={
                mode === "register"
                  ? "flex-1 rounded-lg bg-emerald-500/18 px-3 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-500/30"
                  : "flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/8"
              }
            >
              Register
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" ? (
              <label className="block space-y-1.5">
                <div className="text-xs font-semibold text-zinc-300">Name (optional)</div>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="Alice"
                  autoComplete="name"
                />
              </label>
            ) : null}

            <label className="block space-y-1.5">
              <div className="text-xs font-semibold text-zinc-300">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-400/30"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
              />
            </label>

            <label className="block space-y-1.5">
              <div className="text-xs font-semibold text-zinc-300">Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-400/30"
                placeholder="At least 6 characters"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>

            {errorMessage ? (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className={
                canSubmit
                  ? "w-full rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-500/30 hover:bg-emerald-500/26"
                  : "w-full cursor-not-allowed rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-400 ring-1 ring-white/10"
              }
            >
              {status === "loading"
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-xs text-zinc-500">
          Tip: set <code className="rounded bg-white/5 px-1 py-0.5">VITE_API_URL</code>{" "}
          to your backend base URL.
        </p>
      </div>
    </div>
  );
}
