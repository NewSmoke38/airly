import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";


const getFeedPosts = asyncHandler(async (req, res) => {
    const { cursor, batch = 20 } = req.query; 

    const limit = parseInt(batch) + 1;

    let matchStage = {};   
    if (cursor) {
        matchStage = {         
            _id: {
                $lt: new mongoose.Types.ObjectId(cursor)  
            }   
        };
    }
    const posts = await Tweet.aggregate([      

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
            $match: matchStage       
        },
        {
            $sort: { createdAt: -1 } 
        },
        {
            $limit: limit 
        },
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                tags: 1,
                views: 1,
                likes: { $size: "$likes" },
                bookmarkCount: { $size: "$bookmarkedBy" },
                user: 1,
                createdAt: 1
            }
        }
    ]);
    
    const hasMore = posts.length > batch;
    
    if (hasMore) {
        posts.pop();
    }

const nextCursor = hasMore ? posts[posts.length - 1]._id : null;


    const totalPosts = await Tweet.countDocuments();       
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