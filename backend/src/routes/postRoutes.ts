import express from "express";
import { isAuthenticated } from "../middlewares/auth";

import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUser
} from "../controllers/postControllers";

const router = express.Router();

// All post routes require authentication
router.use(isAuthenticated);

// Create a new post (text/image/link)
router.post("/new", createPost);

// Get all posts (feed, paginated)
router.get("/all", getAllPosts);

// Get a single post by ID
router.get("/:id", getPostById);

// Get all posts of a singleuser
router.get("/user/:id", getPostsByUser);

// Update a post by ID
router.put("/:id", updatePost);

// Delete a post by ID
router.delete("/:id", deletePost);

export default router;
