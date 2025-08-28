import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    user: {},
    isAuthenticated: false,
    error: null,
    message: null,
    isUpdated: false,
  },
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },

    clearAllErrors(state) {
      state.error = null;
      state.user = state.user;
    },

    loadUserRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    loadUserSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loadUserFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },
    logoutSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
      state.message = action.payload;
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = state.isAuthenticated;
      state.user = state.user;
      state.error = action.payload;
    },
    updatePasswordRequest(state) {
      state.loading = true;
      state.isUpdated = false;
      state.message = null;
      state.error = null;
    },
    updatePasswordSuccess(state, action) {
      state.loading = false;
      state.isUpdated = true;
      state.message = action.payload;
      state.error = null;
    },
    updatePasswordFailed(state, action) {
      state.loading = false;
      state.isUpdated = false;
      state.message = null;
      state.error = action.payload;
    },
    updateProfileRequest(state) {
      state.loading = true;
      state.isUpdated = false;
      state.message = null;
      state.error = null;
    },
    updateProfileSuccess(state, action) {
      state.loading = false;
      state.isUpdated = true;
      state.message = action.payload;
      state.error = null;
    },
    updateProfileFailed(state, action) {
      state.loading = false;
      state.isUpdated = false;
      state.message = null;
      state.error = action.payload;
    },
    updateProfileResetAfterUpdate(state) {
      state.error = null;
      state.isUpdated = false;
      state.message = null;
    },
  },
});

export const login = (email: String, password: String) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(userSlice.actions.loginRequest());
    try {
        const { data } = await axios.post("http://localhost:4000/v.1/api/user/login",
            {email, password},
            {
                'withCredentials': true,
                headers: {'Content-Type': 'application/json'}
            }
        );
        dispatch(userSlice.actions.loginSuccess(data.user));
        dispatch(userSlice.actions.clearAllErrors());
    } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Something went wrong.";
        dispatch(userSlice.actions.loginFailed(errorMessage));
    }
}

export const logout = () => async (dispatch: AppDispatch): Promise<void> =>{
    try {
    const { data } = await axios.get(
      "http://localhost:4000/v.1/api/user/logout",
      {
        withCredentials: true
      }
    );
    dispatch(userSlice.actions.logoutSuccess(data.message));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error: any) {
    dispatch(userSlice.actions.logoutFailed(error.response.data.message));
  }
}

export const getUser = () => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(userSlice.actions.loadUserRequest());
  try {
    const { data } = await axios.get("http://localhost:4000/v.1/api/user/details", {
      withCredentials: true,
    });
    dispatch(userSlice.actions.loadUserSuccess(data.user));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error: any) {
    dispatch(userSlice.actions.loadUserFailed(error.response.data.message));
  }
};


export const updateProfile =
  (username: string, email: string, aboutMe: string) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(userSlice.actions.updateProfileRequest())
    try {
        const {data} = await axios.put("http://localhost:4000/v.1/api/user/update/me", {
            username, email, aboutMe
        },
           {
            withCredentials: true,
            headers: {"Content-Type": "multipart/form-data"}
           } 
        );
        dispatch(userSlice.actions.updateProfileSuccess(data.message));
        dispatch(userSlice.actions.clearAllErrors())

    } catch (error: any) {
        dispatch(userSlice.actions.updateProfileFailed(error.response.data.message));
    }
};

export const chnagePassword =
  (currentPassword: string, newPassword: string, confirmNewPassword: string) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(userSlice.actions.updatePasswordRequest())
    try {
        const {data} = await axios.put("http://localhost:4000/v.1/api/user/update/password", {currentPassword, newPassword, confirmNewPassword},
           {
            withCredentials: true,
            headers: {"Content-Type": "application/json"}
           } 
        );
        dispatch(userSlice.actions.updatePasswordSuccess(data.message));
        dispatch(userSlice.actions.clearAllErrors())

    } catch (error: any) {
        dispatch(userSlice.actions.updatePasswordFailed(error.response.data.message));
    }
  };

export const resetProfile = () =>  (dispatch: AppDispatch) =>{
    dispatch(userSlice.actions.updateProfileResetAfterUpdate());
}

export const clearAllUserErrors = () => (dispatch:AppDispatch) => {
  dispatch(userSlice.actions.clearAllErrors());
};

export default userSlice.reducer;