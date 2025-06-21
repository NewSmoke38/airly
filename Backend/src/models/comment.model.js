import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,  
            minlength: 1
        },
        user: {
             type: Schema.Types.ObjectId,
              ref: "User",
               required: true
        },
       tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
            required: true
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                default: []
            }
        ],
        edited: { // mark
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date
        },
        parentComment: {  // op
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        replies: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment"
            }
        ],
        replyCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

commentSchema.index({ tweet: 1, createdAt: -1 }); 
commentSchema.index({ user: 1 });                 
commentSchema.index({ parentComment: 1 });        

// virtual  like count not stored in db , calc on the go , good for db clean logic
commentSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

export const Comment = mongoose.model("Comment", commentSchema); 