import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import UpdateProfile from "./pages/UpdateProfile";
import UpdatePassword from "./pages/UpdatePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ViewPostComment from "./pages/ViewPostComment";
import Profile from "./pages/Profile";
import HomeFeed from "./pages/HomeFeed";
import Signup from "./pages/SignUp";
import AddPost from "./pages/AddPost";
import UpdatePost from "./pages/UpdatePost";
import Messages from "./pages/sub-components/Messages";
import Notifications from "./pages/sub-components/Notifications";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { useEffect } from "react";
import { clearAllUserErrors, getUser } from "./store/slices/userSlice";

import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const { error } = useSelector((state: RootState) => state.user);

  // Run once on app load
  useEffect(() => {
    console.log(import.meta.env.SERVER_URL);
    dispatch(getUser()); // check backend for logged-in user
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
  }, [error, dispatch]);

  return (
    <>
    
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/password/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset/password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Protected routes */}
          <Route path="/feed" element={<ProtectedRoute><HomeFeed /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/addPost" element={<ProtectedRoute><AddPost /></ProtectedRoute>} />
          <Route path="/view/post/:id" element={<ProtectedRoute><ViewPostComment /></ProtectedRoute>} />
          <Route path="/post/update/:id" element={<ProtectedRoute><UpdatePost /></ProtectedRoute>} />
          <Route path="/update/profile" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
          <Route path="/update/password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
        </Routes>
      </Router>

      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}

export default App;
