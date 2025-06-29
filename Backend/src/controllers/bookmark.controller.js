import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const toggleBookmark = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const alreadyBookmarked = tweet.bookmarkedBy.some(
        id => id.toString() === userId.toString()
    );

    if (alreadyBookmarked) {
        tweet.bookmarkedBy = tweet.bookmarkedBy.filter(
            id => id.toString() !== userId.toString()
        );
        await tweet.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { 
                    bookmarked: false, 
                    bookmarkCount: tweet.bookmarkedBy.length 
                },
                "Bookmark removed successfully"
            )
        );
    } else {
        tweet.bookmarkedBy.push(userId);
        await tweet.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { 
                    bookmarked: true, 
                    bookmarkCount: tweet.bookmarkedBy.length 
                },
                "Tweet bookmarked successfully"
            )
        );
    }
});

const checkUserBookmarked = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    const tweet = await Tweet.findById(tweetId).select("bookmarkedBy");
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const hasBookmarked = tweet.bookmarkedBy.some(
        id => id.toString() === userId.toString()
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            { bookmarked: hasBookmarked },
            "Bookmark status checked successfully"
        )
    );
});

const getMostBookmarkedTweets = asyncHandler(async (req, res) => {
    // Extract query parameters with defaults
    const { limit = 10, cursor } = req.query;

    // Build match stage for pagination
    let matchStage = {};
    if (cursor) {
        matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    // Aggregate pipeline to get most bookmarked tweets
    const tweets = await Tweet.aggregate([
        // Step 1: Match tweets based on cursor (for pagination)
        {
            $match: matchStage
        },
        // Step 2: Join with users collection to get user details
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            pfp: 1
                        }
                    }
                ]
            }
        },
        // Step 3: Unwind the user array (since lookup returns an array)
        {
            $unwind: "$user"
        },
        // Step 4: Sort by bookmark count (descending) then by creation date
        {
            $sort: { 
                "bookmarkedBy": -1,  // Most bookmarked first
                createdAt: -1        // Newer tweets first if same bookmark count
            }
        },
        // Step 5: Limit results (add 1 extra for pagination check)
        {
            $limit: parseInt(limit) + 1
        },
        // Step 6: Project only the fields we need
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                tags: 1,
                views: 1,
                bookmarkCount: { $size: "$bookmarkedBy" }, // Calculate bookmark count
                likeCount: { $size: "$likes" },           // Include like count too
                user: 1,
                createdAt: 1
            }
        }
    ]);

    // Handle pagination
    const hasMore = tweets.length > limit;
    if (hasMore) {
        tweets.pop(); // Remove the extra tweet we fetched
    }

    // Get cursor for next page
    const nextCursor = hasMore ? tweets[tweets.length - 1]._id : null;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                hasMore,
                nextCursor: nextCursor?.toString()
            },
            "Most bookmarked tweets fetched successfully"
        )
    );
});

/**
 * Get all tweets bookmarked by the authenticated user
 * Requires authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user's bookmarked tweets
 */
const getUserBookmarkedTweets = asyncHandler(async (req, res) => {
    // Extract query parameters
    const { cursor, batch = 12 } = req.query;
    const userId = req.user._id;

    // Build match stage - find tweets bookmarked by this user
    let matchStage = { bookmarkedBy: userId };
    if (cursor) {
        matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    // Aggregate pipeline to get user's bookmarked tweets
    const tweets = await Tweet.aggregate([
        // Step 1: Match tweets bookmarked by this user
        {
            $match: matchStage
        },
        // Step 2: Join with users collection
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            pfp: 1
                        }
                    }
                ]
            }
        },
        // Step 3: Unwind user array
        {
            $unwind: "$user"
        },
        // Step 4: Sort by when user bookmarked (most recent first)
        {
            $sort: { createdAt: -1 }
        },
        // Step 5: Limit results
        {
            $limit: parseInt(batch) + 1
        },
        // Step 6: Project needed fields
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                tags: 1,
                views: 1,
                bookmarkCount: { $size: "$bookmarkedBy" },
                likeCount: { $size: "$likes" },
                user: 1,
                createdAt: 1
            }
        }
    ]);

    // Handle pagination
    const hasMore = tweets.length > batch;
    if (hasMore) {
        tweets.pop();
    }

    const nextCursor = hasMore ? tweets[tweets.length - 1]._id : null;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                hasMore,
                nextCursor: nextCursor?.toString()
            },
            "User's bookmarked tweets fetched successfully"
        )
    );
});

/**
 * Get users who bookmarked a specific tweet
 * Public endpoint - shows who bookmarked a particular tweet
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with users who bookmarked the tweet
 */
const getTweetBookmarkers = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { limit = 20, cursor } = req.query;

    // Validate tweetId
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    // Find tweet and populate bookmarkedBy with user details
    const tweet = await Tweet.findById(tweetId).populate({
        path: 'bookmarkedBy',
        select: 'username fullName pfp', // Only get essential user info
        options: {
            limit: parseInt(limit) + 1,
            ...(cursor && { skip: parseInt(cursor) })
        }
    });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Handle pagination
    const hasMore = tweet.bookmarkedBy.length > limit;
    const bookmarkers = hasMore ? tweet.bookmarkedBy.slice(0, -1) : tweet.bookmarkedBy;
    const nextCursor = hasMore ? parseInt(cursor || 0) + limit : null;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                bookmarkers,
                hasMore,
                nextCursor,
                totalBookmarks: tweet.bookmarkedBy.length
            },
            "Tweet bookmarkers fetched successfully"
        )
    );
});
const getBookmarkCount = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    const tweet = await Tweet.findById(tweetId).select('bookmarkedBy');
    
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const bookmarkCount = tweet.bookmarkedBy.length;

    return res.status(200).json(
        new ApiResponse(
            200,
            { bookmarkCount },
            "Bookmark count fetched successfully"
        )
    );
});

// Export all bookmark controller functions
export {
    toggleBookmark,
    getBookmarkCount,
    checkUserBookmarked,
    getMostBookmarkedTweets,
    getUserBookmarkedTweets,
    getTweetBookmarkers
}; 