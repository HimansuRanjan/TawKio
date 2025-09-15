import { AuthenticatedRequest } from "../../types/express";
import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { catchAsyncErrors } from "../middlewares/catchAsyncError";


export const getConversations = catchAsyncErrors(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        return next(new Error("User Not Authenticated!"));
    }

    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    id: userId
                }
            }
        },
        include: {
            participants: true,
            lastMessage: true,
        },
        orderBy: { lastMessageAt: 'desc' }
    });

    res.status(200).json({
        success: true,
        conversations
    });
});


export const createConversation = catchAsyncErrors(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { participantIds } = req.body;

    if (!userId) {
        return next(new Error("User Not Authenticated!"));
    }

    if (!participantIds || participantIds.length === 0) {
        return next(new Error("Participant IDs are required"));
    }

    const conversation = await prisma.conversation.create({
        data: {
            participants: {
                connect: participantIds.map((id: string) => ({ id }))
            },
            isGroup: participantIds.length > 2
        }
    });

    res.status(201).json({
        success: true,
        conversation
    });
});