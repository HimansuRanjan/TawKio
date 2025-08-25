import { catchAsyncErrors } from "./catchAsyncError";
import ErrorHandler from "./error";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../../types/express";

export const isAuthenticated = catchAsyncErrors(async (req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    const { token } = req.cookies;
    if(!token){
        return next(new ErrorHandler("User Not Authenticated!", 400));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;

     // Fetch user from database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarId: true,
        avatarUrl: true,
        // exclude password and reset fields
      },
    });

    if (!user) {
      return next(new ErrorHandler("User not found!", 404));
    }

    req.user = user;

    next();
})