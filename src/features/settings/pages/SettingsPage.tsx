import { useSearchParams } from "react-router-dom";
import AccountSettings from "../components/AccountSettings";
import CategoriesSettings from "../components/CategoriesSettings";
import SettingsNavItem from "../components/SettingsNavItem";

export default function SettingsPage() {
  const [params] = useSearchParams();
  const tab = (params.get("tab") || "account").toLowerCase();
  const active = tab === "categories" ? "categories" : "account";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-400">Account opens by default.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-emerald-900/30 bg-zinc-950/40 p-2">
          <div className="space-y-1">
            <SettingsNavItem
              active={active === "account"}
              label="Account"
              to="/settings?tab=account"
            />
            <SettingsNavItem
              active={active === "categories"}
              label="Categories"
              to="/settings?tab=categories"
            />
          </div>
        </aside>

        <section className="rounded-xl border border-emerald-900/30 bg-zinc-950/40 p-4">
          {active === "account" ? <AccountSettings /> : <CategoriesSettings />}
        </section>
      </div>
    </div>
  );
}

