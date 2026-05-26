import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { backendApi, type CurrencyCode } from "../../shared/services/backendApi";
import { handleThunkError } from "../../shared/services/handleThunkError";
import { normalizeCategory } from "../../shared/lib/strings";
import { logout } from "../auth/authSlice";

export type { CurrencyCode };

export type SettingsState = {
  userName: string;
  avatarDataUrl: string | null;
  currencyCode: CurrencyCode;
  expenseCategories: string[];
  creditCategories: string[];
  hydrated: boolean;
};

const initialState: SettingsState = {
  userName: "User",
  avatarDataUrl: null,
  currencyCode: "USD",
  expenseCategories: ["Food", "Transport", "Bills", "Shopping", "Other"],
  creditCategories: ["Salary", "Refund", "Gift", "Other"],
  hydrated: false,
};

export const hydrateSettings = createAsyncThunk(
  "settings/hydrate",
  async (_, api) => {
    try {
      const [user, categories] = await Promise.all([
        backendApi.users.getMe(),
        backendApi.categories.getAll(),
      ]);
      return { user, categories };
    } catch (e) {
      handleThunkError(e, api.dispatch);
    }
  },
);

export const syncUserProfile = createAsyncThunk(
  "settings/syncUserProfile",
  async (patch: {
    userName?: string;
    avatarDataUrl?: string | null;
    currencyCode?: CurrencyCode;
  }, api) => {
    try {
      return await backendApi.users.patchMe(patch);
    } catch (e) {
      handleThunkError(e, api.dispatch);
    }
  },
);

export const addCategory = createAsyncThunk(
  "settings/addCategory",
  async (input: { kind: "expense" | "credit"; name: string }, api) => {
    const name = normalizeCategory(input.name);
    try {
      if (!name) return await backendApi.categories.getAll();
      return await backendApi.categories.add({ kind: input.kind, name });
    } catch (e) {
      handleThunkError(e, api.dispatch);
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "settings/deleteCategory",
  async (input: { kind: "expense" | "credit"; name: string }, api) => {
    const name = normalizeCategory(input.name);
    try {
      if (!name) return await backendApi.categories.getAll();
      return await backendApi.categories.delete({ kind: input.kind, name });
    } catch (e) {
      handleThunkError(e, api.dispatch);
    }
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setUserName(state, action: PayloadAction<string>) {
      const next = action.payload.trim();
      state.userName = next.length > 0 ? next : "User";
    },
    setAvatarDataUrl(state, action: PayloadAction<string | null>) {
      state.avatarDataUrl = action.payload;
    },
    setCurrencyCode(state, action: PayloadAction<CurrencyCode>) {
      state.currencyCode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSettings.fulfilled, (state, action) => {
      state.userName = action.payload.user.userName;
      state.avatarDataUrl = action.payload.user.avatarDataUrl;
      state.currencyCode = action.payload.user.currencyCode;
      state.expenseCategories = action.payload.categories.expense;
      state.creditCategories = action.payload.categories.credit;
      state.hydrated = true;
    });
    builder.addCase(hydrateSettings.rejected, (state) => {
      state.hydrated = true;
    });
    builder.addCase(syncUserProfile.fulfilled, (state, action) => {
      state.userName = action.payload.userName;
      state.avatarDataUrl = action.payload.avatarDataUrl;
      state.currencyCode = action.payload.currencyCode;
    });
    builder.addCase(addCategory.fulfilled, (state, action) => {
      state.expenseCategories = action.payload.expense;
      state.creditCategories = action.payload.credit;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.expenseCategories = action.payload.expense;
      state.creditCategories = action.payload.credit;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.userName = initialState.userName;
      state.avatarDataUrl = initialState.avatarDataUrl;
      state.currencyCode = initialState.currencyCode;
      state.expenseCategories = initialState.expenseCategories;
      state.creditCategories = initialState.creditCategories;
      state.hydrated = false;
    });
  },
});

export const {
  setUserName,
  setAvatarDataUrl,
  setCurrencyCode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
