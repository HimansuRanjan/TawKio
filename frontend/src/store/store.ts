import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"
import postReducer from "./slices/postSlice"
import commentReducer from "./slices/commentSlice"
import forgotPasswordReducer from "./slices/forgotPasswordSlice"
import messageReducer from "./slices/messageSlice"
import conversationReducer from "./slices/conversationSlice"

export const store = configureStore({
    reducer:{
        user: userReducer,
        post: postReducer,
        comment: commentReducer,
        forgotPassword: forgotPasswordReducer,
        message: messageReducer,
        conversation: conversationReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch