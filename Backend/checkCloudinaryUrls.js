import mongoose from "mongoose";
import dotenv from "dotenv";
import { Tweet } from "./src/models/tweet.model.js";
import { User } from "./src/models/user.model.js";
import fetch from "node-fetch";

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

const checkUrl = async (url) => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

const checkCloudinaryUrls = async () => {
    try {
        await connectDB();
        
        console.log("\n=== CHECKING CLOUDINARY URLS ===");
        
        // Check tweet media URLs
        const tweets = await Tweet.find({});
        console.log(`\nFound ${tweets.length} tweets`);
        
        let brokenTweetUrls = 0;
        let workingTweetUrls = 0;
        
        for (const tweet of tweets) {
            if (tweet.media && tweet.media.includes('cloudinary.com')) {
                const isWorking = await checkUrl(tweet.media);
                if (isWorking) {
                    workingTweetUrls++;
                } else {
                    brokenTweetUrls++;
                    console.log(`❌ Broken tweet URL: ${tweet.media}`);
                    console.log(`   Tweet ID: ${tweet._id}`);
                    console.log(`   Title: ${tweet.title}`);
                }
            }
        }
        
        console.log(`\nTweet Media URLs:`);
        console.log(`✅ Working: ${workingTweetUrls}`);
        console.log(`❌ Broken: ${brokenTweetUrls}`);
        
        // Check user profile picture URLs
        const users = await User.find({});
        console.log(`\nFound ${users.length} users`);
        
        let brokenUserUrls = 0;
        let workingUserUrls = 0;
        
        for (const user of users) {
            if (user.pfp && user.pfp.includes('cloudinary.com')) {
                const isWorking = await checkUrl(user.pfp);
                if (isWorking) {
                    workingUserUrls++;
                } else {
                    brokenUserUrls++;
                    console.log(`❌ Broken user pfp URL: ${user.pfp}`);
                    console.log(`   User: ${user.username}`);
                }
            }
        }
        
        console.log(`\nUser Profile Picture URLs:`);
        console.log(`✅ Working: ${workingUserUrls}`);
        console.log(`❌ Broken: ${brokenUserUrls}`);
        
        const totalBroken = brokenTweetUrls + brokenUserUrls;
        const totalWorking = workingTweetUrls + workingUserUrls;
        
        console.log(`\n=== SUMMARY ===`);
        console.log(`Total working URLs: ${totalWorking}`);
        console.log(`Total broken URLs: ${totalBroken}`);
        
        if (totalBroken > 0) {
            console.log(`\n⚠️  You have ${totalBroken} broken Cloudinary URLs!`);
            console.log(`This could be due to:`);
            console.log(`1. Images were deleted from Cloudinary`);
            console.log(`2. Cloudinary account issues`);
            console.log(`3. Incorrect cloud name in .env file`);
        }
        
    } catch (error) {
        console.error("Error checking Cloudinary URLs:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDatabase disconnected.");
    }
};

checkCloudinaryUrls(); 