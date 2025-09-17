import Navbar from "./Navbar";
import { useEffect } from "react";
import { fetchConversations, selectConversation } from "../../store/slices/messageSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import Loader from "@/components/Loader";

export default function Messages() {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, messageLoading } = useSelector((state:RootState) => state.message);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar activeTab="messages" setActiveTab={() => {}} />

      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 text-center">Messages</h2>

        {messageLoading && <Loader/>}

        {conversations.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => dispatch(selectConversation(chat))}
              className="flex items-center justify-between bg-white rounded-xl shadow p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {chat.isGroup
                    ? "Group Chat"
                    : chat.participants
                        .map((p) => p.username)
                        .join(", ")}
                </p>
                <p className="text-gray-600 text-sm">
                  {chat.lastMessage?.content || "No messages yet"}
                </p>
              </div>
              <span className="text-gray-400 text-xs">
                {chat.lastMessageAt
                  ? new Date(chat.lastMessageAt).toLocaleTimeString()
                  : ""}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
