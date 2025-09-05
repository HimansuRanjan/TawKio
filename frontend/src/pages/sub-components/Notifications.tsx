import Navbar from "./Navbar";
import { useState } from "react";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("notifications");

  const notifications = [
    { id: 1, text: "Alex Johnson liked your post 🚀", time: "5m ago" },
    { id: 2, text: "Sarah Lee commented: 'Nice work! 🎉'", time: "20m ago" },
    { id: 3, text: "Michael Chen started following you", time: "1h ago" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 text-center">Notifications</h2>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-xl shadow p-4 hover:bg-gray-50"
            >
              <p className="text-gray-800">{notification.text}</p>
              <span className="text-gray-400 text-xs">{notification.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
