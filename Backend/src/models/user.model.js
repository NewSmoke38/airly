import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"           

const userSchema = new Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        minlength: 1,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        maxlength: 20
    },
    fullName: {
      type: String,
      required: true,
      trim: true,            // it automatically removes whitespace 
      index: true,
      minlength: 1,
      maxlength: 30
    },
    pfp: {
        type: String,     // we will take its url from cloudinary
        required: true
    },
    socials: {
        twitter: {
        type: String
     },
        github: { 
        type: String
     },
        linkedin: {
        type: String 
     }
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    joinedAt: {
    type: Date,
    default: Date.now
    }

},

{
    timestamps: true
}
)

// using bcrypt for hashing passwords
userSchema.pre("save", async function (next) {        // async is for the time it takes, bro its cryptography hehe
  if (!this.isModified("password")) return next();     // yaha we checked for negative

  this.password = await bcrypt.hash(this.password, 10);
  next();
});



// some methods

// this one it to check if the password is correct

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// for genrating tokens <3
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// for getting (joined at) on a user profile
userSchema.methods.getJoinedDate = function() {
    return new Intl.DateTimeFormat('en-US', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
    }).format(this.joinedAt);
};

// indexes for my cutie users hehe
userSchema.index({ email: 1 }); // login, password resets
userSchema.index({ role: 1 });  // for admin filtering or role-based features
export const User = mongoose.model("User", userSchema)