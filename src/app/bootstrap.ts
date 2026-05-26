import { createAsyncThunk } from "@reduxjs/toolkit";
import { hydrateSettings } from "../features/settings/settingsSlice";
import { hydrateTransactions } from "../features/transactions/transactionsSlice";

export const bootstrapApp = createAsyncThunk("app/bootstrap", async (_, api) => {
  await Promise.all([
    api.dispatch(hydrateSettings()),
    api.dispatch(hydrateTransactions()),
  ]);
});

