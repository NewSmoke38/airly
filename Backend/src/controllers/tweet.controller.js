import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";


const createTweet = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;


console.log("req.user:", req.user);
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

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

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (!tweet.user || !req.user || !req.user._id) {
    throw new ApiError(403, "Not authorized or tweet/user missing");
} 
    if (tweet.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

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

    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim().toLowerCase());
    const limit = parseInt(batch) + 1;

    let matchStage = {
        tags: { $in: tagArray }  
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

const searchContent = asyncHandler(async (req, res) => {
    const { q: query, type = 'all', cursor, batch = 20 } = req.query;

    if (!query || query.trim() === '') {
        throw new ApiError(400, "Search query is required");
    }

    const searchQuery = query.trim();
    const limit = parseInt(batch) + 1;
    const searchType = type.toLowerCase();

    let results = {
        tweets: [],
        users: [],
        hasMore: false,
        nextCursor: null
    };

    if (searchType === 'all' || searchType === 'tweets') {
        let tweetMatchStage = {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } }
            ]
        };

        if (cursor) {
            tweetMatchStage._id = {
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
                $match: tweetMatchStage
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: 1,
                    media: 1,
                    tags: 1,
                    likes: { $size: "$likes" },
                    views: 1,
                    commentCount: 1,
                    user: 1,
                    createdAt: 1,
                    edited: 1,
                    editedAt: 1
                }
            }
        ]);

        results.tweets = tweets;
        results.hasMore = tweets.length > batch;
        
        if (results.hasMore) {
            results.tweets.pop();
        }
        
        results.nextCursor = results.hasMore ? results.tweets[results.tweets.length - 1]._id : null;
    }

    if (searchType === 'all' || searchType === 'users') {
        const userMatchStage = {
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { fullName: { $regex: searchQuery, $options: 'i' } }
            ]
        };

        const users = await User.find(userMatchStage)
        .select('username fullName pfp joinedAt')
        .limit(10)
            .sort({ joinedAt: -1 });

        results.users = users;
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...results,
                searchQuery,
                searchType,
                totalResults: results.tweets.length + results.users.length
            },
         "Search completed successfully"
       
        )
    );
});

const getPopularTags = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;

    const popularTags = await Tweet.aggregate([
        {
            $unwind: "$tags" 
        },
        {
            $group: {
                _id: "$tags",
                count: { $sum: 1 } 
            }
        },
        {
            $sort: { count: -1 }  
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
    searchContent,
    getPopularTags
   }

