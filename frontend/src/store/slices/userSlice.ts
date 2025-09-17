import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";

const app_url = import.meta.env.VITE_SERVER_URL || "";

interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatarId?: string;
  avatarUrl?: string;
}

interface UserState {
  loading: boolean;
  user: Partial<User>;   // ✅ allows empty {} initially
  isAuthenticated: boolean;
  error: string | null;
  message: string | null;
  isUpdated: boolean;
}

const initialState: UserState = {
  loading: false,
  user: {},              // empty at start but typed as Partial<User>
  isAuthenticated: false,
  error: null,
  message: null,
  isUpdated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signUpRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    signUpSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    signUpFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },
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
      state.message = action.payload.message;
      state.user = action.payload.user;
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

export const signUp = (username:string, email: String, password: String) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(userSlice.actions.signUpRequest());
    try {
      
        const { data } = await axios.post(`${app_url}/v.1/api/user/signup`,
            {username, email, password},
            {
                'withCredentials': true,
                headers: {'Content-Type': 'application/json'}
            }
        );
        dispatch(userSlice.actions.signUpSuccess(data.user));
        dispatch(userSlice.actions.clearAllErrors());
    } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Something went wrong.";
        dispatch(userSlice.actions.signUpFailed(errorMessage));
    }
}

export const login = (email: String, password: String) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(userSlice.actions.loginRequest());
    try {
        const { data } = await axios.post(`${app_url}/v.1/api/user/login`,
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
      `${app_url}/v.1/api/user/logout`,
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
    const { data } = await axios.get(`${app_url}/v.1/api/user/me`, {
      withCredentials: true,
    });
    dispatch(userSlice.actions.loadUserSuccess(data.user));
    dispatch(userSlice.actions.clearAllErrors());
  } catch (error: any) {
    dispatch(userSlice.actions.loadUserFailed(error.response.data.message));
  }
};

// export const getUserById = (userId: string) => async (dispatch: AppDispatch): Promise<void> => {
//   dispatch(userSlice.actions.loadUserRequest());
//   try {
//     const { data } = await axios.get(`${app_url}/v.1/api/user/me`, {
//       withCredentials: true,
//     });
//     dispatch(userSlice.actions.loadUserSuccess(data.user));
//     dispatch(userSlice.actions.clearAllErrors());
//   } catch (error: any) {
//     dispatch(userSlice.actions.loadUserFailed(error.response.data.message));
//   }
// };


export const updateProfile =
  (formData: FormData) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(userSlice.actions.updateProfileRequest());
    try {
      const { data } = await axios.put(
        `${app_url}/v.1/api/user/me/update`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(userSlice.actions.updateProfileSuccess(data));
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error: any) {
      dispatch(userSlice.actions.updateProfileFailed(error.response.data.message));
    }
  };

export const chnagePassword =
  (currentPassword: string, newPassword: string, confirmNewPassword: string) => async (dispatch: AppDispatch): Promise<void> => {
    dispatch(userSlice.actions.updatePasswordRequest())
    try {
        const {data} = await axios.put(`${app_url}/v.1/api/user/me/change-password`, {currentPassword, newPassword, confirmNewPassword},
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