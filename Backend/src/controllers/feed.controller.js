import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";


const getFeedPosts = asyncHandler(async (req, res) => {
    const { cursor, batch = 20 } = req.query; //   for bento grid layout
 // cursor(for pagiantion) = where to start fetching from, its like a bookmark every 20 batches 
    // batch = how many posts to fetch (default 20)

    //  fetch one extra post to determine if more exist
    const limit = parseInt(batch) + 1;

    let matchStage = {};   // if cursor detected
    if (cursor) {
        matchStage = {         //Give me posts created before this point. always loading the next older batch.
            _id: {
                $lt: new mongoose.Types.ObjectId(cursor)  // shows older tweets that came before this id of a tweeet, the last one in any batch
            }    // less than
        };
    }
    const posts = await Tweet.aggregate([       // tweet model me aggeregate krwa rhe hai
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {       // Only pulling these three fields from each user
                            username: 1,
                            fullName: 1,
                            pfp: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$user"        // lifts out each item and treat it like it’s standing on its own in a messy nested array of all users
        },
        {
            $match: matchStage       // if cursor got hit, duh
        },
        {
            $sort: { createdAt: -1 } // Sorts tweets by newest first
        },
        {
            $limit: limit 
        },
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                likes: { $size: "$likes" },
                user: 1,
                createdAt: 1
            }
        }
    ]);
    
    //Check if there are more posts
    const hasMore = posts.length > batch;
    
    //  remove the extra post we fetched
    if (hasMore) {
        posts.pop();
    }

    // get the cursor for the next batch
    const nextCursor = hasMore ? posts[posts.length - 1]._id : null;


    const totalPosts = await Tweet.countDocuments();       //Count total posts (for the sake of pagination metadata)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                posts,
                hasMore,
                nextCursor: nextCursor?.toString()
            },
            "Feed posts fetched successfully"
        )
    );
});



export { 
    getFeedPosts 
}; 