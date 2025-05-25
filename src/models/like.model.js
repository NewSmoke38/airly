import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
       likedTweet: {                        // the tweet which got liked <3
        type: Schema.Types.ObjectId,
        ref: "Tweet"
       },
       likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
       }
    },
)

export const Like = mongoose.model("Like", likeSchema)

