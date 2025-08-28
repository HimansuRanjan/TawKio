import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";

const postSlice = createSlice({
  name: "post",
  initialState: {
    loading: false,
    posts: [],
    postError: null,
    message: null,
  },
  reducers: {
    getAllPostRequest(state) {
      state.loading = true;
      state.posts = [];
      state.postError = null;
    },
    getAllPostSuccess(state, action) {
      state.posts = action.payload;
      state.loading = false;
      state.postError = null;
    },
    getAllPostFailed(state, action) {
      state.posts = state.posts;
      state.loading = false;
      state.postError = action.payload;
    },
    deletePostRequest(state) {
      state.message = null;
      state.loading = true;
      state.postError = null;
    },
    deletePostSuccess(state, action) {
      state.message = action.payload;
      state.loading = false;
      state.postError = null;
    },
    deletePostFailed(state, action) {
      state.message = null;
      state.loading = false;
      state.postError = action.payload;
    },
    updatePostRequest(state) {
      state.message = null;
      state.loading = true;
      state.postError = null;
    },
    updatePostSuccess(state, action) {
      state.message = action.payload;
      state.loading = false;
      state.postError = null;
    },
    updatePostFailed(state, action) {
      state.message = null;
      state.loading = false;
      state.postError = action.payload;
    },
    addPostRequest(state) {
      state.message = null;
      state.loading = true;
      state.postError = null;
    },
    addPostSuccess(state, action) {
      state.message = action.payload;
      state.loading = false;
      state.postError = null;
    },
    addPostFailed(state, action) {
      state.message = null;
      state.loading = false;
      state.postError = action.payload;
    },
    resetPostSlice(state) {
      state.postError = null;
      state.posts = state.posts;
      state.message = null;
      state.loading = false;
    },
    likePostRequest(state) {
      state.message = null;
      state.loading = true;
      state.postError = null;
    },
    likePostSuccess(state, action) {
      state.message = action.payload;
      state.loading = false;
      state.postError = null;
    },
    likePostFailed(state, action) {
      state.message = null;
      state.loading = false;
      state.postError = action.payload;
    },
    clearAllErrors(state) {
      state.postError = null;
      state.posts = state.posts;
    },
  },
});

export const addNewPost = (title: string, content: JSON) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.addPostRequest());
    try {
        const { data } = await axios.post("http://localhost:4000/v.1/api/post/create", {
            title, content
        },
        {
            withCredentials: true,
            headers: {'Content-Type': "multipart/form-data"}
        });

    dispatch(postSlice.actions.addPostSuccess(data.message));
    dispatch(postSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(postSlice.actions.addPostFailed(error.response.data.message));    
    }
};


export const getAllPosts = (pageToLoad: number, limit: number) => async (dispatch:AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.getAllPostRequest());
    try {
        const { data } = await axios.get("http://localhost:4000/v.1/api/post/get/all",
        {
            params: { page: pageToLoad, limit },
            withCredentials: true
        });

    dispatch(postSlice.actions.getAllPostSuccess(data.projects));
    dispatch(postSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(postSlice.actions.getAllPostFailed(error.response.data.message));    
    }
};

export const updatePost = (id: string, title: string, content: JSON) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.updatePostRequest());
    try {
        const { data } = await axios.put(`http://localhost:4000/v.1/api/post/update/${id}`,{
            title,
            content,
        },
        {
            withCredentials: true,
            headers: {'Content-Type': 'multipart/form-data'}
        });

    dispatch(postSlice.actions.updatePostSuccess(data.message));
    dispatch(postSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(postSlice.actions.updatePostFailed(error.response.data.message));    
    }
};

export const deletePost = (id:string) => async (dispatch: AppDispatch):Promise<void> => {
    dispatch(postSlice.actions.deletePostRequest());
    try {
        const { data } = await axios.delete(`http://localhost:4000/v.1/api/post/delete/${id}`,
        {
            withCredentials: true
        });

    dispatch(postSlice.actions.deletePostSuccess(data.message));
    dispatch(postSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(postSlice.actions.deletePostFailed(error.response.data.message));    
    }
};

export const likePost = (id:string) => async (dispatch: AppDispatch):Promise<void> => {
    dispatch(postSlice.actions.likePostRequest());
    try {
        const { data } = await axios.put(`http://localhost:4000/v.1/api/post/like/${id}`,
        {
            withCredentials: true,
            headers: {'Content-Type': "application/json"}
        });

    dispatch(postSlice.actions.likePostSuccess(data.message));
    dispatch(postSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(postSlice.actions.likePostFailed(error.response.data.message));    
    }
};


export const resetPostSlice = () => (dispatch: AppDispatch) => {
    dispatch(postSlice.actions.resetPostSlice());
}

export const clearAllPostErrors = () => (dispatch: AppDispatch) => {
    dispatch(postSlice.actions.clearAllErrors());
}

export default postSlice.reducer;