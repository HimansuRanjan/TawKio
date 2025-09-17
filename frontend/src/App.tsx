import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomeFeed from "./pages/HomeFeed";
import Profile from "./pages/Profile";
import Messages from "./pages/sub-components/Messages";
import ChatWindow from "./pages/sub-components/ChatWindow";
import Notifications from "./pages/sub-components/Notifications";
import OtherProfile from "./pages/sub-components/OtherProfile";
import AddPost from "./pages/AddPost";
import UpdatePost from "./pages/UpdatePost";
import ViewPostComment from "./pages/ViewPostComment";
import UpdateProfile from "./pages/UpdateProfile";
import UpdatePassword from "./pages/UpdatePassword";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { useEffect } from "react";
import { clearAllUserErrors, getUser } from "./store/slices/userSlice";

import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import SocketListener from "./components/SocketListener";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.user);

  // Run once on app load to get user
  useEffect(() => {
    dispatch(getUser());
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
      {/* Socket listener mounted once */}
      <SocketListener />

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
          <Route path="/messages/:chatId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><OtherProfile/></ProtectedRoute>} />
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
