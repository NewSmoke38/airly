import { Router } from "express";
import { 
    likeTweet, 
    getLikeCount, 
    checkUserLiked, 
    getMostLikedTweets, 
    getUserLikedTweets,
    getTweetLikers
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Like/Unlike a tweet
router.post("/tweets/:id/like", verifyJWT, likeTweet);

// Get like count for a tweet (public)
router.get("/tweets/:id/likes", getLikeCount);

// Check if user has liked a tweet
router.get("/tweets/:id/liked", verifyJWT, checkUserLiked);

// Get most liked tweets (public)
router.get("/tweets/most-liked", getMostLikedTweets);

// Get user's liked tweets
router.get("/user/liked-tweets", verifyJWT, getUserLikedTweets);

// Get users who liked a specific tweet
router.get("/tweets/:id/likers", getTweetLikers);

export default router; 