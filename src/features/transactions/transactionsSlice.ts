import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { backendApi, type ApiError, type Transaction } from "../../shared/services/backendApi";
import { logout } from "../auth/authSlice";

export type TransactionsState = {
  items: Transaction[];
  hydrated: boolean;
};

const initialState: TransactionsState = {
  items: [],
  hydrated: false,
};

export const hydrateTransactions = createAsyncThunk(
  "transactions/hydrate",
  async (_, api) => {
    try {
      return await backendApi.transactions.list();
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) api.dispatch(logout());
      throw e;
    }
  },
);

export const createTransaction = createAsyncThunk(
  "transactions/create",
  async (input: Omit<Transaction, "id">, api) => {
    try {
      return await backendApi.transactions.create(input);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) api.dispatch(logout());
      throw e;
    }
  },
);

export const removeTransaction = createAsyncThunk(
  "transactions/remove",
  async (id: string, api) => {
    try {
      await backendApi.transactions.delete(id);
      return id;
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) api.dispatch(logout());
      throw e;
    }
  },
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    deleteTransaction(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    clearTransactions(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateTransactions.fulfilled, (state, action) => {
      state.items = action.payload;
      state.hydrated = true;
    });
    builder.addCase(hydrateTransactions.rejected, (state) => {
      state.hydrated = true;
    });
    builder.addCase(createTransaction.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });
    builder.addCase(removeTransaction.fulfilled, (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.items = [];
      state.hydrated = false;
    });
  },
});

export const { deleteTransaction, clearTransactions } = transactionsSlice.actions;

export default transactionsSlice.reducer;
