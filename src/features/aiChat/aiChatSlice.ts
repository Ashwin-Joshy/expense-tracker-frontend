import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  backendApi,
  type ApiError,
  type ChatMessage,
  type Conversation,
} from "../../shared/services/backendApi";

export type AiChatState = {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  errorConversations: string | null;
  errorChat: string | null;
};

const initialState: AiChatState = {
  conversations: [],
  currentConversationId: null,
  messages: [],
  isLoading: false,
  errorConversations: null,
  errorChat: null,
};

export const sendMessage = createAsyncThunk(
  "aiChat/sendMessage",
  async (
    _input: { message: string },
    api,
  ) => {
    const state = (api.getState() as { aiChat: AiChatState }).aiChat;
    try {
      const res = await backendApi.ai.chat({
        message: _input.message,
        ...(state.currentConversationId
          ? { conversationId: state.currentConversationId }
          : {}),
      });
      return res;
    } catch (e) {
      const err = e as ApiError;
      return api.rejectWithValue(err.message);
    }
  },
);

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
      state.errorChat = null;
    },
    clearError(state) {
      state.errorChat = null;
      state.errorConversations = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => {
      state.isLoading = true;
      state.errorChat = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentConversationId = action.payload.conversationId;
      state.messages.push(action.payload.userMessage);
      state.messages.push(action.payload.assistantMessage);
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.isLoading = false;
      state.errorChat =
        typeof action.payload === "string"
          ? action.payload
          : "Failed to send message";
    });

    builder.addCase(loadConversations.fulfilled, (state, action) => {
      state.conversations = action.payload;
      state.errorConversations = null;
    });
    builder.addCase(loadConversations.rejected, (state) => {
      state.errorConversations = "Failed to load conversations";
    });

    builder.addCase(loadConversation.pending, (state) => {
      state.isLoading = true;
      state.errorChat = null;
    });
    builder.addCase(loadConversation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentConversationId = action.payload.id;
      state.messages = action.payload.messages;
    });
    builder.addCase(loadConversation.rejected, (state, action) => {
      state.isLoading = false;
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
        state.errorChat = null;
      }
    });
  },
});

export const { newChat, clearError } = aiChatSlice.actions;
export default aiChatSlice.reducer;
