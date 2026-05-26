import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  newChat,
  loadConversation,
  renameConversation,
  deleteConversation,
  clearError,
} from "../aiChatSlice";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function ChatSidebar() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((s) => s.aiChat.conversations);
  const currentId = useAppSelector((s) => s.aiChat.currentConversationId);

  const handleNewChat = useCallback(() => {
    dispatch(newChat());
  }, [dispatch]);

  const handleSelect = useCallback(
    (id: string) => {
      dispatch(clearError());
      dispatch(loadConversation(id));
    },
    [dispatch],
  );

  const handleRename = useCallback(
    (id: string, currentTitle: string) => {
      const newTitle = window.prompt("Rename conversation", currentTitle);
      if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
        dispatch(renameConversation({ id, title: newTitle.trim() }));
      }
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Delete this conversation?")) {
        dispatch(deleteConversation(id));
      }
    },
    [dispatch],
  );

  return (
    <aside className="flex h-full w-72 flex-col border-r border-white/5 bg-zinc-950/60">
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/18 hover:text-emerald-200 transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-zinc-500">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const isActive = c.id === currentId;
              return (
                <li key={c.id} className="group relative">
                  <button
                    onClick={() => handleSelect(c.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-emerald-500/10 border-l-2 border-emerald-400 text-zinc-100"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                  >
                    <div className="truncate pr-12">{c.title}</div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      {formatDate(c.updatedAtISO)}
                    </div>
                  </button>

                  <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(c.id, c.title);
                      }}
                      className="rounded p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
                      title="Rename"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-700"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
