import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";
import { Comment } from "@/types/comment";

interface CommentState {
  commentLoading: boolean;
  comments: Comment[];  // ✅ typed array
  commentError: string | null;
  commentMessage: string | null;
}

const initialState: CommentState = {
  commentLoading: false,
  comments: [],
  commentError: null,
  commentMessage: null,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    getCommentRequest(state){
        state.commentLoading = true;
        state.comments = [];
        state.commentError = null;
    },
    getCommentSuccess(state, action){
        state.commentLoading = false;
        state.comments = action.payload;
        state.commentError = null;
    },
    getCommentFailed(state, action){
        state.commentLoading = false;
        state.comments = state.comments;
        state.commentError = action.payload;
    },
    deleteCommentRequest(state){
        state.commentMessage = null;
        state.commentLoading = true;
        state.commentError = null;
    },
    deleteCommentSuccess(state, action){
        state.commentLoading = false;
        state.commentMessage = action.payload;
        state.commentError = null;
    },
    deleteCommentFailed(state, action){
        state.commentLoading = false;
        state.commentMessage = null;
        state.commentError = action.payload;
    },
    addCommentRequest(state){
        state.commentMessage = null;
        state.commentLoading = true;
        state.commentError = null;
    },
    addCommentSuccess(state, action){
        state.commentLoading = false;
        state.commentMessage = action.payload;
        state.commentError = null;
    },
    addCommentFailed(state, action){
        state.commentLoading = false;
        state.commentMessage = null;
        state.commentError = action.payload;
    },

    resetCommentSlice(state){
      state.commentError = null;
      state.comments = state.comments;
      state.commentMessage = null;
      state.commentLoading = false;
    },

    clearAllErrors(state) {
      state.commentError = null;
      state.comments = state.comments;
    },
  }
});

export const addNewComment = (postId: string, content: string) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(commentSlice.actions.addCommentRequest());
    try {
        const { data } = await axios.post(`http://localhost:4000/v.1/api/comment/posts/${postId}/comments`, {
            content
        },
        {
            withCredentials: true,
            headers: {'Content-Type': "application/json"}
        });

    dispatch(commentSlice.actions.addCommentSuccess(data.message));
    dispatch(commentSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(commentSlice.actions.addCommentFailed(error.response.data.message));    
    }
};

export const getComments = (id: string) => async (dispatch:AppDispatch): Promise<void> => {
    dispatch(commentSlice.actions.getCommentRequest());
    try {
        const { data } = await axios.get(`http://localhost:4000/v.1/api/comment/get/all/${id}`,
        {
            withCredentials: true
        });

    dispatch(commentSlice.actions.getCommentSuccess(data.comments));
    dispatch(commentSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(commentSlice.actions.getCommentFailed(error.response.data.message));    
    }
};

export const deleteComment = (id:string) => async (dispatch: AppDispatch):Promise<void> => {
    dispatch(commentSlice.actions.deleteCommentRequest());
    try {
        const { data } = await axios.delete(`http://localhost:4000/v.1/api/comment/delete/${id}`,
        {
            withCredentials: true
        });

    dispatch(commentSlice.actions.deleteCommentSuccess(data.message));
    dispatch(commentSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(commentSlice.actions.deleteCommentFailed(error.response.data.message));    
    }
};

export const resetPostSlice = () => (dispatch: AppDispatch) => {
    dispatch(commentSlice.actions.resetCommentSlice());
}

export const clearAllCommentErrors = () => (dispatch: AppDispatch) => {
    dispatch(commentSlice.actions.clearAllErrors());
}

export default commentSlice.reducer