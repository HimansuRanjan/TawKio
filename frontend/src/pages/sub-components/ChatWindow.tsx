import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import socket from "../../socket";
import { receiveMessage } from "@/store/slices/messageSlice";
import { Message } from "@/types/message";
import Picker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useNavigate } from "react-router-dom";
import { Phone, Video } from "lucide-react";

const app_url = import.meta.env.VITE_SERVER_URL;

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector(
    (state: RootState) => state.conversation
  );
  const { user } = useSelector((state: RootState) => state.user);

  const navigateTo = useNavigate();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Dropdown for messages
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Emoji picker
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // --- Call State ---
  const [inCall, setInCall] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  if (!selectedConversation) {
    return (
      <div className="p-4 text-center text-gray-500 rounded-lg border border-gray-200 shadow-md">
        Select a conversation to start chatting
      </div>
    );
  }

  const partner = selectedConversation.participants?.find(
    (p) => p.id !== user?.id
  );

  // --- Load messages ---
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await axios.get(
          `${app_url}/v.1/api/messages/${selectedConversation.id}`,
          { withCredentials: true }
        );
        setMessages(data.messages);
        socket.emit("join:conversation", selectedConversation.id);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };
    loadMessages();
  }, [selectedConversation]);

  // --- Handle incoming messages ---
  useEffect(() => {
    const handleReceive = (msg: any) => {
      if (msg.senderId === user?.id) return;
      if (msg.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, msg]);
        dispatch(receiveMessage(msg));
      }
    };
    socket.on("message:receive", handleReceive);

    return () => {
      socket.off("message:receive", handleReceive);
    };
  }, [selectedConversation.id, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send Message ---
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      conversationId: selectedConversation.id,
      senderId: user?.id,
      content: input,
      type: "TEXT",
      createdAt: new Date().toISOString(),
      sender: user,
    };

    setMessages((prev) => [...prev, newMessage]);
    dispatch(receiveMessage(newMessage as Message));
    socket.emit("message:send", newMessage);
    setInput("");
  };

  // --- WebRTC Setup ---
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:candidate", {
          conversationId: selectedConversation.id,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const getLocalStream = async (video: boolean) => {
    return await navigator.mediaDevices.getUserMedia({
      video,
      audio: true,
    });
  };

  const startCall = async (video: boolean) => {
    const pc = createPeerConnection();
    pcRef.current = pc;

    const localStream = await getLocalStream(video);
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:initiate", {
      conversationId: selectedConversation.id,
      offer,
    });

    setInCall(true);
  };

  const endCall = () => {
    pcRef.current?.close();
    pcRef.current = null;
    setInCall(false);
  };

  // --- Socket Call Events ---
  useEffect(() => {
    socket.on("call:incoming", async ({ from, offer }) => {
      const pc = createPeerConnection();
      pcRef.current = pc;

      const localStream = await getLocalStream(true);
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", {
        conversationId: selectedConversation.id,
        answer,
      });

      setInCall(true);
    });

    socket.on("call:answered", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("call:candidate", async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:answered");
      socket.off("call:candidate");
    };
  }, [selectedConversation.id]);

  // --- Close dropdown & emoji picker on outside click ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(e.target as HTMLElement).closest(".dropdown-button") &&
        !(e.target as HTMLElement).closest(".dropdown-menu")
      ) {
        setDropdownOpen(null);
      }
      if (
        pickerRef.current &&
        !(e.target as HTMLElement).closest(".emoji-picker") &&
        !(e.target as HTMLElement).closest(".emoji-button")
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-100 rounded-t-xl shadow-sm">
        <div
          className="flex items-center gap-3 hover:cursor-pointer"
          onClick={() => navigateTo(`/profile/${partner?.id}`)}
        >
          <img
            src={partner?.avatarUrl || "/user.jpg"}
            alt="avatar"
            className="w-12 h-12 rounded-full shadow-md"
          />
          <span className="font-semibold text-gray-800">
            {partner?.username || "Unknown"}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <button
            title="Start audio call"
            onClick={() => startCall(false)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <Phone className="w-6 h-6 text-gray-700" />
          </button>
          <button
            title="Start video call"
            onClick={() => startCall(true)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <Video className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-b-xl scrollbar-hide">
        {messages.map((m: any, idx) => (
          <div
            key={m.id || idx}
            className={`flex items-start ${
              m.senderId === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div className="relative max-w-xs">
              <div
                className={`px-4 py-2 rounded-2xl break-words shadow-md ${
                  m.senderId === user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {m.content}
              </div>

              <div
                className="absolute top-0 -right-6 flex flex-col items-end"
                ref={dropdownRef}
              >
                <button
                  className="dropdown-button text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-300 transition"
                  onClick={() =>
                    setDropdownOpen(dropdownOpen === m.id ? null : m.id)
                  }
                >
                  ⋮
                </button>

                {dropdownOpen === m.id && (
                  <div className="dropdown-menu mt-2 w-32 bg-white border rounded-xl shadow-lg z-10">
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => {
                        navigator.clipboard.writeText(m.content);
                        setDropdownOpen(null);
                      }}
                    >
                      Copy
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => {
                        setMessages((prev) => prev.filter((msg) => msg !== m));
                        setDropdownOpen(null);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => {
                        setInput(m.content);
                        setDropdownOpen(null);
                      }}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t flex items-center gap-2 bg-white rounded-b-xl shadow-inner relative"
      >
        <button
          type="button"
          className="emoji-button text-xl px-2 hover:bg-gray-200 rounded-full transition"
          onClick={() => setShowPicker((prev) => !prev)}
        >
          😀
        </button>

        {showPicker && (
          <div
            className="emoji-picker absolute bottom-16 left-2 z-50"
            ref={pickerRef}
          >
            <Picker
              onEmojiClick={(emojiData: EmojiClickData) => {
                setInput((prev) => prev + emojiData.emoji);
              }}
              theme={Theme.LIGHT}
            />
          </div>
        )}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 shadow-md transition"
        >
          Send
        </button>
      </form>

      {/* Call Overlay */}
      {inCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="relative bg-white rounded-xl p-4 shadow-lg flex flex-col items-center">
            <div className="flex gap-2">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-32 h-32 rounded-lg shadow"
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-64 h-64 rounded-lg shadow"
              />
            </div>
            <button
              onClick={endCall}
              className="mt-4 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
