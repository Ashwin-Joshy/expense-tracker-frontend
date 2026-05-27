import AIMessageContent from "./AIMessageContent";

type Props = {
  role: "user" | "assistant";
  content: string;
  timestampISO: string;
  isStreaming?: boolean;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function MessageBubble({ role, content, timestampISO, isStreaming }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "order-1" : "order-1"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-sm bg-emerald-500/20 px-4 py-2.5"
              : "rounded-2xl rounded-bl-sm bg-zinc-800/60 px-4 py-3"
          }
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap text-emerald-50">{content}</p>
          ) : (
            <AIMessageContent content={content} isStreaming={isStreaming} />
          )}
        </div>
        <div
          className={`mt-1 text-[11px] text-zinc-500 ${isUser ? "text-right" : "text-left"}`}
        >
          {formatTime(timestampISO)}
        </div>
      </div>
    </div>
  );
}
