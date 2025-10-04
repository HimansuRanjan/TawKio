import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookieLib from "cookie";
import prisma from "../config/db";

interface SocketData {
  userId: string;
}

// universal safe parser
const cookieParser: any =
  (cookieLib as any).parse || (cookieLib as any).default?.parse;

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
      const cookies = cookieParser(socket.handshake.headers.cookie || "");
      const token = cookies.token;
      const payload: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
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
      const { conversationId, content, type } = data;
      const userId = socket.data.userId;

      // Save message to DB
      const message = await prisma.message.create({
        data: {
          content,
          type,
          conversationId,
          senderId: userId,
        },
        include: { sender: true },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date(), lastMessageId: message.id },
      });

      io.to(conversationId).emit("message:receive", message);
    });

    // --- WebRTC Call Signaling ---

    // 1. Caller starts ringing
    socket.on("call:ringing", ({ conversationId, isVideo }) => {
      socket.to(conversationId).emit("call:ringing", {
        fromUserId: socket.data.userId,
        isVideo,
      });
    });

    // 2. Callee accepts → notify caller to initiate offer
    socket.on("call:accepted", ({ conversationId, toUserId, isVideo }) => {
      socket.to(conversationId).emit("call:accepted", {
        fromUserId: socket.data.userId,
        toUserId,
        isVideo,
      });
    });

    // 3. Caller sends offer → only to callee
    socket.on("call:initiate", ({ conversationId, offer, toUserId, isVideo }) => {
      socket.to(conversationId).emit("call:incoming", {
        fromUserId: socket.data.userId,
        offer,
        isVideo,
      });
    });

    // 4. Callee sends answer
    socket.on("call:answer", ({ conversationId, answer }) => {
      socket.to(conversationId).emit("call:answered", { answer });
    });

    // 5. Reject call
    socket.on("call:reject", ({ conversationId }) => {
      socket.to(conversationId).emit("call:rejected", { fromUserId: socket.data.userId });
    });

    // 6. ICE candidates
    socket.on("call:candidate", ({ conversationId, candidate }) => {
      socket.to(conversationId).emit("call:candidate", {
        fromUserId: socket.data.userId,
        candidate,
      });
    });

    // 7. End call
    socket.on("call:end", ({ conversationId }) => {
      socket.to(conversationId).emit("call:end", { fromUserId: socket.data.userId });
    });
  });

  return io;
};
