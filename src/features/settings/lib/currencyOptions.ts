import type { CurrencyCode } from "../settingsSlice";

export const currencyOptions: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "USD ($)" },
  { code: "INR", label: "INR (₹)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "JPY", label: "JPY (¥)" },
  { code: "CAD", label: "CAD ($)" },
  { code: "AUD", label: "AUD ($)" },
];

