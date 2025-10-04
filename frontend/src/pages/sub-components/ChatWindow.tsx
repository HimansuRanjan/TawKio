import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import socket from "../../socket";
import { receiveMessage } from "@/store/slices/messageSlice";
import { Message } from "@/types/message";
import Picker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
} from "lucide-react";

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

  // Dropdown and emoji
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // --- Call State ---
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callRequested, setCallRequested] = useState<any>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null); // hidden audio
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

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
  }, [selectedConversation.id]);

  // --- Incoming messages ---
  useEffect(() => {
    const handleReceive = (msg: any) => {
      if (msg.senderId === user?.id) return;
      if (msg.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, msg]);
        dispatch(receiveMessage(msg));
      }
    };
    socket.on("message:receive", handleReceive);
    return () => { socket.off("message:receive", handleReceive) };
  }, [selectedConversation.id, dispatch, user?.id]);

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
      const stream = event.streams[0];
      if (!stream) return;

      if (isVideoCall && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      } else if (!isVideoCall && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(console.error);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall();
      }
    };

    return pc;
  };

  const getLocalStream = async (video: boolean) => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video,
      });
      localStreamRef.current = stream;
      if (video && localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      console.error("Media access error:", err);
      throw err;
    }
  };

  // --- Call Actions ---
  const startCall = (video: boolean) => {
    setCallRequested({ toUserId: partner?.id, isVideo: video, startedAt: Date.now() });
    setIsVideoCall(video);
    socket.emit("call:ringing", {
      conversationId: selectedConversation.id,
      fromUserId: user?.id,
      isVideo: video,
    });
  };

  const cancelCallRequest = () => {
    if (callRequested) {
      socket.emit("call:cancel", {
        conversationId: selectedConversation.id,
        fromUserId: user?.id,
      });
      setCallRequested(null);
    }
  };

  const caller_proceedCreateOffer = async (video: boolean) => {
    try {
      const pc = createPeerConnection();
      pcRef.current = pc;

      const localStream = await getLocalStream(video);
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:initiate", {
        conversationId: selectedConversation.id,
        offer,
        isVideo: video,
      });

      setInCall(true);
    } catch (err) {
      console.error("Failed to create & send offer:", err);
      setCallRequested(null);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    socket.emit("call:accepted", {
      conversationId: selectedConversation.id,
      fromUserId: user?.id,
      toUserId: incomingCall.fromUserId,
      isVideo: incomingCall.isVideo,
    });
    setIsVideoCall(incomingCall.isVideo);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("call:rejected", {
        conversationId: selectedConversation.id,
        fromUserId: user?.id,
        toUserId: incomingCall.fromUserId,
      });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    setInCall(false);
    setIncomingCall(null);
    setCallRequested(null);
    setIsMuted(false);
    setIsVideoOff(false);
    pendingCandidates.current = [];

    socket.emit("call:end", { conversationId: selectedConversation.id });
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsVideoOff((prev) => !prev);
  };

  // --- Socket Events ---
  useEffect(() => {
    const onRinging = ({ fromUserId, isVideo }: any) => {
      if (fromUserId === user?.id) return;
      setIncomingCall({
        fromUserId,
        fromName: partner?.username || "Unknown",
        isVideo,
      });
    };

    const onAccepted = ({ toUserId, isVideo }: any) => {
      if (toUserId !== user?.id) return;
      setCallRequested(null);
      caller_proceedCreateOffer(isVideo);
    };

    const onRejected = ({ toUserId }: any) => {
      if (toUserId !== user?.id) return;
      alert("Call was rejected");
      setCallRequested(null);
    };

    const onIncomingOffer = async ({ fromUserId, offer, isVideo }: any) => {
      if (fromUserId === user?.id) return;
      try {
        const pc = createPeerConnection();
        pcRef.current = pc;
        const localStream = await getLocalStream(isVideo);
        localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call:answer", { conversationId: selectedConversation.id, answer });
        setInCall(true);
      } catch (err) {
        console.error(err);
      }
    };

    const onAnswered = async ({ answer }: any) => {
      if (!pcRef.current) return;
      try { await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer)); }
      catch (err) { console.error(err); }
    };

    const onCandidate = async ({ candidate }: any) => {
      if (pcRef.current) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
        catch (err) { console.error(err); }
      } else { pendingCandidates.current.push(candidate); }
    };

    const onCallEnd = () => endCall();
    const onCancel = () => { setIncomingCall(null); setCallRequested(null); };

    socket.on("call:ringing", onRinging);
    socket.on("call:accepted", onAccepted);
    socket.on("call:rejected", onRejected);
    socket.on("call:incoming", onIncomingOffer);
    socket.on("call:answered", onAnswered);
    socket.on("call:candidate", onCandidate);
    socket.on("call:end", onCallEnd);
    socket.on("call:cancel", onCancel);

    return () => {
      socket.off("call:ringing", onRinging);
      socket.off("call:accepted", onAccepted);
      socket.off("call:rejected", onRejected);
      socket.off("call:incoming", onIncomingOffer);
      socket.off("call:answered", onAnswered);
      socket.off("call:candidate", onCandidate);
      socket.off("call:end", onCallEnd);
      socket.off("call:cancel", onCancel);
    };
  }, [selectedConversation.id, user?.id]);

  useEffect(() => {
    if (pcRef.current && pendingCandidates.current.length > 0) {
      pendingCandidates.current.forEach(async (c) => {
        try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(c)); }
        catch (err) { console.error(err); }
      });
      pendingCandidates.current = [];
    }
  }, [pcRef.current]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-100 rounded-t-xl shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer"
             onClick={() => navigateTo(`/profile/${partner?.id}`)}>
          <img src={partner?.avatarUrl || "/user.jpg"} alt="avatar" className="w-12 h-12 rounded-full shadow-md" />
          <span className="font-semibold text-gray-800">{partner?.username || "Unknown"}</span>
        </div>
        <div className="flex gap-4">
          <button title="Audio Call" onClick={() => startCall(false)} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow">
            <Phone className="w-5 h-5" />
          </button>
          <button title="Video Call" onClick={() => startCall(true)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow">
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-b-xl">
        {messages.map((m, idx) => (
          <div key={m.id || idx} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-2xl shadow-sm max-w-xs ${m.senderId === user?.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2 bg-white shadow-inner">
        <button type="button" className="text-xl px-2 hover:bg-gray-200 rounded-full transition" onClick={() => setShowPicker(!showPicker)}>😀</button>
        {showPicker && <div className="absolute bottom-16 left-4 z-50 bg-white border rounded-lg shadow p-2" ref={pickerRef}>
          <Picker onEmojiClick={(emojiData: EmojiClickData) => setInput((prev) => prev + emojiData.emoji)} theme={Theme.LIGHT} />
        </div>}
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:ring-2 focus:ring-blue-400" />
        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600">Send</button>
      </form>

      {/* Hidden audio element */}
      <audio ref={remoteAudioRef} autoPlay hidden />

      {/* Caller Ringing */}
      {callRequested && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Calling {partner?.username}...</h3>
            <p className="text-sm text-gray-600 mb-4">Waiting for response</p>
            <button onClick={cancelCallRequest} className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Incoming Call Popup */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-4">
              {incomingCall.fromName || "Unknown"} is calling
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              {incomingCall.isVideo ? "Video" : "Audio"} call
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={acceptCall}
                className="bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Call Overlay */}
      {inCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="relative bg-gray-900 rounded-xl p-6 shadow-2xl flex flex-col items-center space-y-4">
            {isVideoCall ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-72 h-72 rounded-lg border-2 border-white shadow"
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-32 h-32 rounded-md border border-white shadow absolute bottom-8 right-8"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center bg-gray-800 w-56 h-56 rounded-full">
                <Phone className="w-12 h-12 text-green-400 animate-pulse" />
                <p className="mt-2 text-gray-300">In Audio Call</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <button
                onClick={toggleMute}
                className={`flex items-center justify-center w-12 h-12 rounded-full ${isMuted ? "bg-gray-600" : "bg-gray-700"} hover:bg-gray-600 transition`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-6 h-6 text-red-400" /> : <Mic className="w-6 h-6 text-white" />}
              </button>

              {isVideoCall && (
                <button
                  onClick={toggleVideo}
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${isVideoOff ? "bg-gray-600" : "bg-gray-700"} hover:bg-gray-600 transition`}
                  title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6 text-red-400" /> : <Video className="w-6 h-6 text-white" />}
                </button>
              )}

              <button
                onClick={endCall}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 transition"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
