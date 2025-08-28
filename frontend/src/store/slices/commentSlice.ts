import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";

const commentSlice = createSlice({
  name: "comment",
  initialState: {
    loading: false,
    comments: [],
    error: null,
    message: null,
  },
  reducers: {
    getCommentRequest(state){
        state.loading = true;
        state.comments = [];
        state.error = null;
    },
    getCommentSuccess(state, action){
        state.loading = false;
        state.comments = action.payload;
        state.error = null;
    },
    getCommentFailed(state, action){
        state.loading = false;
        state.comments = state.comments;
        state.error = action.payload;
    },
    deleteCommentRequest(state){
        state.message = null;
        state.loading = true;
        state.error = null;
    },
    deleteCommentSuccess(state, action){
        state.loading = false;
        state.message = action.payload;
        state.error = null;
    },
    deleteCommentFailed(state, action){
        state.loading = false;
        state.message = null;
        state.error = action.payload;
    },
    addCommentRequest(state){
        state.message = null;
        state.loading = true;
        state.error = null;
    },
    addCommentSuccess(state, action){
        state.loading = false;
        state.message = action.payload;
        state.error = null;
    },
    addCommentFailed(state, action){
        state.loading = false;
        state.message = null;
        state.error = action.payload;
    },

    resetCommentSlice(state){
      state.error = null;
      state.comments = state.comments;
      state.message = null;
      state.loading = false;
    },

    clearAllErrors(state) {
      state.error = null;
      state.comments = state.comments;
    },
  }
});

export const addNewComment = (id: string, text: string, authorName: string) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(commentSlice.actions.addCommentRequest());
    try {
        const { data } = await axios.post(`http://localhost:4000/v.1/api/comment/add/${id}`, {
            text, authorName
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