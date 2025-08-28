import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { toggleLike } from "../controllers/likeControllers";

const router = express.Router();

// All like routes require authentication
router.use(isAuthenticated);

// Toggle like/unlike
router.post("/posts/:id/like", toggleLike);

export default router;
