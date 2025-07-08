// Import the asyncHandler utility to wrap async functions and handle errors automatically
import { asyncHandler } from "../utils/asyncHandler.js";
// Import the ApiResponse utility to create standardized API responses
import { ApiResponse } from "../utils/ApiResponse.js";
// Import the Tweet model to interact with the tweets collection in the database
import { Tweet } from "../models/tweet.model.js";
// Import mongoose for MongoDB operations and ObjectId handling
import mongoose from "mongoose";

// Main function to get feed posts with different sorting options
const getFeedPosts = asyncHandler(async (req, res) => {
    // Extract the sort parameter from query string, default to 'recent' if not provided
    const { sort = 'recent'} = req.query;

    // Use switch statement to route to different sorting functions based on the sort parameter
    switch (sort) {
        case 'popular':
            // If sort is 'popular', call the function to get posts sorted by popularity
            return getPopularPosts(req, res);
        case 'liked':
            // If sort is 'liked', call the function to get posts sorted by most likes
            return getMostLikedPosts(req, res);
        case 'recent':
        default:
            // If sort is 'recent' or any other value, call the function to get recent posts
            return getRecentPosts(req, res);
    }
});

// Function to get recent posts sorted by creation date (newest first)
const getRecentPosts = asyncHandler(async (req, res) => {
    // Extract query parameters: cursor for pagination, batch size (default 20), and optional tag filter
    const { cursor, batch = 20, tag } = req.query;
    // Get the current user's ID from the authenticated request
    const userId = req.user?._id;

    // Set limit to batch size + 1 to check if there are more posts available
    const limit = parseInt(batch) + 1;

    // Initialize match stage for MongoDB aggregation
    let matchStage = {};
    // If cursor is provided, add condition to get posts with ID less than cursor (for pagination)
    if (cursor) {
        matchStage = {
            _id: {
                $lt: new mongoose.Types.ObjectId(cursor)
            }
        };
    }

    // If tag is provided, add condition to filter posts by specific tag
    if (tag) {
        matchStage.tags = {
            $in: [tag]
        };
    }

    // Wrap the aggregation in try-catch to handle potential errors
    try {
        // Perform MongoDB aggregation to get posts with all necessary data
        const posts = await Tweet.aggregate([
            // First stage: match posts based on cursor and tag filters
            { $match: matchStage },
            // Second stage: sort by creation date (newest first)
            { $sort: { createdAt: -1 } },
            // Third stage: limit the number of results
            { $limit: limit },
            // Fourth stage: add common pipeline stages (user lookup, projections, etc.)
            ...getCommonFeedPipeline()
        ]);

        // Process the posts to add user-specific data (like status, bookmark status) and handle pagination
        const { finalPosts, nextCursor } = processPostsForRecent(posts, batch, userId);

        // Return successful response with posts, pagination info, and success message
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    posts: finalPosts,
                    hasMore: !!nextCursor, // Convert nextCursor to boolean to indicate if more posts exist
                    nextCursor
                },
                "Recent feed posts fetched successfully"
            )
        );
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Recent feed aggregation error:", error);
        // Return error response if aggregation fails
        return res.status(500).json(new ApiResponse(500, null, "Failed to fetch recent feed posts"));
    }
});

// Function to get posts sorted by most likes
const getMostLikedPosts = asyncHandler(async (req, res) => {
    // Extract query parameters: cursor for pagination, batch size (default 20), and optional tag filter
    const { cursor, batch = 20, tag } = req.query;
    // Get the current user's ID from the authenticated request
    const userId = req.user?._id;

    // Parse batch size to integer for limit
    const limit = parseInt(batch);
    // Calculate skip value for pagination (cursor represents the number of posts to skip)
    const skip = cursor ? parseInt(cursor) : 0;

    // Initialize match stage for MongoDB aggregation
    let matchStage = {};
    // If tag is provided, add condition to filter posts by specific tag
    if (tag) {
        matchStage.tags = {
            $in: [tag]
        };
    }

    // Wrap the aggregation in try-catch to handle potential errors
    try {
        // Perform MongoDB aggregation to get posts sorted by like count
        const posts = await Tweet.aggregate([
            // First stage: match posts based on tag filter
            { $match: matchStage },
            // Second stage: add a field to count the number of likes
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$likes", []] } }
                }
            },
            // Third stage: sort by like count (descending) and then by creation date
            { $sort: { likeCount: -1, createdAt: -1 } },
            // Fourth stage: skip posts for pagination
            { $skip: skip },
            // Fifth stage: limit the number of results
            { $limit: limit },
            // Sixth stage: add common pipeline stages
            ...getCommonFeedPipeline()
        ]);

        // Process the posts to add user-specific data
        const finalPosts = processPosts(posts, userId);
        // Check if there are more posts available
        const hasMore = finalPosts.length === limit;
        // Calculate next cursor for pagination
        const nextCursor = hasMore ? (skip + finalPosts.length).toString() : null;

        // Return successful response with posts, pagination info, and success message
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
        // Log the error for debugging purposes
        console.error("Most liked feed aggregation error:", error);
        // Return error response if aggregation fails
        return res.status(500).json(new ApiResponse(500, null, "Failed to fetch most liked feed posts"));
    }
});

// Function to get posts sorted by popularity score (combination of likes, comments, and views)
const getPopularPosts = asyncHandler(async (req, res) => {
    // Extract query parameters: cursor for pagination, batch size (default 20), and optional tag filter
    const { cursor, batch = 20, tag } = req.query;
    // Get the current user's ID from the authenticated request
    const userId = req.user?._id;

    // Parse batch size to integer for limit
    const limit = parseInt(batch);
    // Calculate skip value for pagination
    const skip = cursor ? parseInt(cursor) : 0;

    // Initialize match stage for MongoDB aggregation
    let matchStage = {};
    // If tag is provided, add condition to filter posts by specific tag
    if (tag) {
        matchStage.tags = {
            $in: [tag]
        };
    }

    // Wrap the aggregation in try-catch to handle potential errors
    try {
        // Perform MongoDB aggregation to get posts sorted by popularity score
        const posts = await Tweet.aggregate([
            // First stage: match posts based on tag filter
            { $match: matchStage },
            // Second stage: add fields to count likes, comments, and views
            {
                $addFields: {
                    likeCount: { $size: { $ifNull: ["$likes", []] } },
                    commentCount: { $ifNull: ["$commentCount", 0] },
                    viewsCount: { $ifNull: ["$views", 0] }
                }
            },
            // Third stage: calculate popularity score using weighted formula
            {
                $addFields: {
                    popularityScore: {
                        $add: [
                            { $multiply: ["$likeCount", 2] }, // Likes count twice as much
                            "$commentCount", // Comments count as is
                            { $multiply: ["$viewsCount", 0.5] } // Views count half as much
                        ]
                    }
                }
            },
            // Fourth stage: sort by popularity score (descending) and then by creation date
            { $sort: { popularityScore: -1, createdAt: -1 } },
            // Fifth stage: skip posts for pagination
            { $skip: skip },
            // Sixth stage: limit the number of results
            { $limit: limit },
            // Seventh stage: add common pipeline stages
            ...getCommonFeedPipeline()
        ]);

        // Process the posts to add user-specific data
        const finalPosts = processPosts(posts, userId);
        // Check if there are more posts available
        const hasMore = finalPosts.length === limit;
        // Calculate next cursor for pagination
        const nextCursor = hasMore ? (skip + finalPosts.length).toString() : null;


        // Return successful response with posts, pagination info, and success message
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
        // Log the error for debugging purposes
        console.error("Popular feed aggregation error:", error);
        // Return error response if aggregation fails
        return res.status(500).json(new ApiResponse(500, null, "Failed to fetch popular feed posts"));
    }
});

// Helper function that returns common aggregation pipeline stages used by all feed functions
const getCommonFeedPipeline = () => {
    return [
        // First stage: lookup user information for each post
        {
            $lookup: {
                from: "users", // Collection to lookup from
                localField: "user", // Field in posts collection
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
        // Third stage: project only the fields we want to return
        {
            $project: {
                title: 1, // Post title
                content: 1, // Post content
                media: 1, // Media attachments
                tags: { $ifNull: ["$tags", []] }, // Tags array, default to empty array if null
                views: { $ifNull: ["$views", 0] }, // View count, default to 0 if null
                likes: { $size: { $ifNull: ["$likes", []] } }, // Count of likes
                bookmarkCount: { $size: { $ifNull: ["$bookmarkedBy", []] } }, // Count of bookmarks
                commentCount: { $ifNull: ["$commentCount", 0] }, // Comment count, default to 0 if null
                likesArray: { $ifNull: ["$likes", []] }, // Array of user IDs who liked (for processing)
                bookmarksArray: { $ifNull: ["$bookmarkedBy", []] }, // Array of user IDs who bookmarked (for processing)
                user: 1, // User information
                createdAt: 1, // Creation timestamp
                popularityScore: { $ifNull: ["$popularityScore", 0] }, // Popularity score, default to 0 if null
                likeCount: { $ifNull: ["$likeCount", 0] } // Like count, default to 0 if null
            }
        }
    ];
};

// Helper function to process posts and add user-specific data (like status, bookmark status)
const processPosts = (posts, userId) => {
    // Map through each post to add user-specific information
    return posts.map(post => {
        // Check if the current user has liked this post
        const isLiked = userId ? post.likesArray.some(likeId => likeId.toString() === userId.toString()) : false;
        // Check if the current user has bookmarked this post
        const isBookmarked = userId ? post.bookmarksArray.some(bookmarkId => bookmarkId.toString() === userId.toString()) : false;

        // Destructure to remove arrays we don't want to send to client
        const { likesArray, bookmarksArray, ...rest } = post;

        // Return post with user-specific flags added
        return {
            ...rest,
            isLiked,
            isBookmarked
        };
    });
};

// Helper function specifically for processing recent posts with cursor-based pagination
const processPostsForRecent = (posts, batch, userId) => {
    // Check if we fetched more posts than requested (to determine if there are more)
    const hasMore = posts.length > batch;
    // If we have more posts, remove the extra one we fetched
    if (hasMore) {
        posts.pop();
    }

    // Process the posts to add user-specific data
    const finalPosts = processPosts(posts, userId);
    // Calculate next cursor for pagination (ID of the last post)
    const nextCursor = hasMore && finalPosts.length > 0 ? finalPosts[finalPosts.length - 1]._id.toString() : null;

    // Return processed posts and next cursor
    return { finalPosts, nextCursor };
};

// Export the main function that handles feed requests
export {
    getFeedPosts
}; 