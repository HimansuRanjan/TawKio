import Navbar from "./Navbar";
import { useState } from "react";

export default function Messages() {
  const [activeTab, setActiveTab] = useState("messages");

  const chats = [
    { id: 1, user: "Alex Johnson", lastMessage: "Hey, how’s it going?", time: "2m ago" },
    { id: 2, user: "Sarah Lee", lastMessage: "Did you check the docs?", time: "10m ago" },
    { id: 3, user: "Michael Chen", lastMessage: "Let’s catch up later!", time: "1h ago" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 text-center">Messages</h2>

        {chats.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between bg-white rounded-xl shadow p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <p className="font-semibold text-gray-800">{chat.user}</p>
                <p className="text-gray-600 text-sm">{chat.lastMessage}</p>
              </div>
              <span className="text-gray-400 text-xs">{chat.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
