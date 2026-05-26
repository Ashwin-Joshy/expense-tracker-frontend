import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import { Avatar } from "../../shared/components";

type LogoSpec = {
  mark: string;
  from: string;
  to: string;
};

const LOGO_STORAGE_KEY = "expense-tracker.logo.v1";

function randomInt(minInclusive: number, maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}

function pick<T>(items: readonly T[]) {
  return items[randomInt(0, items.length - 1)];
}

function generateLogoSpec(): LogoSpec {
  const marks = ["ET", "EX", "XP", "TR", "DG", "TX"] as const;

  const hues = [142, 148, 155, 165, 175] as const;
  const hueA = pick(hues);
  const hueB = pick(hues);

  const from = `hsl(${hueA} 85% 55%)`;
  const to = `hsl(${hueB} 85% 45%)`;

  return { mark: pick(marks), from, to };
}

function loadOrCreateLogoSpec(): LogoSpec {
  try {
    const raw = sessionStorage.getItem(LOGO_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LogoSpec;

    const created = generateLogoSpec();
    sessionStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(created));
    return created;
  } catch {
    return generateLogoSpec();
  }
}

function navItemClass(isActive: boolean) {
  const base =
    "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60";

  if (isActive) {
    return `${base} bg-emerald-500/12 text-emerald-200`;
  }

  return `${base} text-zinc-200 hover:bg-white/5 hover:text-white`;
}

export default function Navbar() {
  const logo = useMemo(loadOrCreateLogoSpec, []);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userName, avatarDataUrl } = useAppSelector((s) => ({
    userName: s.settings.userName,
    avatarDataUrl: s.settings.avatarDataUrl,
  }));
  const [profileOpen, setProfileOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const addRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function dismissRefs(e: MouseEvent) {
      [profileRef, addRef].forEach((ref) => {
        if (!ref.current) return;
        if (e.target instanceof Node && !ref.current.contains(e.target)) {
          if (ref === profileRef) setProfileOpen(false);
          else setAddOpen(false);
        }
      });
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setAddOpen(false);
      }
    }

    if (profileOpen || addOpen) {
      document.addEventListener("mousedown", dismissRefs);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("mousedown", dismissRefs);
        document.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [profileOpen, addOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/30 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="group flex items-center gap-3">
          <div
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-lg text-xs font-extrabold tracking-wider text-zinc-950 ring-1 ring-emerald-500/30"
            style={{
              backgroundImage: `linear-gradient(135deg, ${logo.from}, ${logo.to})`,
            }}
          >
            {logo.mark}
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-50">Expense Tracker</div>
            <div className="text-xs text-zinc-400 group-hover:text-zinc-300">Dark + green vibes</div>
          </div>
        </NavLink>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={({ isActive }) => navItemClass(isActive)}>
            Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => navItemClass(isActive)}
          >
            Transactions
          </NavLink>

          <div ref={addRef} className="relative">
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="rounded-md border border-emerald-500/25 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              aria-haspopup="menu"
              aria-expanded={addOpen}
            >
              Add Transaction
            </button>

            {addOpen ? (
              <div
                role="menu"
                className="absolute right-0 z-10 mt-2 w-32 overflow-hidden rounded-xl border border-emerald-900/30 bg-zinc-950/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur"
              >
                <Link
                  to="/add-expense"
                  onClick={() => setAddOpen(false)}
                  role="menuitem"
                  className="block px-4 py-3 text-sm text-zinc-200 hover:bg-white/5 hover:text-white"
                >
                  Add Expense
                </Link>
                <Link
                  to="/add-credit"
                  onClick={() => setAddOpen(false)}
                  role="menuitem"
                  className="block px-4 py-3 text-sm text-zinc-200 hover:bg-white/5 hover:text-white"
                >
                  Add Credit
                </Link>
              </div>
            ) : null}
          </div>

          <div ref={profileRef} className="relative ml-1">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-zinc-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Profile menu"
            >
              {avatarDataUrl ? (
                <img
                  src={avatarDataUrl}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <span>{userName.trim().slice(0, 2).toUpperCase() || "U"}</span>
              )}
            </button>

            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-emerald-900/30 bg-zinc-950/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur"
              >
                <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
                  <Avatar src={avatarDataUrl} name={userName} size="md" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">
                      {userName}
                    </div>
                    <div className="text-xs text-zinc-500">Profile</div>
                  </div>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                  className="block px-4 py-3 text-sm text-zinc-200 hover:bg-white/5 hover:text-white"
                >
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    setProfileOpen(false);
                    await dispatch(logout());
                    navigate("/login", { replace: true });
                  }}
                  role="menuitem"
                  className="block w-full px-4 py-3 text-left text-sm text-zinc-200 hover:bg-white/5 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
