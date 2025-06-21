import mongoose from "mongoose";
import dotenv from "dotenv";
import { Tweet } from "./src/models/tweet.model.js";

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

const checkTags = async () => {
    try {
        await connectDB();
        
        const tagStats = await Tweet.aggregate([
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
            }
        ]);
        
        console.log("\n=== TAG STATISTICS ===");
        console.log(`Total unique tags: ${tagStats.length}`);
        console.log("\nTags with usage count:");
        console.log("======================");
        
        if (tagStats.length === 0) {
            console.log("No tags found in the system yet.");
        } else {
            tagStats.forEach((tag, index) => {
                console.log(`${index + 1}. #${tag._id} - used ${tag.count} times`);
            });
        }
        
        const totalTweets = await Tweet.countDocuments();
        console.log(`\nTotal tweets in system: ${totalTweets}`);
        
        const tweetsWithTags = await Tweet.countDocuments({ tags: { $exists: true, $ne: [] } });
        const tweetsWithoutTags = totalTweets - tweetsWithTags;
        
        console.log(`Tweets with tags: ${tweetsWithTags}`);
        console.log(`Tweets without tags: ${tweetsWithoutTags}`);
        
    } catch (error) {
        console.error("Error checking tags:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDatabase disconnected.");
    }
};

checkTags(); 