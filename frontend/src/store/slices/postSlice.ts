import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";
import { Post } from "@/types/posts";

interface PostState {
  loading: boolean;
  posts: Post[]; // ✅ typed array
  postError: string | null;
  message: string | null;
  nextCursor: string | null;
}

const initialState: PostState = {
  loading: false,
  posts: [],
  postError: null,
  message: null,
  nextCursor: null,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
     // request may or may not include a cursor
    getAllPostRequest(state, action: PayloadAction<{ cursor?: string } | undefined>) {
      state.loading = true;
      state.postError = null;

      if (!action?.payload?.cursor) {
        state.posts = [];
      }
    },

    // success handles cursor-pagination OR single post
    getAllPostSuccess(
      state,
      action: PayloadAction<{ posts: Post[]; cursor?: string }>
    ) {
      const { posts, cursor } = action.payload;

      if (cursor) {
        const existingIds = new Set(state.posts.map((p) => p.id));
        const newPosts = posts.filter((p) => !existingIds.has(p.id));
        state.posts = [...state.posts, ...newPosts];
      } else {
        state.posts = posts;
      }

      state.loading = false;
      state.postError = null;
    },

    getAllPostFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.postError = action.payload;
    },

    setNextCursor(state, action: PayloadAction<string | null>) {
      state.nextCursor = action.payload;
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
      state.message = null;
      state.loading = false;
    },
  },
});

export const addNewPost =
  (formData: FormData) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.addPostRequest());
    try {
      const { data } = await axios.post(
        "https://tawkio-backend.onrender.com/v.1/api/post/new",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(postSlice.actions.addPostSuccess(data.message));
      dispatch(postSlice.actions.clearAllErrors());
    } catch (error: any) {
      dispatch(postSlice.actions.addPostFailed(error.response.data.message));
    }
  };

// export const getAllPosts =
//   (pageToLoad: number, limit: number) =>
//   async (dispatch: AppDispatch): Promise<void> => {
//     dispatch(postSlice.actions.getAllPostRequest());
//     try {
//       const { data } = await axios.get(
//         "https://tawkio-backend.onrender.com/v.1/api/post/get/all",
//         {
//           params: { page: pageToLoad, limit },
//           withCredentials: true,
//         }
//       );

//       dispatch(postSlice.actions.getAllPostSuccess(data.projects));
//       dispatch(postSlice.actions.clearAllErrors());
//     } catch (error: any) {
//       dispatch(postSlice.actions.getAllPostFailed(error.response.data.message));
//     }
//   };

// CURSOR-BASED PAGINATION

export const getAllPosts =
  (cursor?: string, limit: number = 5) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.getAllPostRequest({ cursor }));

    try {
      const { data } = await axios.get("https://tawkio-backend.onrender.com/v.1/api/post/all", {
        params: { cursor, limit },
        withCredentials: true,
      });

      dispatch(
        postSlice.actions.getAllPostSuccess({
          posts: data.posts,
          cursor,
        })
      );

      dispatch(postSlice.actions.setNextCursor(data.nextCursor || null));
      dispatch(postSlice.actions.clearAllErrors());
    } catch (error: any) {
      dispatch(
        postSlice.actions.getAllPostFailed(error.response?.data?.message)
      );
    }
  };

export const getPostsByUser = (id:string) => async (dispatch:AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.getAllPostRequest(undefined));
    try {
        const { data } = await axios.get(`https://tawkio-backend.onrender.com/v.1/api/post/user/${id}`,
        {
            // params: { page: pageToLoad, limit },
            withCredentials: true
        });

    dispatch(postSlice.actions.getAllPostSuccess({
          posts: data.posts, // wrap single post into array
        }));
    dispatch(postSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(postSlice.actions.getAllPostFailed(error.response.data.message));    
    }
};

export const getPostsById =
  (id: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.getAllPostRequest(undefined));
    try {
      const { data } = await axios.get(
        `https://tawkio-backend.onrender.com/v.1/api/post/${id}`,
        { withCredentials: true }
      );

      dispatch(
        postSlice.actions.getAllPostSuccess({
          posts: [data.post], // wrap single post into array
        })
      );

      dispatch(postSlice.actions.clearAllErrors());
    } catch (error: any) {
      dispatch(postSlice.actions.getAllPostFailed(error.response.data.message));
    }
  };

export const updatePost =
  (formData: FormData, id: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.updatePostRequest());
    try {
      const { data } = await axios.put(
        `https://tawkio-backend.onrender.com/v.1/api/post/${id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(postSlice.actions.updatePostSuccess(data.message));
      dispatch(postSlice.actions.clearAllErrors());
    } catch (error: any) {
      dispatch(postSlice.actions.updatePostFailed(error.response.data.message));
    }
  };

export const deletePost =
  (id: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.deletePostRequest());
    try {
      const { data } = await axios.delete(
        `https://tawkio-backend.onrender.com/v.1/api/post/${id}`,
        {
          withCredentials: true,
        }
      );

      dispatch(postSlice.actions.deletePostSuccess(data.message));
      dispatch(postSlice.actions.clearAllErrors());
    } catch (error: any) {
      dispatch(postSlice.actions.deletePostFailed(error.response.data.message));
    }
  };

export const likePost =
  (id: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(postSlice.actions.likePostRequest());
    try {
      const { data } = await axios.post(
        `https://tawkio-backend.onrender.com/v.1/api/like/post/${id}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Hit ");
      dispatch(postSlice.actions.likePostSuccess(data.message));
      dispatch(postSlice.actions.clearAllErrors());
    } catch (error: any) {
      dispatch(postSlice.actions.likePostFailed(error.response.data.message));
    }
  };

export const resetPostSlice = () => (dispatch: AppDispatch) => {
  dispatch(postSlice.actions.resetPostSlice());
};

export const clearAllPostErrors = () => (dispatch: AppDispatch) => {
  dispatch(postSlice.actions.clearAllErrors());
};

export default postSlice.reducer;
