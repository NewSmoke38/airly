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



likeSchema.index({ likedTweet: 1 }); // to quickly fetch all likes on a tweet
likeSchema.index({ likedBy: 1, likedTweet: 1 }, { unique: true }); // to prevent duplicate likes
// helps reverse lookups like “Which tweets has this user liked?” will soon get in work

export const Like = mongoose.model("Like", likeSchema)

