import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const getFeedPosts = asyncHandler(async (req, res) => {
    const { sort = 'recent' } = req.query;

    switch (sort) {
        case 'popular':
            return getPopularPosts(req, res);
        case 'liked':
            return getMostLikedPosts(req, res);
        case 'recent':
        default:
            return getRecentPosts(req, res);
    }
});

const getRecentPosts = asyncHandler(async (req, res) => {
    const { cursor, batch = 20, tag } = req.query;
    const userId = req.user?._id;

    const limit = parseInt(batch) + 1;

    let matchStage = {};
    if (cursor) {
        matchStage = {
            _id: {
                $lt: new mongoose.Types.ObjectId(cursor)
            }
        };
    }

    if (tag) {
        matchStage.tags = {
            $in: [tag]
        };
    }

    try {
        const posts = await Tweet.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            ...getCommonFeedPipeline()
        ]);

        const { finalPosts, nextCursor } = processPostsForRecent(posts, batch, userId);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    posts: finalPosts,
                    hasMore: !!nextCursor,
                    nextCursor
                },
                "Recent feed posts fetched successfully"
            )
        );
    } catch (error) {
        console.error("Recent feed aggregation error:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to fetch recent feed posts"));
    }
});

const getMostLikedPosts = asyncHandler(async (req, res) => {
    const { cursor, batch = 20, tag } = req.query;
    const userId = req.user?._id;

    const limit = parseInt(batch);
    const skip = cursor ? parseInt(cursor) : 0;

    let matchStage = {};
    if (tag) {
        matchStage.tags = {
            $in: [tag]
        };
    }

    try {
        const posts = await Tweet.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$likes", []] } }
                }
            },
            { $sort: { likeCount: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            ...getCommonFeedPipeline()
        ]);

        const finalPosts = processPosts(posts, userId);
        const hasMore = finalPosts.length === limit;
        const nextCursor = hasMore ? (skip + finalPosts.length).toString() : null;

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    posts: finalPosts,
                    hasMore,
                    nextCursor
                },
                "Most liked feed posts fetched successfully"
            )
        );
    } catch (error) {
        console.error("Most liked feed aggregation error:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to fetch most liked feed posts"));
    }
});

const getPopularPosts = asyncHandler(async (req, res) => {
    const { cursor, batch = 20, tag } = req.query;
    const userId = req.user?._id;

    const limit = parseInt(batch);
    const skip = cursor ? parseInt(cursor) : 0;

    let matchStage = {};
    if (tag) {
        matchStage.tags = {
            $in: [tag]
        };
    }

    try {
        const posts = await Tweet.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$likes", []] } },
                    comments: { $ifNull: ["$commentCount", 0] },
                    viewsCount: { $ifNull: ["$views", 0] }
                }
            },
            {
                $addFields: {
                    popularityScore: {
                        $add: [
                            { $multiply: ["$likeCount", 2] },
                            "$comments",
                            { $multiply: ["$viewsCount", 0.5] }
                        ]
                    }
                }
            },
            { $sort: { popularityScore: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            ...getCommonFeedPipeline()
        ]);

        const finalPosts = processPosts(posts, userId);
        const hasMore = finalPosts.length === limit;
        const nextCursor = hasMore ? (skip + finalPosts.length).toString() : null;


        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    posts: finalPosts,
                    hasMore,
                    nextCursor
                },
                "Popular feed posts fetched successfully"
            )
        );
    } catch (error) {
        console.error("Popular feed aggregation error:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to fetch popular feed posts"));
    }
});

const getCommonFeedPipeline = () => {
    return [
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
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
            $project: {
                title: 1,
                content: 1,
                media: 1,
                tags: { $ifNull: ["$tags", []] },
                views: { $ifNull: ["$views", 0] },
                likes: { $size: { $ifNull: ["$likes", []] } },
                bookmarkCount: { $size: { $ifNull: ["$bookmarkedBy", []] } },
                comments: { $ifNull: ["$commentCount", 0] },
                likesArray: { $ifNull: ["$likes", []] },
                bookmarksArray: { $ifNull: ["$bookmarkedBy", []] },
                user: 1,
                createdAt: 1,
                popularityScore: { $ifNull: ["$popularityScore", 0] },
                likeCount: { $ifNull: ["$likeCount", 0] }
            }
        }
    ];
};

const processPosts = (posts, userId) => {
    return posts.map(post => {
        const isLiked = userId ? post.likesArray.some(likeId => likeId.toString() === userId.toString()) : false;
        const isBookmarked = userId ? post.bookmarksArray.some(bookmarkId => bookmarkId.toString() === userId.toString()) : false;

        const { likesArray, bookmarksArray, ...rest } = post;

        return {
            ...rest,
            isLiked,
            isBookmarked
        };
    });
};

const processPostsForRecent = (posts, batch, userId) => {
    const hasMore = posts.length > batch;
    if (hasMore) {
        posts.pop();
    }

    const finalPosts = processPosts(posts, userId);
    const nextCursor = hasMore && finalPosts.length > 0 ? finalPosts[finalPosts.length - 1]._id.toString() : null;

    return { finalPosts, nextCursor };
};

export {
    getFeedPosts
}; 