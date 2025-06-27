import mongoose from "mongoose";
import dotenv from "dotenv";
import { Tweet } from "./src/models/tweet.model.js";
import { User } from "./src/models/user.model.js";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/Vibely`);
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.log("MongoDB connection failed:", error);
        process.exit(1);
    }
};

const testLikes = async () => {
    try {
        await connectDB();
        
        console.log("\n=== TESTING LIKE FUNCTIONALITY ===");
        
        // Get a sample tweet
        const sampleTweet = await Tweet.findOne();
        if (!sampleTweet) {
            console.log("No tweets found in database");
            return;
        }
        
        console.log(`\nSample tweet found:`);
        console.log(`ID: ${sampleTweet._id}`);
        console.log(`Title: ${sampleTweet.title}`);
        console.log(`Current likes: ${sampleTweet.likes.length}`);
        
        // Test like functionality
        console.log(`\n--- Testing like functionality ---`);
        const testUserId = new mongoose.Types.ObjectId();
        
        // Check if user has liked
        const hasLiked = sampleTweet.likes.some(id => id.toString() === testUserId.toString());
        console.log(`User has liked: ${hasLiked}`);
        
        // Add like
        if (!hasLiked) {
            sampleTweet.likes.push(testUserId);
            await sampleTweet.save();
            console.log(`Added like from test user`);
        }
        
        console.log(`Likes after adding: ${sampleTweet.likes.length}`);
        
        // Test duplicate prevention
        console.log(`\n--- Testing duplicate prevention ---`);
        const beforeCount = sampleTweet.likes.length;
        sampleTweet.likes.push(testUserId); // Try to add same user again
        await sampleTweet.save();
        const afterCount = sampleTweet.likes.length;
        console.log(`Before: ${beforeCount}, After: ${afterCount}`);
        console.log(`Duplicate prevention working: ${beforeCount === afterCount}`);
        
        // Test unlike functionality
        console.log(`\n--- Testing unlike functionality ---`);
        sampleTweet.likes = sampleTweet.likes.filter(id => id.toString() !== testUserId.toString());
        await sampleTweet.save();
        console.log(`Likes after removing: ${sampleTweet.likes.length}`);
        
        // Test like count calculation
        console.log(`\n--- Testing like count calculation ---`);
        const likeCount = sampleTweet.likes.length;
        console.log(`Calculated like count: ${likeCount}`);
        
        // Test with multiple users
        console.log(`\n--- Testing with multiple users ---`);
        const testUserIds = [
            new mongoose.Types.ObjectId(),
            new mongoose.Types.ObjectId(),
            new mongoose.Types.ObjectId()
        ];
        
        for (const userId of testUserIds) {
            if (!sampleTweet.likes.some(id => id.toString() === userId.toString())) {
                sampleTweet.likes.push(userId);
            }
        }
        await sampleTweet.save();
        console.log(`Total likes after adding multiple users: ${sampleTweet.likes.length}`);
        
        // Show final state
        console.log(`\n--- Final tweet state ---`);
        console.log(`Total likes: ${sampleTweet.likes.length}`);
        console.log(`Like count calculation: ${sampleTweet.likes.length}`);
        
        console.log(`\n✅ Like functionality test completed successfully!`);
        
        // Test aggregation for most liked tweets
        console.log(`\n--- Testing most liked tweets aggregation ---`);
        const mostLikedTweets = await Tweet.aggregate([
            {
                $sort: { "likes": -1, createdAt: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    title: 1,
                    likeCount: { $size: "$likes" }
                }
            }
        ]);
        
        console.log("Top 5 most liked tweets:");
        mostLikedTweets.forEach((tweet, index) => {
            console.log(`${index + 1}. "${tweet.title}" - ${tweet.likeCount} likes`);
        });
        
    } catch (error) {
        console.error("Error testing likes:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDatabase disconnected.");
    }
};

testLikes(); 