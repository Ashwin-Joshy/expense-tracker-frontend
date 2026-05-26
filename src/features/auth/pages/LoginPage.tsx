import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { login, register } from "../authSlice";
import { normalizeEmail } from "../../../shared/lib/strings";
import { TextField, Button } from "../../../shared/components";

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
    navigate("/", { replace: true });
  }, [navigate, token]);

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
              <TextField
                label="Name (optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Alice"
                autoComplete="name"
              />
            ) : null}

            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />

            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {errorMessage ? (
              <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full"
            >
              {status === "loading"
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </Button>
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
