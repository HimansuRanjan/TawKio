// src/routes/authRoutes.ts
import express from "express";
import { isAuthenticated } from "../middlewares/auth"; // Auth middleware
import {
  registerUser,
  loginUser,
  updateProfile,
  logoutUser,
  getUser,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteUser,
  getUserByID,
} from "../controllers/userAuthControllers";

const router = express.Router();

// ========================
// Public Routes
// ========================

// Register
router.post("/signup", registerUser);

// Login
router.post("/login", loginUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password (token in URL)
router.put("/reset-password/:token", resetPassword);

// ========================
// Protected Routes (Require Authentication)
// ========================
router.use(isAuthenticated); // All routes below require JWT

// Logout
router.get("/logout", logoutUser);

// Get current logged-in user
router.get("/me", getUser);

// get user By Id
router.get("/:userId", getUserByID)

// Update profile
router.put("/me/update", updateProfile);

// Change password
router.put("/me/change-password", changePassword);

// Delete account
router.delete("/me/delete", deleteUser);

export default router;
