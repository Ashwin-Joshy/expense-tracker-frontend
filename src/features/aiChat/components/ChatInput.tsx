import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import type { Attachment } from "../hooks/useReceiptAttachments";
import { MAX_ATTACHMENTS } from "../hooks/useReceiptAttachments";
import AttachmentBar from "./AttachmentBar";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE = 3 * 1024 * 1024;

type Props = {
  onSend: (message: string) => void;
  disabled: boolean;
  onCancel: () => void;
  isStreaming: boolean;
  onAttach?: (file: File) => void;
  attachments?: Attachment[];
  onRemoveAttachment?: (id: string) => void;
  isFull?: boolean;
};

function validateImage(file: File): string | null {
  const isAllowedType =
    ALLOWED_TYPES.includes(file.type) ||
    /\.(jpe?g|png|webp|heic)$/i.test(file.name);
  if (!isAllowedType) {
    return "Unsupported format. Use JPEG, PNG, WebP, or HEIC.";
  }
  if (file.size > MAX_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 3MB.`;
  }
  return null;
}

export default function ChatInput({
  onSend,
  disabled,
  onCancel,
  isStreaming,
  onAttach,
  attachments,
  onRemoveAttachment,
  isFull,
}: Props) {
  const [value, setValue] = useState("");
  const [attachError, setAttachError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const textarea = ref.current;
    if (!textarea || !onAttach) return;

    function handlePaste(e: ClipboardEvent) {
      const files = e.clipboardData?.files;
      if (!files?.length) return;
      const image = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (image) {
        e.preventDefault();
        processFile(image);
      }
    }

    textarea.addEventListener("paste", handlePaste);
    return () => textarea.removeEventListener("paste", handlePaste);
  }, [onAttach, isFull]);

  function showAttachError(msg: string) {
    setAttachError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setAttachError(null), 4000);
  }

  function processFile(file: File) {
    if (!onAttach) return;
    if (isFull) {
      showAttachError(`Maximum ${MAX_ATTACHMENTS} images allowed.`);
      return;
    }
    const error = validateImage(file);
    if (error) {
      showAttachError(error);
      return;
    }
    setAttachError(null);
    onAttach(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 128)}px`;
    }
  }

  const inputDisabled = disabled;
  const hasAttachments = attachments && attachments.length > 0;

  return (
    <div className="border-t border-white/5 bg-zinc-950">
      {hasAttachments && onRemoveAttachment && (
        <AttachmentBar
          attachments={attachments}
          onRemove={onRemoveAttachment}
        />
      )}
      {attachError && (
        <div className="mx-4 mt-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
          {attachError}
        </div>
      )}
      <div className="flex items-end gap-2 px-4 py-3">
        {onAttach && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={inputDisabled || isFull}
              title={
                isFull
                  ? `Maximum ${MAX_ATTACHMENTS} images`
                  : "Upload receipt image"
              }
              className="rounded-lg p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </>
        )}
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            isStreaming ? "AI is responding..." : "Ask about your finances..."
          }
          disabled={inputDisabled}
          className="flex-1 resize-none rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/40 focus:outline-none disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            onClick={onCancel}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
