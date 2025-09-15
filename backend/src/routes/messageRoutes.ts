import { Router } from "express";
import { getMessages } from "../controllers/messageControllers";
import { isAuthenticated } from "../middlewares/auth";  

const router = Router();

router.get("/:conversationId", isAuthenticated, getMessages);

export default router;