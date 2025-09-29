import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";
import type { Conversation } from "../../types/message";

const app_url = import.meta.env.VITE_SERVER_URL || "";

interface ConversationState {
  conversationsLoading: boolean;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  conversationsError: string | null;
  conversationsStatus: string | null;
}

const initialState: ConversationState = {
  conversationsLoading: false,
  conversations: [],
  selectedConversation: null,
  conversationsError: null,
  conversationsStatus: null,
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    // Fetch Conversations
    getConversationsRequest(state) {
      state.conversationsLoading = true;
      state.conversations = [];
      state.conversationsError = null;
    },
    getConversationsSuccess(state, action) {
      state.conversationsLoading = false;
      state.conversations = action.payload;
      state.conversationsError = null;
    },
    getConversationsFailed(state, action) {
      state.conversationsLoading = false;
      state.conversationsError = action.payload;
      state.conversations = state.conversations;
    },

    // Select Conversation
    selectConversation(state, action) {
      state.selectedConversation = action.payload;
    },

    resetConversationsSlice(state) {
      state.conversationsLoading = false;
      state.conversations = state.conversations;
      state.selectedConversation = state.selectedConversation;
      state.conversationsError = null;
      state.conversationsStatus = null;
    },

    clearAllConversationsErrors(state) {
      state.conversationsError = null;
      state.conversationsStatus = null;
    },
  },
});

// Async Thunks

export const fetchConversations = () => async (dispatch: AppDispatch) => {
  dispatch(conversationSlice.actions.getConversationsRequest());
  try {
    const { data } = await axios.get(`${app_url}/v.1/api/conversations`, {
      withCredentials: true,
    });

    dispatch(
      conversationSlice.actions.getConversationsSuccess(data.conversations)
    );
    dispatch(conversationSlice.actions.clearAllConversationsErrors());
  } catch (error: any) {
    dispatch(
      conversationSlice.actions.getConversationsFailed(
        error.response?.data?.message || "Failed to fetch conversations"
      )
    );
  }
};

export const createConversation = (participantIds: string[]) =>
  async (dispatch: AppDispatch, getState: () => any) => {
    try {
      const { data } = await axios.post(`${app_url}/v.1/api/conversations`,
        { participantIds },
        { withCredentials: true }
      );

      dispatch(conversationSlice.actions.selectConversation(data.conversation));

      const { conversations } = getState().message;
      dispatch(conversationSlice.actions.getConversationsSuccess(
        [data.conversation, ...conversations,] )
      );
    } catch (error: any) {
      dispatch(conversationSlice.actions.getConversationsFailed(error.response?.data?.message || "Failed to create conversation"));
    }
  };

// Slice exports
export const {
  selectConversation,
  resetConversationsSlice,
  clearAllConversationsErrors,
} = conversationSlice.actions;

export default conversationSlice.reducer;
