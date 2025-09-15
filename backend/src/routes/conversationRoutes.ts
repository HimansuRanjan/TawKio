import { Router } from "express";
import { getConversations, createConversation } from "../controllers/conversationControllers";
import { isAuthenticated } from "../middlewares/auth"; 

const router = Router();

router.get("/", isAuthenticated, getConversations);
router.post("/", isAuthenticated, createConversation);

export default router;
