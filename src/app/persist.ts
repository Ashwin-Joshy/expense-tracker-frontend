import type {
  CurrencyCode,
  SettingsState,
} from "../features/settings/settingsSlice";
import type { TransactionsState } from "../features/transactions/transactionsSlice";

export const STORAGE_KEY = "expense-tracker.state.v1";

export type PersistableState = {
  settings: SettingsState;
  transactions: TransactionsState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeSettings(raw: unknown): SettingsState | null {
  if (!isRecord(raw)) return null;

  const userName = typeof raw.userName === "string" ? raw.userName : "User";
  const avatarDataUrl =
    typeof raw.avatarDataUrl === "string" ? raw.avatarDataUrl : null;
  const allowedCurrencies: CurrencyCode[] = [
    "USD",
    "INR",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
  ];
  const currencyCodeRaw = typeof raw.currencyCode === "string" ? raw.currencyCode : "USD";
  const currencyCode: CurrencyCode = allowedCurrencies.includes(
    currencyCodeRaw as CurrencyCode,
  )
    ? (currencyCodeRaw as CurrencyCode)
    : "USD";

  const expenseCategoriesRaw =
    (raw as { expenseCategories?: unknown }).expenseCategories ??
    (raw as { categories?: unknown }).categories;
  const expenseCategories = Array.isArray(expenseCategoriesRaw)
    ? expenseCategoriesRaw.filter(
        (c) => typeof c === "string" && c.trim().length > 0,
      )
    : [];

  const creditCategoriesRaw = (raw as { creditCategories?: unknown }).creditCategories;
  const creditCategories = Array.isArray(creditCategoriesRaw)
    ? creditCategoriesRaw.filter(
        (c) => typeof c === "string" && c.trim().length > 0,
      )
    : [];

  return {
    userName: userName.trim().length > 0 ? userName : "User",
    avatarDataUrl,
    currencyCode,
    expenseCategories:
      expenseCategories.length > 0
        ? expenseCategories
        : ["Food", "Transport", "Bills", "Shopping", "Other"],
    creditCategories:
      creditCategories.length > 0
        ? creditCategories
        : ["Salary", "Refund", "Gift", "Other"],
    hydrated: false,
  };
}

function sanitizeTransactions(raw: unknown): TransactionsState | null {
  if (!isRecord(raw)) return null;
  const itemsRaw = raw.items;
  if (!Array.isArray(itemsRaw)) return { items: [], hydrated: false };

  const items = itemsRaw
    .filter(isRecord)
    .map((t) => {
      const id = typeof t.id === "string" ? t.id : "";
      const type =
        (t.type === "credit" || t.type === "expense"
          ? t.type
          : "expense") as "credit" | "expense";
      const title = typeof t.title === "string" ? t.title : "";
      const amount = typeof t.amount === "number" ? t.amount : 0;
      const category = typeof t.category === "string" ? t.category : "";
      const dateISO = typeof t.dateISO === "string" ? t.dateISO : "";
      const note = typeof t.note === "string" ? t.note : undefined;

      return { id, type, title, amount, category, dateISO, note };
    })
    .filter(
      (t) =>
        t.id.trim().length > 0 &&
        (t.type === "credit" || t.type === "expense") &&
        t.title.trim().length > 0 &&
        Number.isFinite(t.amount) &&
        t.amount >= 0 &&
        t.category.trim().length > 0 &&
        t.dateISO.trim().length > 0,
    );

  return { items, hydrated: false };
}

export function loadPersistedState():
  | Partial<PersistableState>
  | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return undefined;

    const settings = sanitizeSettings(parsed.settings);
    const transactions = sanitizeTransactions(parsed.transactions);

    if (!settings && !transactions) return undefined;

    return {
      ...(settings ? { settings } : {}),
      ...(transactions ? { transactions } : {}),
    } as Partial<PersistableState>;
  } catch {
    return undefined;
  }
}

export function persistState(state: PersistableState): string {
  const toPersist: PersistableState = {
    settings: state.settings,
    transactions: state.transactions,
  };

  try {
    return JSON.stringify(toPersist);
  } catch {
    return "";
  }
}
