// src/schemas/zodSchemas.ts
import { z } from "zod";

// ✅ Auth Schemas
export const registerSchema = z.object({
  username: z.string().min(8, "Username must be at least 8 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password required"),
});

// ✅ Update Profile
export const updateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30).optional(),
  email: z.string().email("Invalid email format").optional(),
  bio: z.string().max(200, "About Me should not exceed 200 characters").optional(),
});

// ✅ Change Password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmNewPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New password and confirm password must match",
  path: ["confirmNewPassword"],
});

// ✅ Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email"),
});

// ✅ Reset Password
export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password & Confirm Password must match",
  path: ["confirmPassword"],
});


// ✅ Reset Password
export const deleteUserSchema = z.object({
  username: z.string().min(8, "Username is required to confirm deletion"),
});

// ✅ Post Schema
export const createPostSchema = z.object({
  content: z.string().optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional(),
});

// ✅ Comment Schema
export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1, "Comment cannot be empty"),
});

// ✅ Like Schema
export const likePostSchema = z.object({
  postId: z.string().uuid(),
});

// ✅ Message Schema
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().optional(),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "CALL"]).default("TEXT"),
});
