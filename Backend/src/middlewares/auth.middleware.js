import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, 
    next) => {
try {
          const token = 
          req.cookies?.accessToken ||
          req.headers.authorization?.replace("Bearer ", "");   
   
          if (!token) {
             throw new ApiError(401, "Unauthorized request")
          }
   
      const decodedToken = jwt.verify(token, process.env
         .ACCESS_TOKEN_SECRET)   

      const user =  await User.findById(decodedToken?._id).select
         ("-password -refreshToken")
       
         if (!user) {
            throw new ApiError(401, "Invalid Access Token")
         }
   
   
       req.user = user;
       next()   
     } catch (error) {
       console.error(error);   
           throw new ApiError(401, "Invalid access thrown")
        }
})

export const optionalAuth = async (req, res, next) => {
    // This middleware should NEVER throw an error - always allow request to proceed
    try {
        const token = 
            req.cookies?.accessToken ||
            req.headers.authorization?.replace("Bearer ", "");

        // No token = proceed without authentication
        if (!token) {
            // No authentication token present - proceeding as public request
            return next();
        }

        // Try to verify token, but don't fail if it's invalid
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (decodedToken?._id) {
                try {
                    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
                    if (user) {
                        req.user = user;
                    }
                } catch (dbError) {
                    // Database error - just continue without user
                    console.log("Optional auth DB error (non-fatal):", dbError.message);
                }
            }
        } catch (jwtError) {
            // JWT verification failed - this is expected for invalid/expired tokens
            // Silently continue without authentication
        }
        
        // Always call next() to allow request to proceed
        return next();
    } catch (error) {
        // Ultimate safety net - catch ANY error and continue
        // This should never happen, but ensures requests always proceed
        console.log("Optional auth unexpected error (non-fatal):", error.message);
        return next();
    }
}