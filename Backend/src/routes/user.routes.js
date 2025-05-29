import { Router } from "express";
import { 
         registerUser,
         loginUser,
         logoutUser,
         getOwnProfile,
         updateUserSocials,
         updateUserInfo 
        } from "../controllers/user.controller.js";

import { createTweet,
         deleteTweet,
         editTweet
        } from "../controllers/tweet.controller.js"

import { likeTweet } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadPfp } from "../middlewares/multer.middleware.js";
import { uploadMedia } from "../middlewares/multer.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middlware.js"
import { getAllUsers } from "../controllers/user.controller.js";


const router = Router()
 
router.route("/register").post(
    uploadPfp.fields([                
        {
            name: "pfp",
            maxCount: 1
        },
    ]),
    registerUser)  

router.post("/login", loginUser)
router.post("/logout", verifyJWT, logoutUser)
router.post("/tweet", verifyJWT, uploadMedia.single("media"), createTweet);
router.delete("/tweet/:id", verifyJWT, deleteTweet);
router.post("/tweet/:id/like", verifyJWT, likeTweet);
router.patch("/tweet/:id", verifyJWT, uploadMedia.single("media"), editTweet);
router.get("/me", verifyJWT, getOwnProfile);
router.patch("/socials", verifyJWT, updateUserSocials);
router.patch("/personal", verifyJWT, uploadPfp.single("pfp"), updateUserInfo);
router.get("/admin/users", verifyJWT, isAdmin, getAllUsers);

export default router;
