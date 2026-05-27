import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  backendApi,
  type ApiError,
  type ChatMessage,
  type Conversation,
} from "../../shared/services/backendApi";

export type StreamStatus = "idle" | "thinking" | "responding" | "tool_executing";

export type AiChatState = {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: ChatMessage[];
  streamStatus: StreamStatus;
  streamingText: string;
  errorConversations: string | null;
  errorChat: string | null;
};

const initialState: AiChatState = {
  conversations: [],
  currentConversationId: null,
  messages: [],
  streamStatus: "idle",
  streamingText: "",
  errorConversations: null,
  errorChat: null,
};

export const loadConversations = createAsyncThunk(
  "aiChat/loadConversations",
  async () => {
    try {
      return await backendApi.ai.getConversations();
    } catch {
      return [];
    }
  },
);

export const loadConversation = createAsyncThunk(
  "aiChat/loadConversation",
  async (id: string, api) => {
    try {
      return await backendApi.ai.getConversation(id);
    } catch (e) {
      const err = e as ApiError;
      return api.rejectWithValue(err.message);
    }
  },
);

export const renameConversation = createAsyncThunk(
  "aiChat/renameConversation",
  async (input: { id: string; title: string }, api) => {
    try {
      return await backendApi.ai.renameConversation(input.id, input.title);
    } catch (e) {
      const err = e as ApiError;
      return api.rejectWithValue(err.message);
    }
  },
);

export const deleteConversation = createAsyncThunk(
  "aiChat/deleteConversation",
  async (id: string, api) => {
    try {
      await backendApi.ai.deleteConversation(id);
      return id;
    } catch (e) {
      const err = e as ApiError;
      return api.rejectWithValue(err.message);
    }
  },
);

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    newChat(state) {
      state.currentConversationId = null;
      state.messages = [];
      state.streamStatus = "idle";
      state.streamingText = "";
      state.errorChat = null;
    },

    clearError(state) {
      state.errorChat = null;
      state.errorConversations = null;
    },

    appendUserMessage(state, action: PayloadAction<{ content: string }>) {
      state.messages.push({
        role: "user",
        content: action.payload.content,
        timestampISO: new Date().toISOString(),
      });
    },

    startStreaming(state) {
      state.streamStatus = "thinking";
      state.streamingText = "";
      state.errorChat = null;
    },

    setStreamStatus(state, action: PayloadAction<StreamStatus>) {
      state.streamStatus = action.payload;
    },

    appendStreamChunk(state, action: PayloadAction<string>) {
      state.streamingText += action.payload;
    },

    finishStreaming(state, action: PayloadAction<{ conversationId: string }>) {
      if (state.streamingText) {
        state.messages.push({
          role: "assistant",
          content: state.streamingText,
          timestampISO: new Date().toISOString(),
        });
      }
      state.currentConversationId = action.payload.conversationId;
      state.streamStatus = "idle";
      state.streamingText = "";
    },

    cancelStreaming(state, action: PayloadAction<{ conversationId: string }>) {
      if (state.streamingText) {
        state.messages.push({
          role: "assistant",
          content: state.streamingText,
          timestampISO: new Date().toISOString(),
        });
      }
      state.currentConversationId = action.payload.conversationId;
      state.streamStatus = "idle";
      state.streamingText = "";
    },

    streamError(state, action: PayloadAction<string>) {
      state.streamStatus = "idle";
      state.streamingText = "";
      state.errorChat = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(loadConversations.fulfilled, (state, action) => {
      state.conversations = action.payload;
      state.errorConversations = null;
    });
    builder.addCase(loadConversations.rejected, (state) => {
      state.errorConversations = "Failed to load conversations";
    });

    builder.addCase(loadConversation.pending, (state) => {
      state.streamStatus = "idle";
      state.streamingText = "";
      state.errorChat = null;
    });
    builder.addCase(loadConversation.fulfilled, (state, action) => {
      state.currentConversationId = action.payload.id;
      state.messages = action.payload.messages;
    });
    builder.addCase(loadConversation.rejected, (state, action) => {
      state.errorChat =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to load conversation";
    });

    builder.addCase(renameConversation.fulfilled, (state, action) => {
      const idx = state.conversations.findIndex(
        (c) => c.id === action.meta.arg.id,
      );
      if (idx !== -1) {
        state.conversations[idx] = {
          ...state.conversations[idx],
          title: action.payload.title,
        };
      }
    });

    builder.addCase(deleteConversation.pending, (state, action) => {
      state.conversations = state.conversations.filter(
        (c) => c.id !== action.meta.arg,
      );
    });
    builder.addCase(deleteConversation.fulfilled, (state, action) => {
      if (state.currentConversationId === action.payload) {
        state.currentConversationId = null;
        state.messages = [];
        state.streamStatus = "idle";
        state.streamingText = "";
        state.errorChat = null;
      }
    });
  },
});

export const {
  newChat,
  clearError,
  appendUserMessage,
  startStreaming,
  setStreamStatus,
  appendStreamChunk,
  finishStreaming,
  cancelStreaming,
  streamError,
} = aiChatSlice.actions;
export default aiChatSlice.reducer;
