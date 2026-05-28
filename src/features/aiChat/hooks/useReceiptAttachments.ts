import { useCallback, useRef, useState } from "react";
import {
  backendApi,
  type ReceiptItem,
} from "../../../shared/services/backendApi";

export const MAX_ATTACHMENTS = 5;

export type Attachment = {
  id: string;
  objectUrl: string;
  fileName: string;
  status: "uploading" | "ready" | "error";
  receiptData?: ReceiptItem[];
  error?: string;
};

export function useReceiptAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const nextId = useRef(0);

  const add = useCallback((file: File) => {
    const id = `att-${nextId.current++}`;
    const objectUrl = URL.createObjectURL(file);

    setAttachments((prev) => [
      ...prev,
      { id, objectUrl, fileName: file.name, status: "uploading" },
    ]);

    backendApi.ai
      .uploadReceipt(file)
      .then((res) => {
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "ready" as const, receiptData: res.items }
              : a,
          ),
        );
      })
      .catch((err: Error) => {
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "error" as const, error: err.message }
              : a,
          ),
        );
      });
  }, []);

  const remove = useCallback((id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att) URL.revokeObjectURL(att.objectUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((a) => URL.revokeObjectURL(a.objectUrl));
      return [];
    });
  }, []);

  const readyCount = attachments.filter((a) => a.status === "ready").length;
  const isFull = attachments.length >= MAX_ATTACHMENTS;

  const formatReceiptContext = useCallback((): string | null => {
    const ready = attachments.filter(
      (a): a is Attachment & { receiptData: ReceiptItem[] } =>
        a.status === "ready" && !!a.receiptData && a.receiptData.length > 0,
    );
    if (ready.length === 0) return null;

    const blocks = ready.map((a, i) => {
      const lines = a.receiptData.map(
        (item) =>
          `- ${item.title}: $${item.amount.toFixed(2)} (${item.category}, ${item.dateISO})${item.note ? ` [${item.note}]` : ""}`,
      );
      return `[Receipt ${i + 1} - ${a.receiptData.length} item${a.receiptData.length !== 1 ? "s" : ""}]\n${lines.join("\n")}`;
    });

    return blocks.join("\n\n");
  }, [attachments]);

  return {
    attachments,
    add,
    remove,
    clear,
    readyCount,
    isFull,
    formatReceiptContext,
  };
}
