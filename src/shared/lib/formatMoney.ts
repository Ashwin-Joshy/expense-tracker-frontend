import type { CurrencyCode } from "../../features/settings/settingsSlice";

export function formatMoney(amount: number, currencyCode: CurrencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const sign =
      currencyCode === "INR"
        ? "₹"
        : currencyCode === "EUR"
          ? "€"
          : currencyCode === "GBP"
            ? "£"
            : currencyCode === "JPY"
              ? "¥"
              : "$";
    return `${sign}${amount.toFixed(2)}`;
  }
}

