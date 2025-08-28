import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../../types/express";
import ErrorHandler from "../middlewares/error";
import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import { likePostSchema } from "../schemas/zodSchemas";

// ✅ TOGGLE LIKE
export const toggleLike = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = likePostSchema.safeParse({ postId: req.params.id });

    if (!parsed.success) {
      return next(new ErrorHandler(parsed.error.message, 400));
    }

    const { postId } = parsed.data;

    // Ensure post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return next(new ErrorHandler("Post not found", 404));

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: { postId, userId: req.user!.id },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res
        .status(200)
        .json({ success: true, message: "Post Unliked ❌", liked: false });
    } else {
      // Like
      const like = await prisma.like.create({
        data: {
          postId,
          userId: req.user!.id,
        },
      });
      return res
        .status(201)
        .json({ success: true, message: "Post Liked ✅", liked: true, like });
    }
  }
);
