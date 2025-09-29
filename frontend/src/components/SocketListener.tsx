import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../socket"; // ✅ make sure this exports io() instance
import { receiveMessage } from "../store/slices/messageSlice";
import { AppDispatch, RootState } from "../store/store";

export default function SocketListener() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    if (!socket.connected) {
      console.log("Connecting socket...");
      socket.connect();
    }

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
    });
    
    console.log("Socket connected as user:", user.id);

    // // Listen for incoming messages globally
    // socket.on("message:receive", (msg) => {
    //   console.log("New message received via SocketListener:", msg);
    //   dispatch(receiveMessage(msg));
    // });

    return () => {
      socket.off("message:receive");
    };
  }, [isAuthenticated, user?.id, dispatch]);

  return null;
}
