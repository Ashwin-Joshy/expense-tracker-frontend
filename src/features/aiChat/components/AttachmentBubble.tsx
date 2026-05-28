import type { Attachment } from "../hooks/useReceiptAttachments";

type Props = {
  attachment: Attachment;
  onRemove: (id: string) => void;
};

export default function AttachmentBubble({ attachment, onRemove }: Props) {
  const { id, objectUrl, fileName, status, error } = attachment;

  return (
    <div className="group relative shrink-0">
      <div
        className={`relative h-14 w-14 overflow-hidden rounded-lg border ${
          status === "error"
            ? "border-rose-500/40"
            : "border-white/10"
        }`}
      >
        <img
          src={objectUrl}
          alt={fileName}
          className="h-full w-full object-cover"
        />
        {status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
        )}
        {status === "ready" && (
          <div className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-2.5 w-2.5 text-white"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-rose-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(id)}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-zinc-100 transition-opacity"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {status === "error" && error && (
        <div className="absolute -bottom-1 left-0 right-0 truncate rounded bg-rose-900/90 px-1 py-0.5 text-[10px] text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
