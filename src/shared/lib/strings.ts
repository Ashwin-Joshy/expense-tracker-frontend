export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeCategory(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
