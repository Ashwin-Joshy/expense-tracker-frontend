function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function parseDateISO(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function monthRangeISO(date: Date) {
  const year = date.getFullYear();
  const monthIndex0 = date.getMonth();
  const month = monthIndex0 + 1;
  const lastDay = new Date(year, monthIndex0 + 1, 0).getDate();

  return {
    fromISO: `${year}-${pad2(month)}-01`,
    toISO: `${year}-${pad2(month)}-${pad2(lastDay)}`,
  };
}

