import { Router } from "express";
import { createTweet, deleteTweet, editTweet } from "../controllers/tweet.controller.js";
import { likeTweet } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadMedia } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/create", verifyJWT, uploadMedia.single("media"), createTweet);
router.delete("/:id", verifyJWT, deleteTweet);
router.post("/:id/like", verifyJWT, likeTweet);
router.patch("/:id", verifyJWT, uploadMedia.single("media"), editTweet);

export default router;