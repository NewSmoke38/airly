import { Router } from "express";
import { 
    incrementView, 
    getViewCount, 
    getMostViewedTweets, 
    getUserViewedTweets 
} from "../controllers/views.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Increment view count (can be called by both authenticated and anonymous users)
router.post("/tweets/:tweetId/view", incrementView);

// Get view count for a specific tweet
router.get("/tweets/:tweetId/views", getViewCount);

// Get most viewed tweets (public endpoint)
router.get("/tweets/most-viewed", getMostViewedTweets);

// Get user's viewed tweets (requires authentication)
router.get("/user/viewed-tweets", verifyJWT, getUserViewedTweets);

export default router; 