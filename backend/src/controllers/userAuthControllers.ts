// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import bcrypt from "bcryptjs";
import { catchAsyncErrors } from "../middlewares/catchAsyncError";
import ErrorHandler from "../middlewares/error";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  deleteUserSchema,
} from "../schemas/zodSchemas";
import { generateToken } from "../utils/jwtToken";
import { AuthenticatedRequest } from "../../types/express";
import { v2 as cloudinary } from "cloudinary";
import crypto from 'crypto';
import { generateResetToken } from "../utils/generateResetToken";
import { sendEmail } from "../utils/sendEmail";
import { UploadedFile } from "express-fileupload";



// Register User
export const registerUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parseResult = registerSchema.safeParse(req.body);

    if (!parseResult.success) {
      return next(new ErrorHandler(parseResult.error.message, 400));
    }

    const { username, email, password } = parseResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ErrorHandler("Email already registered", 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarId: true,
        avatarUrl: true,
        password: true,
      },
    });

    generateToken(user, "User Registered", 201, res);
  }
);

// Login User
export const loginUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      return next(new ErrorHandler(`${parseResult.error.flatten()}`, 400));
    }

    const { email, password } = parseResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        avatarId: true,
        avatarUrl: true,
        password: true,
      },
    });

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    generateToken(user, "Login successful", 200, res);
  }
);

// ✅ Update Profile
export const updateProfile = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(new ErrorHandler(`${parsed.error}`, 400));
    }

    const newUserData: any = { ...parsed.data };

    const existingUser = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!existingUser) return next(new ErrorHandler("User not found", 404));

    // Avatar Handling
    if (req.files && req.files.avatar) {
      const avatar = req.files.avatar as UploadedFile;
      if (existingUser.avatarId) {
        await cloudinary.uploader.destroy(existingUser.avatarId);
      }
      const uploadResult = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
          folder: "TAWKIO_AVATARS",
        }
      );
      newUserData.avatarId = uploadResult.public_id;
      newUserData.avatarUrl = uploadResult.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: newUserData,
    });

    res
      .status(200)
      .json({ success: true, message: "Profile Updated!", user: updatedUser });
  }
);

// ✅ Logout
export const logoutUser = catchAsyncErrors(
  async (req: Request, res: Response) => {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({ success: true, message: "Logged Out!" });
  }
);

// ✅ Get logged-in User
export const getUser = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response) => {
    res.status(200)
    .json({ 
      success: true, 
      user: req.user 
    });
  }
);


// ✅ Change Password
export const changePassword = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(new ErrorHandler(parsed.error.message, 400));
    }

    const { currentPassword, newPassword } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, password: true },
    });

    if (!user?.password)
      return next(new ErrorHandler("User not found or password missing!", 404));

    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatched)
      return next(new ErrorHandler("Incorrect current password!", 401));

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: "Password updated!" });
  }
);

// ✅ Forgot Password
export const forgotPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(new ErrorHandler(`${parsed.error}`, 400));
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return next(
        new ErrorHandler("User Not Found! Please provide a valid Email", 404)
      );

    const { resetToken, hashedToken, expireTime } = generateResetToken();

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: expireTime,
      },
    });

    const resetPasswordUrl = `${process.env.APP_URL}/reset/password/${resetToken}`;
    const message = `Your Reset Password URL is:\n\n${resetPasswordUrl}\n\nIf you did not request this, ignore.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Recovery",
        message,
      });
      res
        .status(200)
        .json({
          success: true,
          message: `Reset Password Email sent to ${user.email} successfully!`,
        });
    } catch (error: any) {
      await prisma.user.update({
        where: { email },
        data: { resetPasswordToken: null, resetPasswordExpire: null },
      });
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// ✅ Reset Password
export const resetPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(new ErrorHandler(`${parsed.error}`, 400));
    }

    const { token } = req.params;
    const { password } = parsed.data;

    if (!token) {
      return next(new ErrorHandler("Reset token is missing", 400));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { gt: new Date() },
      },
    });

    if (!user)
      return next(
        new ErrorHandler("Reset token is invalid or has expired", 400)
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    generateToken(user, "Password Reset Successfully!", 200, res);
  }
);

// ✅ Delete User
export const deleteUser = catchAsyncErrors(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new ErrorHandler("Request body is required", 400));
    }

    const parsed = deleteUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(new ErrorHandler(
        parsed.error.flatten().formErrors.join(", "), 
        400
      ));
    }

    const { username } = parsed.data;
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(new ErrorHandler("User not found", 404));

    if (user.username !== username) {
      return next(new ErrorHandler("Username does not match", 400));
    }



    await prisma.user.delete({ where: { id: userId } });

    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({ 
        success: true, 
        message: "Your account and all related data have been permanently deleted!" 
      });
  }
);
