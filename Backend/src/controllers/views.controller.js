import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

// Increment view count for a tweet
const incrementView = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id; // Optional - can be null for anonymous views

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Increment view count
    tweet.views += 1;

    // If user is logged in, add them to viewedBy array (if not already there)
    if (userId) {
        const alreadyViewed = tweet.viewedBy.some(id => id.toString() === userId.toString());
        if (!alreadyViewed) {
            tweet.viewedBy.push(userId);
        }
    }

    await tweet.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { views: tweet.views },
                "View count incremented successfully"
            )
        );
});

// Get view count for a tweet
const getViewCount = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId).select("views");
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { views: tweet.views },
                "View count fetched successfully"
            )
        );
});

// Get most viewed tweets
const getMostViewedTweets = asyncHandler(async (req, res) => {
    const { limit = 10, cursor } = req.query;

    let matchStage = {};
    if (cursor) {
        matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const tweets = await Tweet.aggregate([
        {
            $match: matchStage
        },
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
        {
            $unwind: "$user"
        },
        {
            $sort: { views: -1, createdAt: -1 }
        },
        {
            $limit: parseInt(limit) + 1
        },
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                tags: 1,
                views: 1,
                likes: { $size: "$likes" },
                user: 1,
                createdAt: 1
            }
        }
    ]);

    const hasMore = tweets.length > limit;
    if (hasMore) {
        tweets.pop();
    }

    const nextCursor = hasMore ? tweets[tweets.length - 1]._id : null;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tweets,
                    hasMore,
                    nextCursor: nextCursor?.toString()
                },
                "Most viewed tweets fetched successfully"
            )
        );
});

// Get user's viewed tweets
const getUserViewedTweets = asyncHandler(async (req, res) => {
    const { cursor, batch = 12 } = req.query;
    const userId = req.user._id;

    let matchStage = { viewedBy: userId };
    if (cursor) {
        matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const tweets = await Tweet.aggregate([
        {
            $match: matchStage
        },
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
        {
            $unwind: "$user"
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $limit: parseInt(batch) + 1
        },
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                tags: 1,
                views: 1,
                likes: { $size: "$likes" },
                user: 1,
                createdAt: 1
            }
        }
    ]);

    const hasMore = tweets.length > batch;
    if (hasMore) {
        tweets.pop();
    }

    const nextCursor = hasMore ? tweets[tweets.length - 1]._id : null;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    tweets,
                    hasMore,
                    nextCursor: nextCursor?.toString()
                },
                "User's viewed tweets fetched successfully"
            )
        );
});

export {
    incrementView,
    getViewCount,
    getMostViewedTweets,
    getUserViewedTweets
}; 