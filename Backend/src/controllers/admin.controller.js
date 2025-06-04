import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

/// admin operations
// fetching all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;        // its how many pages, default is 1, Backend uses page & limit for infinite scroll even if UI has no visible pages so the system doesnt melt when the user req GET and we give all 1k users at one time suddenly
  const limit = parseInt(req.query.limit) || 10;     // its how many users to show per page (default is 10 if not passed by frontend).
  const skip = (page - 1) * limit;                   //  Skips users from earlier pages so we only load the new other users 

  const users = await User.find()
    .select("-password -refreshToken")
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments();    // Counts total no. of users in the database.
  
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

// update user info by id (admin only)
const updateUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, email, role } = req.body;
    let updateObj = {};  // we make an empty object in which we put the params we need to update 

    // If the ID looks weird or fake (not a proper MongoDB ID), we throw an error 
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid user ID");
    }

  if (fullName) updateObj.fullName = fullName;
  if (email) updateObj.email = email.toLowerCase();
  if (role) updateObj.role = role;

    // Checks for duplicate email if being updated
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
            $set: updateObj       //  only update the fields inside updateObj, not the whole user doc. duh
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
        new ApiResponse(200, updatedUser, "User updated successfully")
    );
});


// delete user by id (admin only)
const deleteUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Checking if it is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid user ID");
    }

    //for self-deletion
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
            new ApiResponse(200, null, "User deleted successfully")
        );
});


export {
    getAllUsers,
    updateUserById,
    deleteUserById
};