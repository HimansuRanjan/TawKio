import { useState } from "react";
import Navbar from "./sub-components/Navbar";
import Feed from "./sub-components/Feed";
import Messages from "./sub-components/Messages";
import Notifications from "./sub-components/Notifications";
import Profile from "./Profile";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { useEffect } from 'react';
import { clearAllUserErrors } from '../store/slices/userSlice';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function HomeFeed() {
  const [activeTab, setActiveTab] = useState("home");

    const dispatch = useDispatch<AppDispatch>();
  const navigateTo = useNavigate();

  const {isAuthenticated, loading, error} = useSelector(
    (state: RootState) => state.user
  )

  useEffect(()=>{
    if(error){
      toast.error(error);
      dispatch(clearAllUserErrors());
    }

    if(!isAuthenticated){
      navigateTo("/login");
    }
    
  },[isAuthenticated, error, loading]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === "home" && <Feed />}
        {activeTab === "messages" && <Messages />}
        {activeTab === "notifications" && <Notifications />}
        {activeTab === "profile" && <Profile />}
      </main>
    </div>
  );
}
