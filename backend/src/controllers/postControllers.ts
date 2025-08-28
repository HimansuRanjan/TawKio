import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../../types/express";
import ErrorHandler from "../middlewares/error";
import { createUpdatePostSchema } from "../schemas/zodSchemas";
import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";

// ✅ Create Post
export const createPost = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = createUpdatePostSchema.safeParse(req.body);

    if (!parsed.success)
      return next(new ErrorHandler(parsed.error.message, 400));

    const { content, linkUrl } = parsed.data;

    let imageId: string;
    let imageUrl: string;

    // ✅ Enforce image required
    if (!req.files || !req.files.image) {
      return next(new ErrorHandler("Image is required to create a post", 400));
    }

    const imageFile = req.files.image as any;

    const uploadResult = await cloudinary.uploader.upload(
      imageFile.tempFilePath,
      {
        folder: "TAWKIO_POSTS",
      }
    );

    imageId = uploadResult.public_id;
    imageUrl = uploadResult.secure_url;

    const post = await prisma.post.create({
      data: {
        content: content ?? null,
        linkUrl: linkUrl ?? null,
        imageId,
        imageUrl,
        authorId: req.user!.id,
      },
    });

    res.status(201).json({ success: true, message: "Post created", post });
  }
);

// GET ALL POSTS (feed)
export const getAllPosts = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        comments: true,
        likes: true,
      },
    });

    res.status(200).json({ success: true, posts });
  }
);

// GET POST BY ID
export const getPostById = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new ErrorHandler("Post ID Not Found", 400));
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        comments: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        likes: true,
      },
    });

    if (!post) return next(new ErrorHandler("Post not found", 404));
    res.status(200).json({ success: true, post });
  }
);

// GET POST BY ID
export const getPostsByUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // userId from params

    if (!id) {
      return next(new ErrorHandler("User ID is required", 400));
    }

    const posts = await prisma.post.findMany({
      where: { authorId: id }, // 👈 filter by userId
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        comments: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        likes: true,
      },
      orderBy: { createdAt: "desc" }, // 👈 latest first
    });

    if (!posts || posts.length === 0) {
      return next(new ErrorHandler("No posts found for this user", 404));
    }

    res.status(200).json({ success: true, posts });
  }
);


// UPDATE POST
export const updatePost = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new ErrorHandler("Post Id Not Found", 400));
    }

    const parsed = createUpdatePostSchema.safeParse(req.body);
    if (!parsed.success)
      return next(new ErrorHandler(parsed.error.message, 400));

    const { content, linkUrl } = parsed.data;

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) return next(new ErrorHandler("Post not found", 404));

    if(existingPost.authorId !== req.user.id){
      return next(new ErrorHandler("You don't have Permission to Update it!", 404));
    }

    // Handle image update
    let imageId = existingPost.imageId;
    let imageUrl = existingPost.imageUrl;

    const file = req.files?.image as UploadedFile | undefined;
    if (file) {
      if (imageId) await cloudinary.uploader.destroy(imageId);
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "POSTS",
      });
      imageId = result.public_id;
      imageUrl = result.secure_url;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: content ?? null,
        linkUrl: linkUrl ?? null,
        imageId,
        imageUrl,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Post updated", post: updatedPost });
  }
);

// DELETE POST
export const deletePost = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new ErrorHandler("Post ID Not Found", 400));
    }

    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) return next(new ErrorHandler("Post not found", 404));

    if(existingPost.authorId !== req.user.id){
      return next(new ErrorHandler("You don't have Permission to Delete it!", 404));
    }

    if (existingPost.imageId)
      await cloudinary.uploader.destroy(existingPost.imageId);

    await prisma.post.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  }
);
