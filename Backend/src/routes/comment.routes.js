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




router.use(verifyJWT);

router.post("/tweets/:tweetId/comments", createComment);
router.get("/tweets/:tweetId/comments", getCommentsByTweet);
router.get("/tweets/:tweetId/comments/count", getCommentCount);
router.patch("/comments/:commentId", editComment);
router.delete("/comments/:commentId", deleteComment);
router.post("/comments/:commentId/like", likeComment);

export default router; 