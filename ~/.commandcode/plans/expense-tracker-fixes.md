# Plan: Expense Tracker Frontend — 7 Fixes & Improvements

## Summary
Seven clean, targeted changes across AI chat, navigation, data loading, logout cleanup, scroll behavior, responsive UI, and refresh-on-navigate.

---

## 1. AI Chat: Show ChatInput + SuggestedQuestions together on empty state ✨

**Problem:** When `isEmpty` (no messages, not streaming), only `SuggestedQuestions` renders — no chat input box. Users can't type.

**Files to change:**
- `src/features/aiChat/pages/AIChatPage.tsx`
- `src/features/aiChat/components/SuggestedQuestions.tsx`

**Approach:** In `AIChatPage`, restructure the empty state so `SuggestedQuestions` and `ChatInput` both render. The empty state currently returns `ChatInput` *only* in the `else` (non-empty) branch. Instead, render `ChatInput` unconditionally at the bottom of `<main>`, and only swap the middle area between empty-state and messages view.

**Also:** Add two suggestions to `SuggestedQuestions`:
- `"Create a new transaction"`
- `"What have I done today?"`

---

## 2. Navbar: Add "Chat with AI" nav item 💬

**Problem:** No navigation link to `/ai-chat` in the navbar.

**File to change:**
- `src/shared/components/Navbar.tsx`

**Approach:** Add a `<NavLink to="/ai-chat">` between Transactions and the Add Transaction dropdown, using the same `navItemClass` utility. Add a subtle icon (e.g., sparkles) for visual distinction.

---

## 3. Transactions: Initial load only fetches last 7 days 📅

**Problem:** `hydrateTransactions` fetches *all* transactions. For initial load, only last 7 days are needed.

**Files to change:**
- `src/features/transactions/transactionsSlice.ts`
- `src/shared/lib/dateISO.ts` (add helper)

**Approach:** 
- Add a `daysAgoISO(days: number)` helper to `dateISO.ts` that returns `YYYY-MM-DD` for N days ago.
- In `hydrateTransactions` thunk, call `backendApi.transactions.list({ fromISO: daysAgoISO(7) })`.
- The existing `transactions.list()` already supports `fromISO` param — no API layer changes needed.
- `TransactionsPage` still loads full data for filtering (it uses the Redux store), so this only affects the hydration thunk.

---

## 4. Logout: Clear all persisted localStorage data 🗑️

**Problem:** When a user logs out, the persisted state (`STORAGE_KEY`) and auth token remain in localStorage. The next person who opens the app on the same device sees stale data.

**Files to change:**
- `src/app/persist.ts`
- `src/features/auth/authSlice.ts`
- `src/shared/services/authToken.ts`

**Approach:**
- In `persist.ts`, export a `clearPersistedState()` function that removes `STORAGE_KEY` from `localStorage`.
- In `authSlice.ts`'s `logout` thunk (`logout.fulfilled` reducer), call `clearPersistedState()`.
- `authToken.ts` already has `clearAuthToken()` which the logout thunk already calls — that part is fine.
- The key addition: clearing the persisted settings/transactions key too.
- **However:** `authSlice` is a Redux slice (pure functions), and `clearPersistedState()` is a side effect. The cleanest approach: call `clearPersistedState()` inside the `logout` thunk itself (before returning), since thunks *can* have side effects.

```ts
// In logout thunk:
export const logout = createAsyncThunk("auth/logout", async () => {
  clearAuthToken();
  clearPersistedState(); // NEW
  return true;
});
```

No reducer changes needed — `clearPersistedState()` in the thunk + existing `logout.fulfilled` reducer (which already resets slices to initial state) handles everything.

---

## 5. Chat scroll: Don't auto-scroll when user manually scrolls up 📜

**Problem:** The `useEffect` in `AIChatPage` calls `scrollIntoView` on every `messages`/`streamingText`/`streamStatus` change, constantly yanking the user back down during streaming.

**Files to change:**
- `src/features/aiChat/pages/AIChatPage.tsx`

**Approach:** Track whether the user has manually scrolled up. Use a ref to hold a `userScrolledUp` boolean. Add an `onScroll` handler to the scrollable message container. If the user is within ~100px of the bottom, auto-scroll normally. If they've scrolled up, don't auto-scroll.

Implementation:
- Add `const messagesContainerRef = useRef<HTMLDivElement>(null)` and `const shouldAutoScroll = useRef(true)`.
- Add `onScroll` handler on the messages `<div>`: check `scrollHeight - scrollTop - clientHeight < 100` → `shouldAutoScroll.current = true`, else `false`.
- In the scroll `useEffect`, wrap `scrollIntoView` in `if (shouldAutoScroll.current)`.
- Reset `shouldAutoScroll.current = true` when the user sends a new message (`handleSend` / `handleSuggested`).

---

## 6. Responsive UI: Fix layout for mobile/tablet 📱

**Problem:** Several components break on small screens.

**Areas to fix:**

| Component | Issue | Fix |
|-----------|-------|-----|
| `Navbar.tsx` | Nav links + Add Transaction + profile overflow on mobile | Add responsive classes: hide center nav text on small screens (icon-only), wrap Add Transaction to icon-only on xs, reduce gap |
| `AIChatPage.tsx` | Sidebar + chat don't fit on mobile | Make sidebar collapsible: add a hamburger toggle on mobile, sidebar overlays chat when open |
| `TransactionsPage.tsx` | Table grid-cols-12 collapses on mobile, date filter row stacks poorly | Use `grid-cols-1 sm:grid-cols-12` on the table, make filter inputs full-width on mobile, stack cards naturally |
| `DashboardPage.tsx` | Stats cards `sm:grid-cols-3` works, but recent activity + tips should stack on mobile | Already `grid-cols-1 lg:grid-cols-2` — this is fine. Only minor padding tweaks needed |
| `LoginPage.tsx` | Unknown — need to check | Apply `max-w-sm mx-auto px-4` pattern |
| `ChatSidebar.tsx` | Independent component, needs mobile handling | Add `hidden lg:block` default, toggle with state |
| `SuggestedQuestions.tsx` | `grid-cols-1 sm:grid-cols-2` is fine | No change needed |

**Files to change:**
- `src/shared/components/Navbar.tsx`
- `src/features/aiChat/pages/AIChatPage.tsx`
- `src/features/aiChat/components/ChatSidebar.tsx`
- `src/features/transactions/pages/TransactionsPage.tsx`

**Key approach for ChatSidebar:** Add a state variable `sidebarOpen` in `AIChatPage`, pass it down. On mobile, the sidebar slides in from the left as an overlay. Add a backdrop overlay behind it. Show a toggle button (hamburger) at the top of the chat area on small screens.

---

## 7. Refresh on navigate: Load latest data when menu/page is opened 🔄

**Problem:** Dashboard and Transactions page show cached data. Opening the page doesn't trigger a fresh fetch.

**Files to change:**
- `src/features/dashboard/pages/DashboardPage.tsx`
- `src/features/transactions/pages/TransactionsPage.tsx`
- `src/features/aiChat/pages/AIChatPage.tsx` (already does `loadConversations` on mount — keep this)

**Approach:**
- In `DashboardPage`, dispatch `hydrateTransactions()` in a `useEffect` on mount. Since `hydrateTransactions` already sets `hydrated: true`, subsequent navigation back to Dashboard will re-fetch. To avoid re-fetch confusion: add a separate thunk `refreshTransactions` (or just reuse `hydrateTransactions`) that always fetches and overwrites.
- Simpler approach: Dispatch `hydrateTransactions()` again. The thunk will re-fetch and replace the items array.
- In `TransactionsPage`, same pattern — dispatch `hydrateTransactions()` on mount.

**Edge case:** `hydrateTransactions.fulfilled` already processes the reducer. No reducer changes needed.

**Cleaner approach:** Rename or add a `fetchTransactions` thunk that doesn't touch `hydrated` (or keep using `hydrateTransactions` — since it sets hydrated to true, and on re-entry `RootLayout` checks hydration, but since it's already hydrated it won't re-bootstrap. So dispatching `hydrateTransactions` again from the page is safe).

---

## File-by-file change list

### `src/shared/lib/dateISO.ts`
- Add `daysAgoISO(days: number): string` helper.

### `src/app/persist.ts`
- Export `clearPersistedState()` that removes `STORAGE_KEY` from localStorage.

### `src/features/auth/authSlice.ts`
- In `logout` thunk, add `clearPersistedState()` call.

### `src/shared/components/Navbar.tsx`
- Add "Chat with AI" `<NavLink to="/ai-chat">` nav item.
- Add responsive classes: hide text labels on small screens, adjust spacing.

### `src/features/aiChat/pages/AIChatPage.tsx`
- Restructure render: `ChatInput` always visible at bottom. Empty state shows `SuggestedQuestions` above it.
- Add scroll tracking ref + `onScroll` handler to messages container.
- Reset `shouldAutoScroll` on send.
- Add `sidebarOpen` state + hamburger toggle for mobile.
- Add `SidebarOverlay` component (inline) for mobile sidebar backdrop.

### `src/features/aiChat/components/SuggestedQuestions.tsx`
- Add two new questions: `"Create a new transaction"`, `"What have I done today?"`

### `src/features/aiChat/components/ChatSidebar.tsx`
- Accept `isOpen: boolean` + `onClose: () => void` props.
- Add `hidden lg:block` to sidebar wrapper.
- On mobile: `fixed inset-y-0 left-0 z-40 w-72` with transform transition.

### `src/features/transactions/transactionsSlice.ts`
- Change `hydrateTransactions` to use `{ fromISO: daysAgoISO(7) }`.

### `src/features/transactions/pages/TransactionsPage.tsx`
- Add `useEffect` on mount to dispatch `hydrateTransactions()`.
- Add responsive table classes (`grid-cols-1 sm:grid-cols-12`), full-width filter inputs on mobile.

### `src/features/dashboard/pages/DashboardPage.tsx`
- Add `useEffect` on mount to dispatch `hydrateTransactions()`.

---

## Verification

1. **AI Chat input:** Open `/ai-chat` with no messages → both suggested questions grid AND text input box visible. Clicking a suggestion or typing works.
2. **New suggestions:** Two new buttons: "Create a new transaction", "What have I done today?" visible and clickable.
3. **Navbar link:** "Chat with AI" link visible between Transactions and Add Transaction. Click → navigates to `/ai-chat`.
4. **Last 7 days:** On page load (hard refresh), check Network tab — `/transactions?from=YYYY-MM-DD` called with 7-days-ago date.
5. **Logout cleanup:** Log in, refresh page, log out. Check localStorage → `STORAGE_KEY` removed, `authToken` removed. Refresh → clean login page.
6. **Scroll free during streaming:** Send a message, wait for stream, scroll up manually → view stays put. Scroll back to bottom → resumes auto-scroll.
7. **Responsive:** Open Chrome DevTools, toggle device toolbar → test at 375px, 768px, 1024px. Nav links compact, chat sidebar toggles, transactions table readable, dashboard cards stack.
8. **Refresh on navigate:** Open Dashboard, navigate to Transactions, navigate back to Dashboard → Network tab shows fresh `/transactions` fetch each time.
