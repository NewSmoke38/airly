import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
             throw new ApiError(404, "Parent comment not found");
        }
        if (parentComment.tweet.toString() !== tweetId) {
    throw new ApiError(400,  "Parent comment doesn't belong to this tweet");
        }
    }

    const comment = await Comment.create({
        content: content.trim(),
        user: req.user._id,
        tweet: tweetId,
        parentComment: parentCommentId || null
    });

    if (parentCommentId) {
        await Comment.findByIdAndUpdate(
            parentCommentId,
            { 
                $inc: { replyCount: 1 },  
                $push: { replies: comment._id }
            }
        );
    }

    await Tweet.findByIdAndUpdate(
        tweetId,
        { $inc: { commentCount: 1 } }
    );

    const populatedComment = await Comment.findById(comment._id)
        .populate("user", "username fullName pfp")
        .populate("parentComment", "content user")
        .populate({
            path: "parentComment",
            populate: {
                path: "user",
                select: "username fullName pfp"
            }
        });

    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment created successfully")
    );
});

const getCommentsByTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { cursor, batch = 10, parentCommentId = null } = req.query;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    let matchStage = { 
        tweet: new mongoose.Types.ObjectId(tweetId),
        parentComment: parentCommentId ? new mongoose.Types.ObjectId(parentCommentId) : null
    };
    
    if (cursor) {
        matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const comments = await Comment.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $limit: parseInt(batch) + 1 },
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
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: false } },
        {
            $lookup: {
                from: "users",
                localField: "likes",
                foreignField: "_id",
                as: "likedBy",
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
            $project: {
                content: 1,
                user: 1,
                likes: { $size: "$likes" },
                likedBy: 1,
                replyCount: 1,
                edited: 1,
                editedAt: 1,
                createdAt: 1,
                parentComment: 1
            }
        }
    ]);

    const hasMore = comments.length > batch;
    const nextCursor = hasMore ? comments[comments.length - 2]._id : null;

    if (hasMore) {
        comments.pop();
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                hasMore,
                nextCursor: nextCursor?.toString()
            },
            "Comments fetched successfully"
        )
    );
});



const getCommentCount = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const count = await Comment.countDocuments({ 
        tweet: new mongoose.Types.ObjectId(tweetId),
        parentComment: null 
    });

    return res.status(200).json(
        new ApiResponse(200, { count }, "Comment count fetched successfully")
    );
});

    const editComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own comments");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            content: content.trim(),
            edited: true,
            editedAt: new Date()
        },
        { new: true }
    ).populate("user", "username fullName pfp");

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

    const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You can only delete your own comments");
    }

    if (comment.parentComment) {
        await Comment.findByIdAndUpdate(
            comment.parentComment,
            { 
                $inc: { replyCount: -1 },
                $pull: { replies: comment._id }
            }
        );
    }

    await Tweet.findByIdAndUpdate(
        comment.tweet,
        { $inc: { commentCount: -1 } }
    );

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

    const likeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
        await Comment.findByIdAndUpdate(
            commentId,
            { $pull: { likes: userId } }
        );
    } else {
        await Comment.findByIdAndUpdate(
            commentId,
            { $addToSet: { likes: userId } }
        );
    }

    const updatedComment = await Comment.findById(commentId)
        .populate("user", "username fullName pfp");

    return res.status(200).json(
 new ApiResponse(
            200, 
            { 
                comment: updatedComment,

                liked: !isLiked 
            },
            `Comment ${isLiked ? 'unliked' : 'liked'} successfully`
        )
    );
});

export {
    createComment,
    getCommentsByTweet,
    getCommentCount,
    editComment,
    deleteComment,
    likeComment
                 }; 