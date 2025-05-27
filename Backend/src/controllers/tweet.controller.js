import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


// create a tweet
const createTweet = asyncHandler(async (req, res) => {
    const { title, content } = req.body;


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

    // Creating a tweet (hitting the send/post/create button)
    const tweet = await Tweet.create({
        title,
        content,
        media: mediaUrl,
        user: req.user._id.toString()   // <-- associate tweet with the authenticated user  
         
    });
    return res
    .status(201)
    .json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
});


// delete a tweet
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


// edit a tweet
const editTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;      // Get tweet ID from URL params
    const { title, content } = req.body;

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Only the owner can edit
    if (!tweet.user || tweet.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this tweet");
    }

    // Update fields if provided
    if (title) tweet.title = title;
    if (content) tweet.content = content;
    // Handle media update if a new file is uploaded
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        tweet.media = uploadResult.url;
    }

    // Add watermark
    tweet.edited = true;
    tweet.editedAt = new Date();

    await tweet.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet edited successfully")
    );
});

export {
    createTweet,
    deleteTweet,
    editTweet
}

