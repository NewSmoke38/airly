import { Router } from "express";
import { createTweet, deleteTweet, editTweet, searchTweetsByTags, getPopularTags } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadMedia } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/create", verifyJWT, uploadMedia.single("media"), createTweet);
router.delete("/:id", verifyJWT, deleteTweet);
router.patch("/:id", verifyJWT, uploadMedia.single("media"), editTweet);
router.get("/search/tags", verifyJWT, searchTweetsByTags);
router.get("/popular-tags", verifyJWT, getPopularTags);

export default router;