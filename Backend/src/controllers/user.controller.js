import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()     // use correct method name
      const refreshToken = user.generateRefreshToken()   // use correct method name

      user.refreshToken = refreshToken
      user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token")
   }
}

// register
const registerUser = asyncHandler(async (req, res) => {

   // taking user detail
   const { fullName, email, username, password } = req.body
   console.log("email: ", email);


   // validation that its not coming empty or multiple things at a time
   if (
      [fullName, email, username, password].some((field) =>
         field?.trim() === "")            // if after trimming whitespace we get "" then show error for bieng empty
      ) {
      throw new ApiError(400, "All fields are required")
    }


   // check is user already exists
   // either get email or username matched from db
   const existedUser = await User.findOne({
      $or: [{ username }, { email }]        
   })

   if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
   }

   //check for any incoming images or pfp coming from user
   // multer does its work
   const pfpLocalPath = req.files?.pfp[0]?.path;      // mutler has already taken the file from the user
   
   if (!pfpLocalPath) {
      throw new ApiError(400, "pfp is required")
   }

   // uploading on cloudinary

   // await so that it doesnt go so fast w/o uploading fully and accsing further code
   const pfp = await uploadOnCloudinary(pfpLocalPath)

   if (!pfp) {
      throw new ApiError(400, "pfp file is required")
   }
   
   // enter user into db, make a user object there
   // when playing w db we often get errors, so async will handle it, so we must await kyunki bhai time to lagega hi
   const user = await User.create({
      fullName,
      pfp: pfp.url,
      email,
      password,          
      username: username.toLowerCase()  
   })


   // check if user object created
   // and remove refresh token from response
   const createdUser = await User.findById(user._id).select(        
      "-password -refreshToken"  
   )

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }


   // return response
   return res
   .status(201)
   .json(
      new ApiResponse(200, createdUser, "User registered successfully!! ✨")
   )



})


// login
const loginUser = asyncHandler(async (req, res) => {

   // take username, pass
   const { email, username, password } = req.body;

   if (!(username || email)) {
      throw new ApiError(400, "username or password is required");
   }

   const user = await User.findOne({ $or: [{ username }, { email }] });

   if (!user) {
      throw new ApiError(404, "user does not exist");
   }

   const isPasswordValid = await user.isPasswordCorrect(password);

   if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
   }

   const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
      user._id
   );

   const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   const options = {
      httpOnly: true,
      secure: true
   };

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged In Successfully"
         )
      );
});

// logout 
const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {
            refreshToken: 1    
         }
      },
      {
         new: true
      }
   )

   const options = {
   httpOnly: true,      // optios help is making cookies only accessible through http route
   secure: true
};

   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"))

})

// Getting logged-in user's profile
const getOwnProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});


// Updatig user's own socials
const updateUserSocials = asyncHandler(async (req, res) => {
    const socials = req.body.social; // like - twitter, github, linkedin

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

    return res.status(200).json(
        new ApiResponse(200, user, "Social links updated successfully")
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

export {
   registerUser,
   loginUser,
   logoutUser,
   getOwnProfile,
   updateUserSocials,
   updateUserInfo
};