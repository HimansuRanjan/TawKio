import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const socket = io(URL, {
  withCredentials: true,        // 👈 allow cookies to be sent
  // transports: ["websocket"],
  autoConnect: false, // connect only after auth
});


export default socket;
