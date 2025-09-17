import { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import { AuthenticatedRequest } from "../../types/express";
import prisma from "../config/db";

export const getMessages = catchAsyncErrors(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { conversationId } = req.params;
        const userId = req.user?.id;

        if(!conversationId){
            return next(new Error("Conversation ID NotFound!"));
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId,
            },
            orderBy: { createdAt: 'asc' }
        });       

        res.status(200).json({
            success: true,
            messages
        });
    }
);