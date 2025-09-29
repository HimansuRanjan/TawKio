import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";
import type { Conversation, Message } from "../../types/message";

const app_url = import.meta.env.VITE_SERVER_URL || "";

interface MessageState {
  messageLoading: boolean;
  messages: Message[];
  conversation: Conversation | null;
  messageError: string | null;
  messageStatus: string | null;
}

const initialState: MessageState = {
  messageLoading: false,
  messages: [],
  conversation: null,
  messageError: null,
  messageStatus: null,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    // Fetch All Messages for a Conversations
    getMessagesRequest(state) {
      state.messageLoading = true;
      state.messages = [];
      state.messageError = null;
    },
    getMessagesSuccess(state, action) {
      state.messageLoading = false;
      state.messages = action.payload;
      state.messageError = null;
      // If a conversation is selected and matches these messages' conversationId,
      // update conversation.messages as well.
      // if (state.conversation?.id) {
      //   // replace conversation.messages if the fetched messages belong to it
      //   // (we assume the API returned the messages for the selected conversation)
      //   state.conversation.messages = action.payload || [];
      // }
    },
    getMessagesFailed(state, action) {
      state.messageLoading = false;
      state.messageError = action.payload;
    },

    // Select Messages
    selectConversation(state, action) {
      state.conversation = action.payload;
      // Also set messages to conversation.messages if present
      state.messages = action.payload?.messages ? [...action.payload.messages] : [];
    },

    // Optimistic send (UI update before confirmation)
    sendMessageOptimistic(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },

    // Send Message (optimistic)
    sendMessageRequest(state) {
      state.messageLoading = true;
      state.messageError = null;
      state.messageStatus = null;
    },

    // sendMessageSuccess(state, action) {
    //   state.messageLoading = false;
    //   state.messageStatus = "Message sent";
    //   state.messageError = null;

    //   const msg: Message = action.payload;

    //   // Update selected conversation messages
    //   if (state.conversation?.id === msg.conversationId) {
    //     state.conversation.messages.push(msg);
    //   }

    //   // Update conversation list lastMessage
    //   const conv = state.conversations.find(c => c.id === msg.conversationId);
    //   if (conv) {
    //     conv.messages.push(msg);
    //     conv.lastMessage = msg;
    //     conv.lastMessageAt = msg.createdAt;
    //   } else {
    //     // If conversation not found, add placeholder
    //     state.conversations.unshift({
    //       id: msg.conversationId,
    //       isGroup: false,
    //       createdAt: new Date().toISOString(),
    //       participants: [],
    //       messages: [msg],
    //       lastMessage: msg,
    //       lastMessageAt: msg.createdAt,
    //     });
    //   }
    // },
    sendMessageFailed(state, action) {
      state.messageLoading = false;
      state.messageError = action.payload;
      state.messageStatus = null;
    },

    // // Receive real-time messages
    // receiveMessage(state, action) {
    //   const msg: Message = action.payload;

    //   // Update selected conversation if it matches
    //   if (state.conversation?.id === msg.conversationId) {
    //     state.conversation.messages.push(msg);
    //   }

    //   // Update conversation list
    //   const conv = state.conversations.find(c => c.id === msg.conversationId);
    //   if (conv) {
    //     conv.messages.push(msg);
    //     conv.lastMessage = msg;
    //     conv.lastMessageAt = msg.createdAt;
    //   } else {
    //     state.conversations.unshift({
    //       id: msg.conversationId,
    //       isGroup: false,
    //       createdAt: new Date().toISOString(),
    //       participants: [],
    //       messages: [msg],
    //       lastMessage: msg,
    //       lastMessageAt: msg.createdAt,
    //     });
    //   }
    // },

      // Receive new message via socket
    receiveMessage(state, action: PayloadAction<Message>) {
      const msg = action.payload;
      if (state.conversation?.id === msg.conversationId) {
        state.messages.push(msg);
      }
    },

    resetMessageSlice(state) {
      state.messageLoading = false;
      state.messages = [];
      state.conversation = null;
      state.messageError = null;
      state.messageStatus = null;
    },

    clearAllMessageErrors(state) {
      state.messageError = null;
      state.messageStatus = null;
    },
  },
});

// Async Thunks

// Load old messages via REST
export const fetchMessages =
  (conversationId: string) => async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.getMessagesRequest());
    try {
      const { data } = await axios.get(
        `${app_url}/v.1/api/messages/${conversationId}`,
        { withCredentials: true }
      );
      dispatch(messageSlice.actions.getMessagesSuccess(data.messages));
    } catch (error: any) {
      dispatch(
        messageSlice.actions.getMessagesFailed(
          error.response?.data?.message || "Failed to fetch messages"
        )
      );
    }
  };


// export const sendNewMessage =
//   (conversationId: string, content: string) => async (dispatch: AppDispatch) => {
//     dispatch(messageSlice.actions.sendMessageRequest());
//     try {
//       const { data } = await axios.post(
//         `${app_url}/v.1/api/message/send`,
//         { conversationId, content },
//         { withCredentials: true, headers: { "Content-Type": "application/json" } }
//       );
//       dispatch(messageSlice.actions.sendMessageSuccess(data.message));
//       dispatch(messageSlice.actions.clearAllMessageErrors());
//     } catch (error: any) {
//       dispatch(
//         messageSlice.actions.sendMessageFailed(
//           error.response?.data?.message || "Failed to send message"
//         )
//       );
//     }
//   };



// Slice exports
export const {
  selectConversation,
  receiveMessage,
  resetMessageSlice,
  clearAllMessageErrors,
} = messageSlice.actions;

export default messageSlice.reducer;
