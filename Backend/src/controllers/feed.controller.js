import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const getFeedPosts = asyncHandler(async (req, res) => {
    const { cursor, batch = 20, tag } = req.query;
    const userId = req.user?._id; // Get current user ID if authenticated

    const limit = parseInt(batch) + 1;

    let matchStage = {};
    if (cursor) {
        matchStage = {
            _id: {
                $lt: new mongoose.Types.ObjectId(cursor)
            }
        };
    }

    // Add tag filtering
    if (tag) {
        matchStage.tags = {
            $in: [tag]
        };
    }

    try {
        const posts = await Tweet.aggregate([
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
                $match: matchStage
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: limit
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
                    commentCount: { $ifNull: ["$commentCount", 0] },
                    likesArray: { $ifNull: ["$likes", []] },
                    bookmarksArray: { $ifNull: ["$bookmarkedBy", []] },
                    user: 1,
                    createdAt: 1
                }
            }
        ]);

        if (userId) {
            posts.forEach(post => {
                post.isLiked = post.likesArray.some(likeId => likeId.toString() === userId.toString());
                post.isBookmarked = post.bookmarksArray.some(bookmarkId => bookmarkId.toString() === userId.toString());
                delete post.likesArray;
                delete post.bookmarksArray;
            });
        } else {
            posts.forEach(post => {
                post.isLiked = false;
                post.isBookmarked = false;
                delete post.likesArray;
                delete post.bookmarksArray;
            });
        }

        const hasMore = posts.length > batch;

        if (hasMore) {
            posts.pop();
        }

        const nextCursor = hasMore ? posts[posts.length - 1]._id : null;

        const totalPosts = await Tweet.countDocuments();
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    posts,
                    hasMore,
                    nextCursor: nextCursor?.toString()
                },
                "Feed posts fetched successfully"
            )
        );
    } catch (error) {
        console.error("Feed aggregation error:", error);
        return res.status(500).json(
            new ApiResponse(
                500,
                {
                    posts: [],
                    hasMore: false,
                    nextCursor: null
                },
                "Failed to fetch feed posts"
            )
        );
    }
});

export {
    getFeedPosts
}; 