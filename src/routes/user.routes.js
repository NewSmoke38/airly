import { Router } from "express";
import { 
         registerUser,
         loginUser,
         logoutUser,
         getOwnProfile,
         updateUserSocials 
        } from "../controllers/user.controller.js";

import { createTweet,
         deleteTweet,
         editTweet
        } from "../controllers/tweet.controller.js"

import { likeTweet } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadPfp } from "../middlewares/multer.middleware.js";
import { uploadMedia } from "../middlewares/multer.middleware.js";

const router = Router()
 
router.route("/register").post(
    uploadPfp.fields([                
        {
            name: "pfp",
            maxCount: 1
        },
    ]),
    registerUser)  

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.post("/tweet", verifyJWT, uploadMedia.single("media"), createTweet);
router.delete("/tweet/:id", verifyJWT, deleteTweet);
router.post("/tweet/:id/like", verifyJWT, likeTweet);
router.patch("/tweet/:id", verifyJWT, uploadMedia.single("media"), editTweet);
router.get("/me", verifyJWT, getOwnProfile);
router.patch("/socials", verifyJWT, updateUserSocials);

export default router;
