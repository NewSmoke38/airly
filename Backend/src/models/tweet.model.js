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

        commentCount: {
            type: Number,
            default: 0
        },

        views: {
            type: Number,
            default: 0
        },

        viewedBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: []
            }
        ],

        bookmarkedBy: [
            {
                type: Schema.Types.ObjectId,
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

tweetSchema.index({ createdAt: -1 }); 
tweetSchema.index({ user: 1 });       
tweetSchema.index({ tags: 1 });       
tweetSchema.index({ views: -1 });     
tweetSchema.index({ bookmarkedBy: 1 });

export const Tweet = mongoose.model("Tweet", tweetSchema);
