import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const createTweet = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;


console.log("req.user:", req.user);
    // Validate required fields
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    //  media upload 
    let mediaUrl = "";

    if (req.file) {

        const uploadResult = await uploadOnCloudinary(req.file.path);
        mediaUrl = uploadResult.url;

    } else {
        throw new ApiError(400, "Media file is required");
    }

    let processedTags = [];
    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        processedTags = tagArray
            .filter(tag => tag.length > 0)  
            .slice(0, 10)
            .map(tag => tag.toLowerCase());
    }

    const tweet = await Tweet.create({
        title,
        content,
        media: mediaUrl,
        tags: processedTags,
        user: req.user._id.toString()   
    });
    return res
    .status(201)
    .json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
});


const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the logged-in user is the owner
    if (!tweet.user || !req.user || !req.user._id) {
    throw new ApiError(403, "Not authorized or tweet/user missing");
} 
    if (tweet.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // Delete the tweet
    await tweet.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
});


const editTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;     
    const { title, content, tags } = req.body;


    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }


    if (!tweet.user || tweet.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this tweet");
    }

    if (title) tweet.title = title;
    if (content) tweet.content = content;
    

    if (tags !== undefined) {
        let processedTags = [];
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
            processedTags = tagArray
                .filter(tag => tag.length > 0)
                .slice(0, 10)
                .map(tag => tag.toLowerCase());
        }
        tweet.tags = processedTags;
    }
    
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        tweet.media = uploadResult.url;
    }

    tweet.edited = true;
    tweet.editedAt = new Date();

    await tweet.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet edited successfully")
    );
});


const searchTweetsByTags = asyncHandler(async (req, res) => {
    const { tags, cursor, batch = 20 } = req.query;

    if (!tags) {
        throw new ApiError(400, "Tags parameter is required");
    }

    // Convert tags to array and normalize
    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim().toLowerCase());
    
    const limit = parseInt(batch) + 1;

    let matchStage = {
        tags: { $in: tagArray }  // Find tweets that have any of the specified tags
    };

    if (cursor) {
        matchStage._id = {
            $lt: new mongoose.Types.ObjectId(cursor)
        };
    }

    const tweets = await Tweet.aggregate([
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
                tags: 1,
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

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                hasMore,
                nextCursor: nextCursor?.toString(),
                searchTags: tagArray
            },
            "Tweets found by tags"
        )
    );
});

const getPopularTags = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;

    const popularTags = await Tweet.aggregate([
        {
            $unwind: "$tags"  // Separate each tag into its own document
        },
        {
            $group: {
                _id: "$tags",
                count: { $sum: 1 }  // Count occurrences of each tag
            }
        },
        {
            $sort: { count: -1 }  // Sort by most popular first
        },
        {
            $limit: parseInt(limit)
        },
        {
            $project: {
                tag: "$_id",
                count: 1,
                _id: 0
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tags: popularTags
            },
            "Popular tags fetched successfully"
        )
    );
});

export {
    createTweet,
    deleteTweet,
    editTweet,
    searchTweetsByTags,
    getPopularTags
}

