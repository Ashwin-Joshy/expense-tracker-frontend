const AUTH_TOKEN_KEY = "expense-tracker.authToken.v1";

export function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_TOKEN_KEY);
    const token = raw?.trim() ? raw.trim() : null;
    return token;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}
