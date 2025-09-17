import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";
import type { Conversation, Message } from "../../types/message";

const app_url = import.meta.env.VITE_SERVER_URL || "";

interface MessageState {
  messageLoading: boolean;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messageError: string | null;
  messageStatus: string | null;
}

const initialState: MessageState = {
  messageLoading: false,
  conversations: [],
  selectedConversation: null,
  messageError: null,
  messageStatus: null,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    // Fetch Conversations
    getConversationsRequest(state) {
      state.messageLoading = true;
      state.conversations = [];
      state.messageError = null;
    },
    getConversationsSuccess(state, action) {
      state.messageLoading = false;
      state.conversations = action.payload;
      state.messageError = null;
    },
    getConversationsFailed(state, action) {
      state.messageLoading = false;
      state.conversations = state.conversations;
      state.messageError = action.payload;
    },

    // Select Conversation
    selectConversation(state, action) {
      state.selectedConversation = action.payload;
    },

    // Send Message
    sendMessageRequest(state) {
      state.messageLoading = true;
      state.messageError = null;
      state.messageStatus = null;
    },
    sendMessageSuccess(state, action) {
      state.messageLoading = false;
      state.messageStatus = action.payload; // e.g., "Message sent"
      state.messageError = null;
      if (state.selectedConversation) {
        state.selectedConversation.messages.push(action.payload);
      }
    },
    sendMessageFailed(state, action) {
      state.messageLoading = false;
      state.messageError = action.payload;
      state.messageStatus = null;
    },

    // Receive Message (real-time via socket)
    receiveMessage(state, action) {
      const incoming: Message = action.payload;
      const conv = state.conversations.find(c => c.id === incoming.conversationId);
      if (conv) {
        conv.messages.push(incoming);
        conv.lastMessage = incoming;
        conv.lastMessageAt = incoming.createdAt;
      } else {
        // If conversation not found, optionally add new conversation placeholder
        state.conversations.unshift({
          id: incoming.conversationId,
          isGroup: false,
          createdAt: new Date().toISOString(),
          participants: [],
          messages: [incoming],
          lastMessage: incoming,
          lastMessageAt: incoming.createdAt,
        });
      }
      if (state.selectedConversation?.id === incoming.conversationId) {
        state.selectedConversation.messages.push(incoming);
      }
    },

    resetMessageSlice(state) {
      state.messageLoading = false;
      state.conversations = [];
      state.selectedConversation = null;
      state.messageError = null;
      state.messageStatus = null;
    },

    clearAllErrors(state) {
      state.messageError = null;
      state.messageStatus = null;
    },
  },
});

// Async Thunks

export const fetchConversations = () => async (dispatch: AppDispatch) => {
  dispatch(messageSlice.actions.getConversationsRequest());
  try {
    const { data } = await axios.get(`${app_url}/v.1/api/conversations`, {
      withCredentials: true,
    });
    dispatch(messageSlice.actions.getConversationsSuccess(data.conversations));
    dispatch(messageSlice.actions.clearAllErrors());
  } catch (error: any) {
    dispatch(messageSlice.actions.getConversationsFailed(error.response?.data?.message || "Failed to fetch conversations"));
  }
};

export const sendNewMessage = (conversationId: string, content: string) => async (dispatch: AppDispatch) => {
  dispatch(messageSlice.actions.sendMessageRequest());
  try {
    const { data } = await axios.post(
      `${app_url}/v.1/api/message/send`,
      { conversationId, content },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
    dispatch(messageSlice.actions.sendMessageSuccess(data.message));
    dispatch(messageSlice.actions.clearAllErrors());
  } catch (error: any) {
    dispatch(messageSlice.actions.sendMessageFailed(error.response?.data?.message || "Failed to send message"));
  }
};

export const createConversation = (participantIds: string[]) => async (dispatch: AppDispatch, getState: () => any) => {
  try {
    const { data } = await axios.post(
      `${app_url}/v.1/api/conversations`,
      { participantIds },
      { withCredentials: true }
    );

    // Select the newly created conversation
    dispatch(selectConversation(data.conversation));

    // Add to existing conversations
    const { conversations } = getState().message;
    dispatch(messageSlice.actions.getConversationsSuccess([
      data.conversation,
      ...conversations
    ]));

  } catch (error: any) {
    dispatch(messageSlice.actions.getConversationsFailed(
      error.response?.data?.message || "Failed to create conversation"
    ));
  }
};




// Slice Exports
export const { selectConversation, receiveMessage, resetMessageSlice, clearAllErrors } = messageSlice.actions;

export default messageSlice.reducer;
