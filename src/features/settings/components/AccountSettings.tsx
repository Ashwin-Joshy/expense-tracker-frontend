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
import { TextField, SelectField, Button, Avatar } from "../../../shared/components";

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
        <TextField
          label="User name"
          value={userName}
          onChange={(e) => dispatch(setUserName(e.target.value))}
          placeholder="Your name"
        />

        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-400">Avatar</div>
          <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
            <Avatar src={avatarDataUrl} name={userName} />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(setAvatarDataUrl(null))}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SelectField
          label="Currency"
          value={currencyCode}
          onChange={(e) =>
            dispatch(setCurrencyCode(e.target.value as CurrencyCode))
          }
          options={currencyOptions}
          className="max-w-sm"
        />
        <div className="text-xs text-zinc-500">
          The selected currency symbol shows everywhere money is displayed.
        </div>
      </div>
    </div>
  );
}
