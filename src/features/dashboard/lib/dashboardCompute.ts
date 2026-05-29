import type { Transaction } from '../../../shared/services/backendApi';
import { parseDateISO } from '../../../shared/lib/dateISO';
import { CHART_COLORS } from './chartTheme';

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// --- Stats with trends ---

export type StatsResult = {
  monthNet: number;
  last7Net: number;
  avgPerDay: number;
  monthChange: number | null;
  weekChange: number | null;
};

export function computeStats(transactions: Transaction[]): StatsResult {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const last7Start = addDays(todayStart, -6);
  const prev7Start = addDays(todayStart, -13);

  let monthNet = 0;
  let prevMonthNet = 0;
  let last7Net = 0;
  let prev7Net = 0;

  for (const t of transactions) {
    const dt = parseDateISO(t.dateISO);
    if (!dt) continue;
    const signed = t.type === 'credit' ? t.amount : -t.amount;
    if (dt >= monthStart && dt <= todayStart) monthNet += signed;
    if (dt >= prevMonthStart && dt <= prevMonthEnd) prevMonthNet += signed;
    if (dt >= last7Start && dt <= todayStart) last7Net += signed;
    if (dt >= prev7Start && dt < last7Start) prev7Net += signed;
  }

  const monthChange = prevMonthNet !== 0
    ? ((monthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100
    : null;
  const weekChange = prev7Net !== 0
    ? ((last7Net - prev7Net) / Math.abs(prev7Net)) * 100
    : null;

  return {
    monthNet: round2(monthNet),
    last7Net: round2(last7Net),
    avgPerDay: round2(last7Net / 7),
    monthChange: monthChange !== null ? round2(monthChange) : null,
    weekChange: weekChange !== null ? round2(weekChange) : null,
  };
}

// --- Expense Trend ---

export type TrendPoint = {
  date: string;
  shortLabel: string;
  expense: number;
  income: number;
  net: number;
};

export function computeExpenseTrend(transactions: Transaction[], days = 30): TrendPoint[] {
  const now = new Date();
  const start = addDays(startOfDay(now), -(days - 1));

  const dayMap = new Map<string, { expense: number; income: number }>();
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const key = formatISODate(d);
    dayMap.set(key, { expense: 0, income: 0 });
  }

  for (const t of transactions) {
    const entry = dayMap.get(t.dateISO);
    if (!entry) continue;
    if (t.type === 'expense') entry.expense += t.amount;
    else entry.income += t.amount;
  }

  return Array.from(dayMap.entries()).map(([date, { expense, income }]) => ({
    date,
    shortLabel: formatShortDate(date),
    expense: round2(expense),
    income: round2(income),
    net: round2(income - expense),
  }));
}

// --- Category Breakdown ---

export type CategorySlice = {
  name: string;
  value: number;
  color: string;
};

export function computeCategoryBreakdown(
  transactions: Transaction[],
  expenseCategories: string[],
): CategorySlice[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = startOfDay(now);

  const catMap = new Map<string, number>();
  for (const cat of expenseCategories) catMap.set(cat, 0);

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const dt = parseDateISO(t.dateISO);
    if (!dt || dt < monthStart || dt > todayStart) continue;
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
  }

  return Array.from(catMap.entries())
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({
      name,
      value: round2(amount),
      color: CHART_COLORS.category[i % CHART_COLORS.category.length],
    }));
}

// --- Monthly Comparison ---

export type MonthComparison = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

export function computeMonthlyComparison(transactions: Transaction[], months = 6): MonthComparison[] {
  const now = new Date();
  const buckets: { label: string; key: string; income: number; expense: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString(undefined, { month: 'short' });
    buckets.push({ key, label, income: 0, expense: 0 });
  }

  const bucketMap = new Map(buckets.map(b => [b.key, b]));
  for (const t of transactions) {
    const key = t.dateISO.slice(0, 7);
    const bucket = bucketMap.get(key);
    if (!bucket) continue;
    if (t.type === 'credit') bucket.income += t.amount;
    else bucket.expense += t.amount;
  }

  return buckets.map(b => ({
    month: b.label,
    income: round2(b.income),
    expense: round2(b.expense),
    net: round2(b.income - b.expense),
  }));
}

// --- Top Categories ---

export type TopCategory = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
};

export function computeTopCategories(transactions: Transaction[], topN = 5): TopCategory[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = startOfDay(now);
  const catMap = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const dt = parseDateISO(t.dateISO);
    if (!dt || dt < monthStart || dt > todayStart) continue;
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
  }

  const sorted = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  const maxAmount = sorted[0]?.[1] ?? 1;

  return sorted.map(([category, amount], i) => ({
    category,
    amount: round2(amount),
    percentage: round2((amount / maxAmount) * 100),
    color: CHART_COLORS.category[i % CHART_COLORS.category.length],
  }));
}

// --- Day of Week ---

export type DayOfWeekPoint = {
  day: string;
  total: number;
  avg: number;
  count: number;
};

export function computeDayOfWeekPattern(transactions: Transaction[]): DayOfWeekPoint[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = new Array(7).fill(0) as number[];
  const dayCounts = new Array(7).fill(0) as number[];

  const now = new Date();
  const thirtyDaysAgo = addDays(startOfDay(now), -30);

  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const dt = parseDateISO(t.dateISO);
    if (!dt || dt < thirtyDaysAgo) continue;
    const dow = dt.getDay();
    dayTotals[dow] += t.amount;
    dayCounts[dow]++;
  }

  return dayNames.map((name, i) => ({
    day: name,
    total: round2(dayTotals[i]),
    avg: dayCounts[i] > 0 ? round2(dayTotals[i] / dayCounts[i]) : 0,
    count: dayCounts[i],
  }));
}
