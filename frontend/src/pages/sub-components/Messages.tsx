import Navbar from "./Navbar";
import { useEffect } from "react";
import {
  fetchConversations,
  selectConversation,
} from "../../store/slices/conversationSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import Loader from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { Conversation } from "@/types/message";

export default function Messages() {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, conversationsLoading } = useSelector(
    (state: RootState) => state.conversation
  );
  const { user } = useSelector((state: RootState) => state.user);
  const navigateTo = useNavigate();

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleConversationClick = (chat: Conversation) => {
    dispatch(selectConversation(chat));
    navigateTo(`/messages/${chat.id}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar activeTab="messages" setActiveTab={() => {}} />

      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 text-center">
          Messages
        </h2>

        {conversationsLoading && <Loader />}

        {conversations.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleConversationClick(chat)}
              className="flex items-center justify-between bg-white rounded-xl shadow p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {chat.isGroup
                    ? "Group Chat"
                    : chat.participants
                        .filter((p) => p.username !== user.username) // ✅ exclude logged-in user
                        .map((p) => p.username)
                        .join(", ")}
                </p>

                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <span>{chat.lastMessage?.content || "No messages yet"}</span>
                  {chat.lastMessageAt && (
                    <span className="text-gray-400 text-xs">
                      •{" "}
                      {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
