import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
// import cookie from "cookie";
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
      // console.log("Handshake headers.cookie:", socket.handshake.headers.cookie); // 👈 add this
      // cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const cookies = cookieParser(socket.handshake.headers.cookie || "");
      const token = cookies.token; // 👈 your JWT cookie name
      // console.log("token: ", token);
      const payload: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
      socket.data.userId = payload.id;
      // console.log("payload: ", payload);
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

      console.log("Send Message");

      // Save message to DB
      const message = await prisma.message.create({
        data: {
          content,
          type,
          conversationId,
          senderId: userId,
        },
        include: { sender: true }, // include sender info to show avatar/name
      });

      // Update conversation last_message & last_message_at
      const conv = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(Date.now()),
          lastMessageId: message.id,
        },
      });

      // Emit to all users in this conversation room, including sender
      io.to(conversationId).emit("message:receive", message);
      console.log("Message Broadcasted!");
    });

    // WebRTC call signaling

    // 1. Initiate a call (send offer)
    socket.on("call:initiate", ({ conversationId, offer }) => {
      socket.to(conversationId).emit("call:incoming", {
        from: socket.data.userId,
        offer,
      });
    });

    // 2. Answer a call (send answer)
    socket.on("call:answer", ({ conversationId, answer }) => {
      socket.to(conversationId).emit("call:answered", {
        from: socket.data.userId,
        answer,
      });
    });

    // 3. ICE candidates
    socket.on("call:candidate", ({ conversationId, candidate }) => {
      socket.to(conversationId).emit("call:candidate", {
        from: socket.data.userId,
        candidate,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.data.userId);
    });
  });

  return io;
};
