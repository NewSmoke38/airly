import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        media: {
            type: String,    
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,           
            maxlength: 280,       
            minlength: 1 
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true       
        }],
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
tweetSchema.index({ tags: 1 });       // for searching tweets by tags

export const Tweet = mongoose.model("Tweet", tweetSchema);
