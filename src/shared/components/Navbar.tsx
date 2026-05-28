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
            <div className="hidden text-xs text-zinc-400 group-hover:text-zinc-300 sm:block">Dark + green vibes</div>
          </div>
        </NavLink>

        <nav className="flex items-center gap-0.5 sm:gap-2">
          <NavLink to="/" end className={({ isActive }) => navItemClass(isActive)}>
            <span className="hidden sm:inline">Dashboard</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:hidden">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => navItemClass(isActive)}
          >
            <span className="hidden sm:inline">Transactions</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:hidden">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </NavLink>
          <NavLink
            to="/ai-chat"
            className={({ isActive }) => navItemClass(isActive)}
          >
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M12 8a2.83 2.83 0 0 0-4 0 2.83 2.83 0 0 0 0 4 2.83 2.83 0 0 0 4 0 2.83 2.83 0 0 0 0-4Z" />
                <path d="M7.5 13.5c-.93 0-2.07-.2-2.93-.93C3.61 12 3 10.93 3 10a2.83 2.83 0 0 1 4-2.83" />
                <path d="M16.5 13.5c.93 0 2.07-.2 2.93-.93C20.39 12 21 10.93 21 10a2.83 2.83 0 0 0-4-2.83" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
              <span className="hidden sm:inline">Chat with AI</span>
            </span>
          </NavLink>

          <div ref={addRef} className="relative">
            <button
              type="button"
              onClick={() => setAddOpen((v) => !v)}
              className="rounded-md border border-emerald-500/25 bg-emerald-500/12 px-2 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 sm:px-3 sm:text-sm"
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
