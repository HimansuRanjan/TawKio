import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
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

    io.use(async (socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication error"));

        try {
            const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
            socket.data.userId = payload.id;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.data.userId);

        socket.on("join:conversation", (conversationId: string) => {
            socket.join(conversationId);
            console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
        });

        socket.on("message:send", async (data) => {
            const { conversationId, content, type } = data;
            const userId = socket.data.userId;

            const message = await prisma.message.create({
                data: {
                    content,
                    type,
                    conversationId,
                    senderId: userId,
                }
            });

            io.to(conversationId).emit("message:receive", message);
        });

        // Example for call signaling
        socket.on("call:initiate", (data) => {
            const { conversationId, offer } = data;
            socket.to(conversationId).emit("call:incoming", { from: socket.data.userId, offer });
        });

        socket.on("call:answer", (data) => {
            const { conversationId, answer } = data;
            socket.to(conversationId).emit("call:answered", { from: socket.data.userId, answer });
        });

        socket.on("call:candidate", (data) => {
            const { conversationId, candidate } = data;
            socket.to(conversationId).emit("call:candidate", { from: socket.data.userId, candidate });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.data.userId);
        });
    });

    return io;
};
