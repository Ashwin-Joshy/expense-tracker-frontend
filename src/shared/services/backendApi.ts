import { getAuthToken } from "./authToken";

export type CurrencyCode =
  | "USD"
  | "INR"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD";

export type UserMe = {
  id: string;
  userName: string;
  avatarDataUrl: string | null;
  currencyCode: CurrencyCode;
};

export type Transaction = {
  id: string;
  type: "expense" | "credit";
  title: string;
  amount: number;
  category: string;
  dateISO: string; // YYYY-MM-DD
  note?: string;
};

export type CategoriesResponse = {
  expense: string[];
  credit: string[];
};

export type ApiError = Error & {
  status?: number;
  details?: unknown;
};

export type AuthUser = {
  id: string;
  email: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestampISO: string;
};

export type ChatResponse = {
  conversationId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAtISO: string;
  createdAtISO: string;
};

export type ConversationDetail = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAtISO: string;
  updatedAtISO: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  const base = raw?.trim() ? raw.trim() : "http://localhost:3000/api";
  return base.replace(/\/+$/, "");
}

function joinUrl(baseUrl: string, path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  init?: (RequestInit & { auth?: boolean }),
): Promise<TResponse> {
  const url = joinUrl(getBaseUrl(), path);
  const token = init?.auth === false ? null : getAuthToken();

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (res.ok) {
    const body = (await readJsonSafe(res)) as TResponse;
    return body;
  }

  const details = await readJsonSafe(res);
  const extracted =
    details &&
    typeof details === "object" &&
    details !== null &&
    "message" in details &&
    typeof (details as { message: unknown }).message === "string" &&
    (details as { message: string }).message.trim().length > 0
      ? (details as { message: string }).message
      : null;

  const msg = extracted ?? `Request failed (${res.status})`;

  const err: ApiError = new Error(msg);
  err.status = res.status;
  err.details = details;
  throw err;
}

export const backendApi = {
  auth: {
    login(input: { email: string; password: string }) {
      return apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
        auth: false,
      });
    },
    register(input: { email: string; password: string; userName?: string }) {
      return apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
        auth: false,
      });
    },
  },
  users: {
    getMe() {
      return apiRequest<UserMe>("/users/me");
    },
    patchMe(patch: Partial<Pick<UserMe, "userName" | "avatarDataUrl" | "currencyCode">>) {
      return apiRequest<UserMe>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
  },
  categories: {
    getAll() {
      return apiRequest<CategoriesResponse>("/categories");
    },
    add(input: { kind: "expense" | "credit"; name: string }) {
      return apiRequest<CategoriesResponse>("/categories", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    delete(input: { kind: "expense" | "credit"; name: string }) {
      const params = new URLSearchParams();
      params.set("kind", input.kind);
      params.set("name", input.name);
      return apiRequest<CategoriesResponse>(`/categories?${params.toString()}`, {
        method: "DELETE",
      });
    },
  },
  transactions: {
    list(input?: { fromISO?: string; toISO?: string; type?: "expense" | "credit" }) {
      const params = new URLSearchParams();
      if (input?.fromISO) params.set("from", input.fromISO);
      if (input?.toISO) params.set("to", input.toISO);
      if (input?.type) params.set("type", input.type);
      const suffix = params.size ? `?${params.toString()}` : "";
      return apiRequest<Transaction[]>(`/transactions${suffix}`);
    },
    create(input: Omit<Transaction, "id">) {
      return apiRequest<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    delete(id: string) {
      return apiRequest<{ deleted: true }>(`/transactions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },
  ai: {
    chat(body: { message: string; conversationId?: string }) {
      return apiRequest<ChatResponse>("/ai/chat", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    getConversations() {
      return apiRequest<Conversation[]>("/ai/conversations");
    },
    getConversation(id: string) {
      return apiRequest<ConversationDetail>(`/ai/conversations/${encodeURIComponent(id)}`);
    },
    renameConversation(id: string, title: string) {
      return apiRequest<{ updated: boolean; title: string }>(
        `/ai/conversations/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify({ title }) },
      );
    },
    deleteConversation(id: string) {
      return apiRequest<{ deleted: boolean }>(
        `/ai/conversations/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
    },
  },
} as const;
