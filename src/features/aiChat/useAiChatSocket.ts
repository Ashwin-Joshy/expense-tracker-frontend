import { useCallback, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getAuthToken } from "../../shared/services/authToken";
import {
  startStreaming,
  setStreamStatus,
  appendStreamChunk,
  finishStreaming,
  cancelStreaming,
  streamError,
  loadConversations,
  type StreamStatus,
} from "./aiChatSlice";

function getSocketBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  const base = raw?.trim() ? raw.trim() : "http://localhost:3000/api";
  return base.replace(/\/api\/?$/, "");
}

export function useAiChatSocket() {
  const dispatch = useAppDispatch();
  const currentConversationId = useAppSelector(
    (s) => s.aiChat.currentConversationId,
  );
  const socketRef = useRef<Socket | null>(null);
  const conversationRef = useRef(currentConversationId);

  useEffect(() => {
    conversationRef.current = currentConversationId;
  }, [currentConversationId]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket = io(`${getSocketBaseUrl()}/ai`, {
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("ai:status", (payload: { type: StreamStatus }) => {
      dispatch(setStreamStatus(payload.type));
    });

    socket.on("ai:chunk", (payload: { text: string }) => {
      dispatch(appendStreamChunk(payload.text));
    });

    socket.on("ai:done", (payload: { conversationId: string }) => {
      dispatch(finishStreaming({ conversationId: payload.conversationId }));
      dispatch(loadConversations());
    });

    socket.on("ai:error", (payload: { message: string }) => {
      dispatch(streamError(payload.message));
    });

    socket.on("ai:cancelled", (payload: { conversationId: string }) => {
      dispatch(cancelStreaming({ conversationId: payload.conversationId }));
      dispatch(loadConversations());
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [dispatch]);

  const send = useCallback(
    (message: string) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        dispatch(streamError("Not connected. Please try again."));
        return;
      }
      dispatch(startStreaming());
      socket.emit("chat:send", {
        message,
        conversationId: conversationRef.current ?? undefined,
      });
    },
    [dispatch],
  );

  const cancel = useCallback(() => {
    const socket = socketRef.current;
    const cid = conversationRef.current;
    if (!socket?.connected || !cid) return;
    socket.emit("chat:cancel", { conversationId: cid });
  }, []);

  const isStreaming = useAppSelector(
    (s) => s.aiChat.streamStatus !== "idle",
  );

  return { send, cancel, isStreaming };
}
