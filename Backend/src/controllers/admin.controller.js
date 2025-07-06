import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select("-password -refreshToken")
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    users,
                    pagination: {
                        total: totalUsers,
                        page,
                        limit,
                        pages: Math.ceil(totalUsers / limit)
                    }
                },
                "Fetched users successfully"
            )
        );

});

const updateUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, email, role } = req.body;
    let updateObj = {};


    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid user ID");
    }

    if (fullName) updateObj.fullName = fullName;
    if (email) updateObj.email = email.toLowerCase();
    if (role) updateObj.role = role;


    if (email) {
        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: id }
        });
        if (existingUser) {
            throw new ApiError(409, "Email already in use");
        }
    }


    const updatedUser = await User.findByIdAndUpdate(
        id,
        {
            $set: updateObj
        },
        {
            new: true,
            runValidators: true,
            select: "-password -refreshToken"
        }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "User updated successfully")
        );
});


const deleteUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid user ID");
    }

    if (id === req.user._id.toString()) {
        throw new ApiError(403, "Admin cannot delete their own account");
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,
                null,
                "User deleted successfully")
        );
});

const getAnalytics = asyncHandler(async (req, res) => {
    // Get date range for analytics (last 30 days by default)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // User Analytics
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });
    const newUsersThisWeek = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });

    // Tweet Analytics
    const totalTweets = await Tweet.countDocuments();
    const newTweetsThisMonth = await Tweet.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });
    const newTweetsThisWeek = await Tweet.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });

    // Engagement Analytics
    const totalLikes = await Tweet.aggregate([
        {
            $project: {
                likesCount: {
                    $size: {
                        $ifNull: ["$likes", []]
                    }
                }
            }
        },
        { $group: { _id: null, total: { $sum: "$likesCount" } } }
    ]);

    const totalViews = await Tweet.aggregate([
        { $group: { _id: null, total: { $sum: { $ifNull: ["$views", 0] } } } }
    ]);

    const totalBookmarks = await Tweet.aggregate([
        {
            $project: {
                bookmarksCount: {
                    $size: {
                        $ifNull: ["$bookmarkedBy", []]
                    }
                }
            }
        },
        { $group: { _id: null, total: { $sum: "$bookmarksCount" } } }
    ]);

    const totalComments = await Comment.countDocuments();

    // Most Popular Tags
    const popularTags = await Tweet.aggregate([
        { $match: { tags: { $exists: true, $ne: [] } } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { tag: "$_id", count: 1, _id: 0 } }
    ]);

    // Most Active Users
    const mostActiveUsers = await Tweet.aggregate([
        { $group: { _id: "$user", postCount: { $sum: 1 } } },
        { $sort: { postCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $project: {
                _id: 1,
                postCount: 1,
                fullName: "$userInfo.fullName",
                username: "$userInfo.username",
                pfp: "$userInfo.pfp"
            }
        }
    ]);

    // Daily User Registrations (last 7 days)
    const dailyRegistrations = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Daily Tweet Posts (last 7 days)
    const dailyPosts = await Tweet.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Most Liked Posts
    const mostLikedPosts = await Tweet.aggregate([
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                user: 1,
                createdAt: 1,
                likesCount: { $size: { $ifNull: ["$likes", []] } },
                views: { $ifNull: ["$views", 0] }
            }
        },
        { $sort: { likesCount: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $project: {
                title: 1,
                content: 1,
                media: 1,
                likesCount: 1,
                views: 1,
                createdAt: 1,
                "user.fullName": "$userInfo.fullName",
                "user.username": "$userInfo.username",
                "user.pfp": "$userInfo.pfp"
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            overview: {
                totalUsers,
                totalTweets,
                totalLikes: totalLikes[0]?.total || 0,
                totalViews: totalViews[0]?.total || 0,
                totalBookmarks: totalBookmarks[0]?.total || 0,
                totalComments,
                newUsersThisMonth,
                newUsersThisWeek,
                newTweetsThisMonth,
                newTweetsThisWeek
            },
            charts: {
                dailyRegistrations,
                dailyPosts
            },
            insights: {
                popularTags,
                mostActiveUsers,
                mostLikedPosts
            }
        }, "Analytics data fetched successfully")
    );
});

const getUserStats = asyncHandler(async (req, res) => {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const userStats = await User.aggregate([
        {
            $facet: {
                totalUsers: [{ $count: "count" }],
                newUsers: [
                    { $match: { createdAt: { $gte: daysAgo } } },
                    { $count: "count" }
                ],
                usersByRole: [
                    { $group: { _id: "$role", count: { $sum: 1 } } }
                ],
                recentUsers: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 10 },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            email: 1,
                            role: 1,
                            createdAt: 1,
                            pfp: 1
                        }
                    }
                ]
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, userStats[0], "User statistics fetched successfully")
    );
});

const getContentStats = asyncHandler(async (req, res) => {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const contentStats = await Tweet.aggregate([
        {
            $facet: {
                totalPosts: [{ $count: "count" }],
                newPosts: [
                    { $match: { createdAt: { $gte: daysAgo } } },
                    { $count: "count" }
                ],
                engagementStats: [
                    {
                        $project: {
                            likesCount: { $size: { $ifNull: ["$likes", []] } },
                            bookmarksCount: { $size: { $ifNull: ["$bookmarkedBy", []] } },
                            views: { $ifNull: ["$views", 0] },
                            commentCount: { $ifNull: ["$commentCount", 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalLikes: { $sum: "$likesCount" },
                            totalBookmarks: { $sum: "$bookmarksCount" },
                            totalViews: { $sum: "$views" },
                            totalComments: { $sum: "$commentCount" },
                            avgLikes: { $avg: "$likesCount" },
                            avgViews: { $avg: "$views" }
                        }
                    }
                ],
                topPosts: [
                    {
                        $project: {
                            title: 1,
                            content: 1,
                            user: 1,
                            createdAt: 1,
                            likesCount: { $size: { $ifNull: ["$likes", []] } },
                            views: { $ifNull: ["$views", 0] },
                            commentCount: { $ifNull: ["$commentCount", 0] }
                        }
                    },
                    { $sort: { likesCount: -1 } },
                    { $limit: 10 },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "userInfo"
                        }
                    },
                    { $unwind: "$userInfo" },
                    {
                        $project: {
                            title: 1,
                            content: 1,
                            likesCount: 1,
                            views: 1,
                            commentCount: 1,
                            createdAt: 1,
                            "author.fullName": "$userInfo.fullName",
                            "author.username": "$userInfo.username"
                        }
                    }
                ]
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, contentStats[0], "Content statistics fetched successfully")
    );
});

export {
    getAllUsers,
    updateUserById,
    deleteUserById,
    getAnalytics,
    getUserStats,
    getContentStats
};