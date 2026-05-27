import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadConversations, clearError, appendUserMessage } from "../aiChatSlice";
import { useAiChatSocket } from "../useAiChatSocket";
import ChatSidebar from "../components/ChatSidebar";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import SuggestedQuestions from "../components/SuggestedQuestions";

export default function AIChatPage() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((s) => s.aiChat.messages);
  const streamStatus = useAppSelector((s) => s.aiChat.streamStatus);
  const streamingText = useAppSelector((s) => s.aiChat.streamingText);
  const errorChat = useAppSelector((s) => s.aiChat.errorChat);
  const currentId = useAppSelector((s) => s.aiChat.currentConversationId);

  const { send, cancel, isStreaming } = useAiChatSocket();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(loadConversations());
  }, [dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, streamStatus]);

  const handleSend = useCallback(
    (message: string) => {
      dispatch(appendUserMessage({ content: message }));
      send(message);
    },
    [dispatch, send],
  );

  const handleSuggested = useCallback(
    (question: string) => {
      dispatch(appendUserMessage({ content: question }));
      send(question);
    },
    [dispatch, send],
  );

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatSidebar />

      <main className="flex flex-1 flex-col bg-zinc-950">
        {errorChat && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="flex-1">
              {errorChat.includes("not configured")
                ? "AI chat is not available right now."
                : errorChat}
            </span>
            <button
              onClick={() => dispatch(clearError())}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="w-full max-w-lg space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-emerald-400"
                  >
                    <path d="M12 8a2.83 2.83 0 0 0-4 0 2.83 2.83 0 0 0 0 4 2.83 2.83 0 0 0 4 0 2.83 2.83 0 0 0 0-4Z" />
                    <path d="M7.5 13.5c-.93 0-2.07-.2-2.93-.93C3.61 12 3 10.93 3 10a2.83 2.83 0 0 1 4-2.83" />
                    <path d="M16.5 13.5c.93 0 2.07-.2 2.93-.93C20.39 12 21 10.93 21 10a2.83 2.83 0 0 0-4-2.83" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-zinc-100">
                  Chat with AI
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Ask questions about your spending, savings, and financial trends.
                </p>
              </div>

              <SuggestedQuestions onSelect={handleSuggested} />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mx-auto max-w-2xl space-y-4">
                {currentId && (
                  <p className="text-center text-xs text-zinc-600">
                    Conversation started
                  </p>
                )}
                {messages.map((m, i) => (
                  <MessageBubble
                    key={i}
                    role={m.role}
                    content={m.content}
                    timestampISO={m.timestampISO}
                  />
                ))}

                {isStreaming && (
                  <MessageBubble
                    role="assistant"
                    content={streamingText}
                    timestampISO={new Date().toISOString()}
                    isStreaming={
                      streamStatus === "responding" ||
                      streamStatus === "thinking"
                    }
                  />
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            <ChatInput
              onSend={handleSend}
              disabled={isStreaming}
              onCancel={cancel}
              isStreaming={isStreaming}
            />
          </div>
        )}
      </main>
    </div>
  );
}
