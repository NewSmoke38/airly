import { Router } from "express";
import { 
    createComment, 
    getCommentsByTweet, 
    editComment, 
    deleteComment, 
    likeComment, 
    getCommentCount 
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes - can view comments without authentication (optional auth for better UX)
router.get("/tweets/:tweetId/comments", getCommentsByTweet);
router.get("/tweets/:tweetId/comments/count", getCommentCount);

// Protected routes - require authentication for actions
router.use(verifyJWT);

router.post("/tweets/:tweetId/comments", createComment);
router.patch("/comments/:commentId", editComment);
router.delete("/comments/:commentId", deleteComment);
router.post("/comments/:commentId/like", likeComment);

export default router; 