import express from "express";
import { isAuthenticated } from "../middlewares/auth";

import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postControllers";

const router = express.Router();

// All post routes require authentication
router.use(isAuthenticated);

// Create a new post (text/image/link)
router.post("/", createPost);

// Get all posts (feed, paginated)
router.get("/", getAllPosts);

// Get a single post by ID
router.get("/:id", getPostById);

// Update a post by ID
router.put("/:id", updatePost);

// Delete a post by ID
router.delete("/:id", deletePost);

export default router;
