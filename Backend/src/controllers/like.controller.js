import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";

// liking a tweet 
const likeTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Toggle like/unlike
    const alreadyLiked = tweet.likes.some(id => id.toString() === userId.toString());
    if (alreadyLiked) {
        // Unlike
        tweet.likes = tweet.likes.filter(id => id.toString() !== userId.toString());
        await tweet.save();
        return res.status(200).json({ success: true, message: "Tweet unliked!" });
    } else {
        // Like
        tweet.likes.push(userId);
        await tweet.save();
        return res.status(200).json({ success: true, message: "Tweet liked!" });
    }
});

export { likeTweet };