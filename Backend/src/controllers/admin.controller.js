import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
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


export {
    getAllUsers,
    updateUserById,
    deleteUserById
   };