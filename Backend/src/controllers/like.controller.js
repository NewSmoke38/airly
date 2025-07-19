import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const likeTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // toggle
    const alreadyLiked = tweet.likes.some(id => id.toString() === userId.toString());
    if (alreadyLiked) {
        tweet.likes = tweet.likes.filter(id => id.toString() !== userId.toString());
        await tweet.save();
        return res.status(200).json(
            new ApiResponse(
                200,
                { 
                    liked: false, 
                    likeCount: tweet.likes.length 
                },
                "Tweet unliked successfully"
            )
        );
    } else {
        tweet.likes.push(userId);
        await tweet.save();
        return res.status(200).json(
            new ApiResponse(
                200,
                { 
                    liked: true, 
                    likeCount: tweet.likes.length 
                },
                "Tweet liked successfully"
            )
        );
    }
});

const getLikeCount = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;

    const tweet = await Tweet.findById(tweetId).select("likes");
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { likeCount: tweet.likes.length },
            "Like count fetched successfully"
        )
    );
});

const checkUserLiked = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    const tweet = await Tweet.findById(tweetId).select("likes");
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const hasLiked = tweet.likes.some(id => id.toString() === userId.toString());

    return res.status(200).json(
        new ApiResponse(
            200,
            { liked: hasLiked },
            "Like status checked successfully"
        )
    );
});

const getMostLikedTweets = asyncHandler(async (req, res) => {
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
            $sort: { "likes": -1, createdAt: -1 }
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
                likeCount: { $size: "$likes" },
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

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                hasMore,
                nextCursor: nextCursor?.toString()
            },
            "Most liked tweets fetched successfully"
        )
    );
});

const getUserLikedTweets = asyncHandler(async (req, res) => {
    const { cursor, batch = 12 } = req.query;
    const userId = req.user._id;

    let matchStage = { likes: userId };
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
                likeCount: { $size: "$likes" },
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

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                hasMore,
                nextCursor: nextCursor?.toString()
            },
            "User's liked tweets fetched successfully"
        )
    );
});

const getTweetLikers = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;
    const { limit = 20, cursor } = req.query;

    const tweet = await Tweet.findById(tweetId).populate({
        path: 'likes',
        select: 'username fullName pfp',
        options: {
            limit: parseInt(limit) + 1,
            ...(cursor && { skip: parseInt(cursor) })
        }
    });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const hasMore = tweet.likes.length > limit;
    const likers = hasMore ? tweet.likes.slice(0, -1) : tweet.likes;
    const nextCursor = hasMore ? parseInt(cursor || 0) + limit : null;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                likers,
                hasMore,
                nextCursor,
                totalLikes: tweet.likes.length
            },
            "Tweet likers fetched successfully"
        )
    );
});

export    {
    likeTweet,
    getLikeCount,
    checkUserLiked,
    getMostLikedTweets,
    getUserLikedTweets,
    getTweetLikers
 };