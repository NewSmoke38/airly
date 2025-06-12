import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        media: {
            type: String,    // URL or path to the media file (image, gif, or video)
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,           // removes leading/trailing whitespace
            maxlength: 280,       // limit to 280 characters (like Twitter)
            minlength: 1 
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
       
        likes: [
          { type: Schema.Types.ObjectId,
            ref: "User",
            default: []
          }
        ],

        edited: {
            type: Boolean,   
            default: false
          },

        editedAt: {
        type: Date
},

    },
    {
        timestamps: true
    }
)

// Essential indexes for performance-critical queries
tweetSchema.index({ createdAt: -1 }); // for sorting tweets in feed
tweetSchema.index({ user: 1 });       // for fetching tweets by user

export const Tweet = mongoose.model("Tweet", tweetSchema);
