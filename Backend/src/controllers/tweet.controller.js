// Import the asyncHandler utility to wrap async functions and handle errors automatically
import { asyncHandler } from "../utils/asyncHandler.js";
// Import the ApiError utility to create standardized error responses
import { ApiError } from "../utils/ApiError.js";
// Import the Tweet model to interact with the tweets collection in the database
import { Tweet } from "../models/tweet.model.js";
// Import the cloudinary utility to handle media file uploads
import { uploadOnCloudinary } from "../utils/cloudinary.js";
// Import the ApiResponse utility to create standardized API responses
import { ApiResponse } from "../utils/ApiResponse.js";
// Import mongoose for MongoDB operations and ObjectId handling
import mongoose from "mongoose";
// Import the User model to interact with the users collection in the database
import { User } from "../models/user.model.js";


// Function to create a new tweet with media upload and tag processing
const createTweet = asyncHandler(async (req, res) => {
    // Extract tweet data from request body
    const { title, content, tags } = req.body;

    // Log user information for debugging purposes
    console.log("req.user:", req.user);
    // Validate that required fields are provided
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    // Initialize media URL variable
    let mediaUrl = "";

    // Check if a media file was uploaded with the request
    if (req.file) {
        // Upload the media file to Cloudinary and get the URL
        const uploadResult = await uploadOnCloudinary(req.file.path);
        mediaUrl = uploadResult.url;
    } else {
        // Throw error if no media file is provided (media is required for tweets)
        throw new ApiError(400, "Media file is required");
    }

    // Process and validate tags if provided
    let processedTags = [];
    if (tags) {
        // Convert tags to array if it's a string (comma-separated)
        const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        // Filter out empty tags, limit to 10 tags, and convert to lowercase
        processedTags = tagArray
            .filter(tag => tag.length > 0)
            .slice(0, 10)
            .map(tag => tag.toLowerCase());
    }

    // Create the tweet in the database with all processed data
    const tweet = await Tweet.create({
        title,
        content,
        media: mediaUrl,
        tags: processedTags,
        user: req.user._id
    });
    // Return success response with the created tweet
    return res
        .status(201)
        .json(
            new ApiResponse(201, tweet, "Tweet created successfully")
        );
});


// Function to delete a tweet with authorization checks
const deleteTweet = asyncHandler(async (req, res) => {
    // Extract tweet ID from request parameters
    const tweetId = req.params.id;

    // Find the tweet in the database
    const tweet = await Tweet.findById(tweetId);
    // Check if tweet exists
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Validate that both tweet user and current user exist
    if (!tweet.user || !req.user || !req.user._id) {
        throw new ApiError(403, "Not authorized or tweet/user missing");
    }
    // Check if the current user is the owner of the tweet
    if (tweet.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // Delete the tweet from the database
    await tweet.deleteOne();

    // Return success response
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Tweet deleted successfully")
        );
});


// Function to edit an existing tweet with authorization checks
const editTweet = asyncHandler(async (req, res) => {
    // Extract tweet ID from request parameters
    const tweetId = req.params.id;
    // Extract updated data from request body
    const { title, content, tags } = req.body;

    // Find the tweet in the database
    const tweet = await Tweet.findById(tweetId);
    // Check if tweet exists
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the current user is the owner of the tweet
    if (!tweet.user || tweet.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this tweet");
    }

    // Update title and content if provided
    if (title) tweet.title = title;
    if (content) tweet.content = content;


    // Process tags if provided (allows clearing tags by passing empty array)
    if (tags !== undefined) {
        let processedTags = [];
        if (tags) {
            // Convert tags to array if it's a string (comma-separated)
            const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
            // Filter out empty tags, limit to 10 tags, and convert to lowercase
            processedTags = tagArray
                .filter(tag => tag.length > 0)
                .slice(0, 10)
                .map(tag => tag.toLowerCase());
        }
        tweet.tags = processedTags;
    }

    // Update media if a new file is uploaded
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        tweet.media = uploadResult.url;
    }

    // Mark tweet as edited and set edit timestamp
    tweet.edited = true;
    tweet.editedAt = new Date();

    // Save the updated tweet to the database
    await tweet.save();

    // Return success response with updated tweet
    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet edited successfully")
        );
});


// Function to search tweets by specific tags with pagination
const searchTweetsByTags = asyncHandler(async (req, res) => {
    // Extract search parameters from query string
    const { tags, cursor, batch = 20 } = req.query;

    // Validate that tags parameter is provided
    if (!tags) {
        throw new ApiError(400, "Tags parameter is required");
    }

    // Process tags: convert to array if string, trim whitespace, and convert to lowercase
    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim().toLowerCase());
    // Set limit for pagination (fetch one extra to check if more exist)
    const limit = parseInt(batch) + 1;

    // Build match stage for MongoDB aggregation
    let matchStage = {
        tags: { $in: tagArray } // Match tweets that contain any of the specified tags
    };

    // Add cursor-based pagination if cursor is provided
    if (cursor) {
        matchStage._id = {
            $lt: new mongoose.Types.ObjectId(cursor) // Get tweets with ID less than cursor
        };
    }

    // Perform MongoDB aggregation to get tweets with user information
    const tweets = await Tweet.aggregate([
        // First stage: lookup user information for each tweet
        {
            $lookup: {
                from: "users", // Collection to lookup from
                localField: "user", // Field in tweets collection
                foreignField: "_id", // Field in users collection
                as: "user", // Output field name
                pipeline: [
                    // Sub-pipeline to project only needed user fields
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            pfp: 1 // Profile picture
                        }
                    }
                ]
            }
        },
        // Second stage: unwind the user array to get a single user object
        {
            $unwind: "$user"
        },
        // Third stage: match tweets based on tags and cursor
        {
            $match: matchStage
        },
        // Fourth stage: sort by creation date (newest first)
        {
            $sort: { createdAt: -1 }
        },
        // Fifth stage: limit the number of results
        {
            $limit: limit
        },
        // Sixth stage: project only the fields we want to return
        {
            $project: {
                title: 1, // Tweet title
                content: 1, // Tweet content
                media: 1, // Media URL
                tags: 1, // Tags array
                likes: { $size: "$likes" }, // Count of likes
                user: 1, // User information
                createdAt: 1 // Creation timestamp
            }
        }
    ]);

    // Check if there are more tweets available for pagination
    const hasMore = tweets.length > batch;

    // Remove the extra tweet we fetched to check for more
    if (hasMore) {
        tweets.pop();
    }

    // Calculate next cursor for pagination (ID of the last tweet)
    const nextCursor = hasMore ? tweets[tweets.length - 1]._id : null;

    // Return success response with tweets, pagination info, and search metadata
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                hasMore,
                nextCursor: nextCursor?.toString(), // Convert ObjectId to string
                searchTags: tagArray // Return the tags that were searched
            },
            "Tweets found by tags"
        )
    );
});

// Function to search content across tweets and users with flexible search types
const searchContent = asyncHandler(async (req, res) => {
    // Extract search parameters from query string
    const { q: query, type = 'all', cursor, batch = 20 } = req.query;

    // Validate that search query is provided and not empty
    if (!query || query.trim() === '') {
        throw new ApiError(400, "Search query is required");
    }

    // Clean and prepare search query
    const searchQuery = query.trim();
    // Set limit for pagination (fetch one extra to check if more exist)
    const limit = parseInt(batch) + 1;
    // Normalize search type to lowercase
    const searchType = type.toLowerCase();

    // Initialize results object to store search results
    let results = {
        tweets: [],
        users: [],
        hasMore: false,
        nextCursor: null
    };

    // Search tweets if type is 'all' or 'tweets'
    if (searchType === 'all' || searchType === 'tweets') {
        // Build match stage for tweet search with multiple search criteria
        let tweetMatchStage = {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } }, // Search in title (case-insensitive)
                { content: { $regex: searchQuery, $options: 'i' } }, // Search in content (case-insensitive)
                { tags: { $in: [new RegExp(searchQuery, 'i')] } } // Search in tags (case-insensitive)
            ]
        };

        // Add cursor-based pagination if cursor is provided
        if (cursor) {
            tweetMatchStage._id = {
                $lt: new mongoose.Types.ObjectId(cursor) // Get tweets with ID less than cursor
            };
        }



        // Perform MongoDB aggregation to search tweets
        const tweets = await Tweet.aggregate([
            // First stage: lookup user information for each tweet
            {
                $lookup: {
                    from: "users", // Collection to lookup from
                    localField: "user", // Field in tweets collection
                    foreignField: "_id", // Field in users collection
                    as: "user", // Output field name
                    pipeline: [
                        // Sub-pipeline to project only needed user fields
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullName: 1,
                                pfp: 1 // Profile picture
                            }
                        }
                    ]
                }
            },
            // Second stage: unwind the user array to get a single user object
            {
                $unwind: "$user"
            },
            // Third stage: match tweets based on search criteria
            {
                $match: tweetMatchStage
            },
            // Fourth stage: sort by creation date (newest first)
            {
                $sort: { createdAt: -1 }
            },
            // Fifth stage: limit the number of results
            {
                $limit: limit
            },
            // Sixth stage: project only the fields we want to return
            {
                $project: {
                    _id: 1, // Tweet ID
                    title: 1, // Tweet title
                    content: 1, // Tweet content
                    media: 1, // Media URL
                    tags: 1, // Tags array
                    likes: { $size: "$likes" }, // Count of likes
                    views: 1, // View count
                    commentCount: 1, // Comment count
                    user: 1, // User information
                    createdAt: 1, // Creation timestamp
                    edited: 1, // Edit flag
                    editedAt: 1 // Edit timestamp
                }
            }
        ]);

        // Store tweet results and handle pagination
        results.tweets = tweets;
        results.hasMore = tweets.length > batch;

        // Remove the extra tweet we fetched to check for more
        if (results.hasMore) {
            results.tweets.pop();
        }

        // Calculate next cursor for pagination (ID of the last tweet)
        results.nextCursor = results.hasMore ? results.tweets[results.tweets.length - 1]._id : null;
    }

    // Search users if type is 'all' or 'users'
    if (searchType === 'all' || searchType === 'users') {
        // Build match stage for user search
        const userMatchStage = {
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } }, // Search in username (case-insensitive)
                { fullName: { $regex: searchQuery, $options: 'i' } } // Search in full name (case-insensitive)
            ]
        };

        // Find users matching the search criteria
        const users = await User.find(userMatchStage)
            .select('username fullName pfp joinedAt') // Select only needed fields
            .limit(10) // Limit to 10 users
            .sort({ joinedAt: -1 }); // Sort by join date (newest first)

        results.users = users;
    }

    // Return success response with all search results and metadata
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...results, // Spread all results (tweets, users, hasMore, nextCursor)
                searchQuery, // Original search query
                searchType, // Type of search performed
                totalResults: results.tweets.length + results.users.length // Total number of results
            },
            "Search completed successfully"
        )
    );
});

// Function to get the most popular tags based on usage frequency
const getPopularTags = asyncHandler(async (req, res) => {
    // Extract limit parameter from query string (default 20)
    const { limit = 20 } = req.query;

    // Perform MongoDB aggregation to count tag usage
    const popularTags = await Tweet.aggregate([
        // First stage: unwind tags array to create separate documents for each tag
        {
            $unwind: "$tags"
        },
        // Second stage: group by tag and count occurrences
        {
            $group: {
                _id: "$tags", // Group by tag name
                count: { $sum: 1 } // Count occurrences of each tag
            }
        },
        // Third stage: sort by count in descending order (most popular first)
        {
            $sort: { count: -1 }
        },
        // Fourth stage: limit the number of results
        {
            $limit: parseInt(limit)
        },
        // Fifth stage: reshape the output format
        {
            $project: {
                tag: "$_id", // Rename _id to tag
                count: 1, // Include count
                _id: 0 // Exclude the original _id field
            }
        }
    ]);

    // Return success response with popular tags
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

// Export all tweet controller functions for use in routes
export {
    createTweet, // Create new tweet with media upload
    deleteTweet, // Delete tweet with authorization check
    editTweet, // Edit existing tweet with authorization check
    searchTweetsByTags, // Search tweets by specific tags
    searchContent, // Search content across tweets and users
    getPopularTags // Get most popular tags by usage
}

