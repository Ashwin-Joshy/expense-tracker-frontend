import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import settingsReducer from "../features/settings/settingsSlice";
import transactionsReducer from "../features/transactions/transactionsSlice";
import { loadPersistedState, persistState } from "./persist";

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
});

const preloadedState = loadPersistedState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  if (state.auth.token) {
    persistState({
      settings: state.settings,
      transactions: state.transactions,
    });
  }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
