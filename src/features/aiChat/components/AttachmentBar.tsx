import type { Attachment } from "../hooks/useReceiptAttachments";
import AttachmentBubble from "./AttachmentBubble";

type Props = {
  attachments: Attachment[];
  onRemove: (id: string) => void;
};

export default function AttachmentBar({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto border-t border-white/5 bg-zinc-950 px-4 pt-2 pb-1">
      {attachments.map((att) => (
        <AttachmentBubble key={att.id} attachment={att} onRemove={onRemove} />
      ))}
    </div>
  );
}
