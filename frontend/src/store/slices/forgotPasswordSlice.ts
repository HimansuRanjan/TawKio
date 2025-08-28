import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { AppDispatch } from "../store";


const forgotPasswordSlice = createSlice({
    name: "forgotPassword",
    initialState:{
        loading: false,
        message: null,
        error: null
    },
    reducers:{
        forgotPasswordRequest(state){
            state.loading = true;
            state.message = null;
            state.error = null;
        },
        forgotPasswordSuccess(state, action){
            state.loading = false;
            state.message = action.payload;
            state.error = null;
        },
        forgotPasswordFailed(state, action){
            state.loading = false;
            state.message = null;
            state.error = action.payload;
        },
        resetPasswordRequest(state){
            state.loading = true;
            state.message = null;
            state.error = null;
        },
        resetPasswordSuccess(state, action){
            state.loading = false;
            state.message = action.payload;
            state.error = null;
        },
        resetPasswordFailed(state, action){
            state.loading = false;
            state.message = null;
            state.error = action.payload;
        },
        clearAllErrors(state){
            state.error = null;
        }
        
    }
});

export const forgotPassword = (email: string) => async (dispatch: AppDispatch): Promise<void>=>{
    dispatch(forgotPasswordSlice.actions.forgotPasswordRequest());
    try {
        const {data} = await axios.post("http://localhost:4000/v.1/api/user/forgot/password", {
            email,
        },
    {
        withCredentials: true,
        headers: {'Content-Type': "application/json"}
    })

    dispatch(forgotPasswordSlice.actions.forgotPasswordSuccess(data.message));
    dispatch(forgotPasswordSlice.actions.clearAllErrors());
    } catch (error: any) {
        dispatch(forgotPasswordSlice.actions.forgotPasswordFailed(error.response.data.message));
    }
};

export const resetPassword = (token: string | undefined, password: string, confirmPassword: string) => async (dispatch: AppDispatch): Promise<void> => {
    if(!token) {
        dispatch(forgotPasswordSlice.actions.resetPasswordFailed("Token is missing"));
        return;
    }
    
    dispatch(forgotPasswordSlice.actions.resetPasswordRequest());
    try {
        const { data } = await axios.put(`http://localhost:4000/v.1/api/user/reset/password/${token}`, {password, confirmPassword},{
            withCredentials: true,
            headers: {"Content-Type": "application/json"}
        });

    dispatch(forgotPasswordSlice.actions.resetPasswordSuccess(data.message));
    dispatch(forgotPasswordSlice.actions.clearAllErrors());  
    } catch (error: any) {
    dispatch(forgotPasswordSlice.actions.resetPasswordFailed(error.response.data.message));    
    }
};

export const clearAllForgotPasswordErrors = () => (dispatch: AppDispatch) => {
  dispatch(forgotPasswordSlice.actions.clearAllErrors());
};

export default forgotPasswordSlice.reducer;