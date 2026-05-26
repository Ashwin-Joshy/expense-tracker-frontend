function pad2(n: number) {
  return String(n).padStart(2, "0");
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

