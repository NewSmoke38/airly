// Test file to verify search functionality
import mongoose from 'mongoose';
import { Tweet } from './src/models/tweet.model.js';
import { User } from './src/models/user.model.js';

// Connect to MongoDB (replace with your connection string)
const MONGODB_URI = 'mongodb://localhost:27017/vibely';

async function testSearch() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Check if there are any tweets with tags
    const tweetsWithTags = await Tweet.find({ tags: { $exists: true, $ne: [] } });
    console.log(`Found ${tweetsWithTags.length} tweets with tags`);

    if (tweetsWithTags.length > 0) {
      console.log('Sample tweets with tags:');
      tweetsWithTags.slice(0, 3).forEach(tweet => {
        console.log(`- ${tweet.title}: [${tweet.tags.join(', ')}]`);
      });
    }

    // Test 2: Test tag search aggregation
    const testTag = 'art';
    const searchResults = await Tweet.aggregate([
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
        $match: {
          tags: { $in: [testTag] }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
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

    console.log(`\nSearch results for tag "${testTag}": ${searchResults.length} tweets found`);
    searchResults.forEach(tweet => {
      console.log(`- ${tweet.title} by @${tweet.user.username}`);
    });

    // Test 3: Get popular tags
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
        $limit: 10
      },
      {
        $project: {
          tag: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    console.log('\nPopular tags:');
    popularTags.forEach(tag => {
      console.log(`- ${tag.tag}: ${tag.count} posts`);
    });

  } catch (error) {
    console.error('Error testing search:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSearch(); 