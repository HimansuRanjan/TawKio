import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import prisma from "../config/db";

interface SocketData {
  userId: string;
}

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.APP_URL!, "http://localhost:5173"],
      credentials: true,
    },
  });

  io.on("connect_error", (err) => {
    console.error("Socket connect error:", err.message);
  });

  io.use(async (socket: Socket, next) => {
    try {
      console.log("Handshake headers.cookie:", socket.handshake.headers.cookie); // 👈 add this
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token; // 👈 your JWT cookie name
      console.log("Token:", token);
      if (!token) return next(new Error("Authentication error"));

      console.log("User Found");

      const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
      socket.data.userId = payload.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.data.userId);

    socket.on("join:conversation", (conversationId: string) => {
      socket.join(conversationId);
      console.log(
        `User ${socket.data.userId} joined conversation ${conversationId}`
      );
    });

    socket.on("message:send", async (data) => {
      console.log("Message Send");
      const { conversationId, content, type } = data;
      const userId = socket.data.userId;

      const message = await prisma.message.create({
        data: {
          content,
          type,
          conversationId,
          senderId: userId,
        },
      });

      io.to(conversationId).emit("message:receive", message);
    });

    // Example for call signaling
    socket.on("call:initiate", (data) => {
      const { conversationId, offer } = data;
      socket
        .to(conversationId)
        .emit("call:incoming", { from: socket.data.userId, offer });
    });

    socket.on("call:answer", (data) => {
      const { conversationId, answer } = data;
      socket
        .to(conversationId)
        .emit("call:answered", { from: socket.data.userId, answer });
    });

    socket.on("call:candidate", (data) => {
      const { conversationId, candidate } = data;
      socket
        .to(conversationId)
        .emit("call:candidate", { from: socket.data.userId, candidate });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.data.userId);
    });
  });

  return io;
};
