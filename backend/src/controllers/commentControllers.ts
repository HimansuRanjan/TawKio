import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../../types/express";
import ErrorHandler from "../middlewares/error";
import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import { createCommentSchema } from "../schemas/zodSchemas";

// ✅ CREATE COMMENT
export const createComment = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = createCommentSchema.safeParse({
      postId: req.params.id,
      ...req.body,
    });

    if (!parsed.success) {
      return next(new ErrorHandler(parsed.error.message, 400));
    }

    const { postId, content } = parsed.data;

    // Ensure post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return next(new ErrorHandler("Post not found", 404));

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ success: true, message: "Comment added", comment });
  }
);

// ✅ GET COMMENTS FOR A POST
export const getPostComments = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if(!id){
        return new ErrorHandler("Post ID Not Found", 404);
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return next(new ErrorHandler("Post not found", 404));

    const comments = await prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.status(200).json({ success: true, comments });
  }
);

// ✅ DELETE COMMENT
export const deleteComment = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if(!id){
        return new ErrorHandler("Comment ID Not Found", 404);
    }
    
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return next(new ErrorHandler("Comment not found", 404));
    }

    // Ensure user is the author
    if (existingComment.authorId !== req.user!.id) {
      return next(new ErrorHandler("Not authorized to delete this comment", 403));
    }

    //Post Author can also delete: TODO

    await prisma.comment.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  }
);
