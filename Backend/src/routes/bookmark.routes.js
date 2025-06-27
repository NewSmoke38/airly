import { Router } from "express";
import { 
    toggleBookmark, 
    getBookmarkCount, 
    checkUserBookmarked, 
    getMostBookmarkedTweets, 
    getUserBookmarkedTweets,
    getTweetBookmarkers
} from "../controllers/bookmark.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * BOOKMARK ROUTES
 * 
 * This file defines all bookmark-related API endpoints:
 * - Core bookmark operations (add/remove, check status)
 * - Bookmark analytics (counts, trending)
 * - User bookmark management (view bookmarks)
 * - Social features (see who bookmarked)
 */

// ========================================
// CORE BOOKMARK OPERATIONS
// ========================================

/**
 * POST /api/v1/bookmarks/tweets/:tweetId/bookmark
 * Toggle bookmark status for a tweet
 * - Adds bookmark if not bookmarked
 * - Removes bookmark if already bookmarked
 * - Requires authentication
 * - Returns: { bookmarked: boolean, bookmarkCount: number }
 */
router.post("/tweets/:tweetId/bookmark", verifyJWT, toggleBookmark);

/**
 * GET /api/v1/bookmarks/tweets/:tweetId/bookmarks
 * Get bookmark count for a specific tweet
 * - Public endpoint (no authentication required)
 * - Returns: { bookmarkCount: number }
 */
router.get("/tweets/:tweetId/bookmarks", getBookmarkCount);

/**
 * GET /api/v1/bookmarks/tweets/:tweetId/bookmarked
 * Check if authenticated user has bookmarked a tweet
 * - Requires authentication
 * - Returns: { bookmarked: boolean }
 */
router.get("/tweets/:tweetId/bookmarked", verifyJWT, checkUserBookmarked);

// ========================================
// BOOKMARK ANALYTICS & DISCOVERY
// ========================================

/**
 * GET /api/v1/bookmarks/tweets/most-bookmarked
 * Get most bookmarked tweets (trending content)
 * - Public endpoint
 * - Supports pagination with cursor
 * - Query params: limit (default: 10), cursor
 * - Returns: { tweets: [], hasMore: boolean, nextCursor: string }
 */
router.get("/tweets/most-bookmarked", getMostBookmarkedTweets);

/**
 * GET /api/v1/bookmarks/user/bookmarked-tweets
 * Get all tweets bookmarked by the authenticated user
 * - Requires authentication
 * - Supports pagination with cursor
 * - Query params: batch (default: 12), cursor
 * - Returns: { tweets: [], hasMore: boolean, nextCursor: string }
 */
router.get("/user/bookmarked-tweets", verifyJWT, getUserBookmarkedTweets);

/**
 * GET /api/v1/bookmarks/tweets/:tweetId/bookmarkers
 * Get users who bookmarked a specific tweet
 * - Public endpoint
 * - Supports pagination
 * - Query params: limit (default: 20), cursor
 * - Returns: { bookmarkers: [], hasMore: boolean, nextCursor: number, totalBookmarks: number }
 */
router.get("/tweets/:tweetId/bookmarkers", getTweetBookmarkers);

export default router; 