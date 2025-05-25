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
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    fullName: {
      type: String,
      required: true,
      trim: true,            // it automatically removes whitespace 
      index: true
    },
    pfp: {
        type: String,     // we will take its url from cloudinary
        required: true
    },
    refreshToken: {
      type: String,
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

export const User = mongoose.model("User", userSchema)