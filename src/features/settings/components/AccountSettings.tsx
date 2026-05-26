import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  setAvatarDataUrl,
  setCurrencyCode,
  setUserName,
  syncUserProfile,
  type CurrencyCode,
} from "../settingsSlice";
import { currencyOptions } from "../lib/currencyOptions";
import { readFileAsDataUrl } from "../lib/readFileAsDataUrl";

export default function AccountSettings() {
  const dispatch = useAppDispatch();
  const { userName, avatarDataUrl, currencyCode, hydrated } = useAppSelector(
    (s) => s.settings,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      dispatch(syncUserProfile({ userName, avatarDataUrl, currencyCode }));
    }, 500);
    return () => window.clearTimeout(t);
  }, [avatarDataUrl, currencyCode, dispatch, hydrated, userName]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-zinc-100">Account</div>
        <div className="mt-1 text-sm text-zinc-400">
          Update your name, avatar, and currency.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <div className="text-xs font-medium text-zinc-400">User name</div>
          <input
            value={userName}
            onChange={(e) => dispatch(setUserName(e.target.value))}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            placeholder="Your name"
          />
        </label>

        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-400">Avatar</div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
            {avatarDataUrl ? (
              <img
                src={avatarDataUrl}
                alt=""
                className="size-10 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="grid size-10 place-items-center rounded-full bg-white/10 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">
                {userName.trim().slice(0, 2).toUpperCase() || "U"}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10">
                {busy ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    try {
                      const dataUrl = await readFileAsDataUrl(file);
                      dispatch(setAvatarDataUrl(dataUrl));
                    } finally {
                      setBusy(false);
                      e.target.value = "";
                    }
                  }}
                  disabled={busy}
                />
              </label>
              <button
                type="button"
                onClick={() => dispatch(setAvatarDataUrl(null))}
                className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <label className="space-y-2">
        <div className="text-xs font-medium text-zinc-400">Currency</div>
        <select
          value={currencyCode}
          onChange={(e) =>
            dispatch(setCurrencyCode(e.target.value as CurrencyCode))
          }
          className="w-full max-w-sm rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
        >
          {currencyOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="text-xs text-zinc-500">
          The selected currency symbol shows everywhere money is displayed.
        </div>
      </label>
    </div>
  );
}
