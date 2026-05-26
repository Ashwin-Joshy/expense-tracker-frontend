import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import settingsReducer from "../features/settings/settingsSlice";
import transactionsReducer from "../features/transactions/transactionsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// types for TS
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
