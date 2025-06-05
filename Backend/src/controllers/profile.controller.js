import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Getting logged-in user's profile
const getOwnProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
             {...user.toObject(),
             joinedAt: user.getJoinedDate()
             },
              "User profile fetched successfully"
            )
    );
});


// updating personal info
const updateUserInfo = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    let updateObj = {};

    // Handling pfp update (if file uploaded)
    if (req.file) {
        // using cloudinary for uploads
        const uploadResult = await uploadOnCloudinary(req.file.path);
        updateObj.pfp = uploadResult.url;
    }

    // If nothing to update, return current user
    if (
        (!fullName || fullName.trim() === "") &&
        (!username || username.trim() === "") &&
        (!email || email.trim() === "") &&
        !password &&
        !updateObj.pfp
    ) {
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        return res.status(200).json(
            new ApiResponse(200, user, "No personal info updated (none provided)")
        );
    }

    // Check for duplicate username/email if they are being changed and are already taken
    if (username) {
        const existingUser = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user._id } });
        if (existingUser) {
            throw new ApiError(409, "Username already taken");
        }
        updateObj.username = username.toLowerCase();
    }
    if (email) {
        const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
        if (existingUser) {
            throw new ApiError(409, "Email already in use");
        }
        updateObj.email = email.toLowerCase();
    }
    if (fullName) updateObj.fullName = fullName;

    //  password update, hashing it also 
    if (password) {
      if (password.length < 6 || password.length > 8) {
        throw new ApiError(400, "Password must be between 6 and 8 characters");
    }
        const bcrypt = await import('bcrypt');
        updateObj.password = await bcrypt.default.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateObj },
        { new: true, runValidators: true, select: "-password -refreshToken" }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Personal info updated successfully")
    );
});

// Updatig user's own socials
const updateUserSocials = asyncHandler(async (req, res) => {
    const socials = req.body.socials; // like - twitter, github, linkedin

    // If socials is missing or not an object, just skip updating and return current user
    if (!socials || typeof socials !== "object" || Object.keys(socials).length === 0) {
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        return res.status(200).json(
            new ApiResponse(200, user, "No social links updated (none provided)")
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { social: socials } },
        { new: true, runValidators: true, select: "-password -refreshToken" }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Social links updated successfully")
    );
});



// Get user profile by username(for anyboooody)
const getUserByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() })
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                ...user.toObject(),
                joinedDate: user.getJoinedDate()
            },
            "User profile fetched successfully"
        )
    );
});

// get user posts by thier username(for everyyyyboody)
const getPostsByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { cursor, batch = 12 } = req.query;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let matchStage = { user: user._id };
    
    if (cursor) {
        matchStage._id = {      // Only fetch posts made by this user
            $lt: new mongoose.Types.ObjectId(cursor)   // less than, older ones to be renderd
        };
    }

    const posts = await Tweet.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: { createdAt: -1 }    // Sort tweets by that user by newest first
        },
        {
            $limit: parseInt(batch) + 1    // Ask for 1 extra tweet than needed.
// To check if there’s more posts after this batch (for infinite scroll).
        },
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
            $unwind: "$user"     // take this user out ha
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

    const hasMore = posts.length > batch;    // If we got more than batch, there are more posts after this.
    const nextCursor = hasMore ? posts[posts.length - 2]._id : null;   // If there are more posts, save the _id of the last real post (not the extra one) to use as the next cursor.

    
    if (hasMore) {
        posts.pop();       // only to remove the extra post for the new batch and then it becomes the first in next batch
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                posts,
                hasMore,
                nextCursor: nextCursor?.toString()
            },
            `Posts by ${username} fetched successfully`
        )
    );
});







export {
    getOwnProfile,
    updateUserSocials,
    updateUserInfo,
    getUserByUsername,
    getPostsByUsername

};