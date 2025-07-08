import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const DEFAULT_ROLE = "user";

const updateUserProfile = asyncHandler(async (req, res) => {
   const { fullName, bio } = req.body;
   const userId = req.user._id;

   const user = await User.findById(userId);
   if (!user) {
      throw new ApiError(404, "User not found");
   }

   if (fullName) {
      user.fullName = fullName;
   }

   if (bio) {
      user.bio = bio;
   }

   if (req.file) {
      const pfpLocalPath = req.file.path;
      const pfp = await uploadOnCloudinary(pfpLocalPath);
      if (!pfp) {
         throw new ApiError(500, "Failed to upload profile picture");
      }
      user.pfp = pfp.url;
   }

   await user.save({ validateBeforeSave: false });

   const updatedUser = await User.findById(userId).select("-password -refreshToken");

   return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token")
   }
}

const registerUser = asyncHandler(async (req, res) => {

   const { fullName, email, username, password } = req.body
   console.log("email: ", email);

   if (
      [fullName, email, username, password].some((field) =>
         field?.trim() === "")
   ) {
      throw new ApiError(400, "All fields are required")
   }

   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   })

   if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
   }

   const pfpLocalPath = req.files?.pfp[0]?.path;
   if (!pfpLocalPath) {
      throw new ApiError(400, "pfp is required")
   }

   const pfp = await uploadOnCloudinary(pfpLocalPath)

   if (!pfp) {
      throw new ApiError(400, "pfp file is required")
   }

   const user = await User.create({
      fullName,
      pfp: pfp.url, 
      email,
      password, 
      username: username.toLowerCase(), 
      role: DEFAULT_ROLE 
   });

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res
      .status(201)
      .json(
         new ApiResponse(201, createdUser, "User registered successfully!! ✨")
      )



})


const loginUser = asyncHandler(async (req, res) => {

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
      httpOnly: true, 
      secure: true 
   };

   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"))

})

const toggleFollow = asyncHandler(async (req, res) => {
   const { userId } = req.params;
   const currentUserId = req.user._id;

   if (userId === currentUserId.toString()) {
      throw new ApiError(400, "You cannot follow yourself");
   }

   const userToFollow = await User.findById(userId);
   if (!userToFollow) {
      throw new ApiError(404, "User not found");
   }

   const currentUser = await User.findById(currentUserId);
   const isFollowing = currentUser.following.includes(userId);

   if (isFollowing) {
      await User.findByIdAndUpdate(currentUserId, {
         $pull: { following: userId }
      });
      await User.findByIdAndUpdate(userId, {
         $pull: { followers: currentUserId }
      });

      return res.status(200).json(
         new ApiResponse(200, {
            isFollowing: false,
            message: `Unfollowed ${userToFollow.username}`
         }, "User unfollowed successfully")
      );
   } else {
      await User.findByIdAndUpdate(currentUserId, {
         $addToSet: { following: userId }
      });
      await User.findByIdAndUpdate(userId, {
         $addToSet: { followers: currentUserId }
      });

      return res.status(200).json(
         new ApiResponse(200, {
            isFollowing: true,
            message: `Following ${userToFollow.username}`
         }, "User followed successfully")
      );
   }
});

const toggleBlock = asyncHandler(async (req, res) => {
   const { userId } = req.params;
   const currentUserId = req.user._id;

   if (userId === currentUserId.toString()) {
      throw new ApiError(400, "You cannot block yourself");
   }

   const userToBlock = await User.findById(userId);
   if (!userToBlock) {
      throw new ApiError(404, "User not found");
   }

   const currentUser = await User.findById(currentUserId);
   const isBlocked = currentUser.blockedUsers.includes(userId);

   if (isBlocked) {
      await User.findByIdAndUpdate(currentUserId, {
         $pull: { blockedUsers: userId }
      });

      return res.status(200).json(
         new ApiResponse(200, {
            isBlocked: false,
            message: `Unblocked ${userToBlock.username}`
         }, "User unblocked successfully")
      );
   } else {
      await User.findByIdAndUpdate(currentUserId, {
         $addToSet: { blockedUsers: userId }, 
         $pull: { following: userId } 
      });
      await User.findByIdAndUpdate(userId, {
         $pull: { followers: currentUserId, following: currentUserId }
      });

      return res.status(200).json(
         new ApiResponse(200, {
            isBlocked: true,
            message: `Blocked ${userToBlock.username}`
         }, "User blocked successfully")
      );
   }
});
const getUserRelationship = asyncHandler(async (req, res) => {
   const { userId } = req.params;
   const currentUserId = req.user._id;

   if (userId === currentUserId.toString()) {
      return res.status(200).json(
         new ApiResponse(200, {
            isOwnProfile: true,
            isFollowing: false,
            isBlocked: false
         }, "Own profile")
      );
   }

   const currentUser = await User.findById(currentUserId);
   const isFollowing = currentUser.following.includes(userId);
   const isBlocked = currentUser.blockedUsers.includes(userId);

   return res.status(200).json(
      new ApiResponse(200, {
         isOwnProfile: false,
         isFollowing,
         isBlocked
      }, "User relationship status fetched")
   );
});


export {
   registerUser, 
   loginUser, 
   logoutUser, 
   toggleFollow, 
   toggleBlock, 
   getUserRelationship, 
   updateUserProfile, 
};

