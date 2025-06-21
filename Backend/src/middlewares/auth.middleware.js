import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, 
    next) => {
try {
          const token = 
          req.cookies?.accessToken ||
          req.headers.authorization?.replace("Bearer ", "");   // ya toh cookies se token niklega ya toh auth bearer sey=
             // leaving bearer we get the token
   
          if (!token) {
             throw new ApiError(401, "Unauthorized request")
          }
   
      // if we get tokens (yayyyy)
      // then check if it is valid or not (spy mode)
      const decodedToken = jwt.verify(token, process.env
         .ACCESS_TOKEN_SECRET)   

      const user =  await User.findById(decodedToken?._id).select
         ("-password -refreshToken")
       
         if (!user) {
            throw new ApiError(401, "Invalid Access Token")
         }
   
   
       req.user = user;
       next()   
                  /// middleware verifyJWT's work is done so jump to the next thingy
     } catch (error) {
       console.error(error);   
           throw new ApiError(401, "Invalid access thrown")
        }
})