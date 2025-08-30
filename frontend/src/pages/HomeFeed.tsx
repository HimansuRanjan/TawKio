import { useState } from "react";
import Navbar from "./sub-components/Navbar";
import Feed from "./sub-components/Feed";
import Messages from "./sub-components/Messages";
import Notifications from "./sub-components/Notifications";
import Profile from "./Profile";

export default function HomeFeed() {
  const [activeTab, setActiveTab] = useState("home");

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
