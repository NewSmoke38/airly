import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
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







export {
    getOwnProfile,
    updateUserSocials,
    updateUserInfo
};