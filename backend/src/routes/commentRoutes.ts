import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import {
  createComment,
  getPostComments,
  deleteComment,
} from "../controllers/commentControllers";

const router = express.Router();

// All comment routes require authentication
router.use(isAuthenticated);

// Create a comment on a post
router.post("/posts/:id/comments", createComment);

// Get all comments for a post
router.get("/posts/:id/comments", getPostComments);

// Delete a comment by ID
router.delete("/comments/:id", deleteComment);

export default router;
