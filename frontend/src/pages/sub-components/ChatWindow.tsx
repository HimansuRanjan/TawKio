import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import socket  from "../../socket";

const app_url = import.meta.env.VITE_SERVER_URL;

export default function ChatWindow() {
  const { selectedConversation } = useSelector((state: RootState) => state.message);
  const { user } = useSelector((state: RootState) => state.user);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // Load history when selecting a conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const { data } = await axios.get(
          `${app_url}/v.1/api/messages/${selectedConversation.id}`,
          { withCredentials: true }
        );
        setMessages(data.messages);

        // join this conversation room
        socket.emit("join:conversation", selectedConversation.id);
      } catch (err) {
        console.error(err);
      }
    };
    loadMessages();
  }, [selectedConversation]);

  // Listen for real-time messages
  useEffect(() => {
    socket.on("message:receive", (msg) => {
      if (msg.conversationId === selectedConversation?.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("message:receive");
    };
  }, [selectedConversation?.id]);

  if (!selectedConversation)
    return <div className="p-4 text-center text-gray-500">Select a chat</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConversation) return;

    socket.emit("message:send", {
      conversationId: selectedConversation.id,
      content: input,
      type: "TEXT",
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((m: any) => (
          <div
            key={m.id}
            className={`max-w-xs p-2 rounded-xl ${
              m.senderId === user?.id
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 flex gap-2 border-t bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded-xl"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-xl">
          Send
        </button>
      </form>
    </div>
  );
}
