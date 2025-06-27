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

const testViews = async () => {
    try {
        await connectDB();
        
        console.log("\n=== TESTING VIEWS FUNCTIONALITY ===");
        
        // Get a sample tweet
        const sampleTweet = await Tweet.findOne();
        if (!sampleTweet) {
            console.log("No tweets found in database");
            return;
        }
        
        console.log(`\nSample tweet found:`);
        console.log(`ID: ${sampleTweet._id}`);
        console.log(`Title: ${sampleTweet.title}`);
        console.log(`Current views: ${sampleTweet.views}`);
        
        // Test incrementing views
        console.log(`\n--- Testing view increment ---`);
        sampleTweet.views += 1;
        await sampleTweet.save();
        console.log(`Views after increment: ${sampleTweet.views}`);
        
        // Test adding user to viewedBy array
        console.log(`\n--- Testing viewedBy array ---`);
        const testUserId = new mongoose.Types.ObjectId();
        if (!sampleTweet.viewedBy.some(id => id.toString() === testUserId.toString())) {
            sampleTweet.viewedBy.push(testUserId);
            await sampleTweet.save();
            console.log(`Added test user to viewedBy array`);
            console.log(`viewedBy count: ${sampleTweet.viewedBy.length}`);
        }
        
        // Test duplicate prevention
        console.log(`\n--- Testing duplicate prevention ---`);
        const beforeCount = sampleTweet.viewedBy.length;
        sampleTweet.viewedBy.push(testUserId); // Try to add same user again
        await sampleTweet.save();
        const afterCount = sampleTweet.viewedBy.length;
        console.log(`Before: ${beforeCount}, After: ${afterCount}`);
        console.log(`Duplicate prevention working: ${beforeCount === afterCount}`);
        
        // Show final state
        console.log(`\n--- Final tweet state ---`);
        console.log(`Views: ${sampleTweet.views}`);
        console.log(`Viewed by ${sampleTweet.viewedBy.length} users`);
        
        console.log(`\n✅ Views functionality test completed successfully!`);
        
    } catch (error) {
        console.error("Error testing views:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDatabase disconnected.");
    }
};

testViews(); 