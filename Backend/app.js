import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";

// Load environment variables (will use Railway env vars)
dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ["https://airly.vercel.app", "https://airly.in", process.env.ALLOWED_ORIGINS].filter(Boolean) // Add your frontend URL to environment variables
        : ["http://localhost:3000", "http://localhost:5173", "https://airly-git-main-newsmoke38s-projects.vercel.app/"],
    credentials: true
}));

app.use(express.json({limit: "16kb"}))    

app.use(express.urlencoded({extended: true, limit: "16kb"}))   

app.use(express.static("public"))

app.use(cookieParser())

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Profile picture too large. Max 3MB allowed." });
  }

  next(err);
});

// routes import
import userRouter from './src/routes/user.routes.js'
import profileRouter from "./src/routes/profile.routes.js";
import tweetRouter from "./src/routes/tweet.routes.js";
import adminRouter from "./src/routes/admin.routes.js";
import feedRouter from "./src/routes/feed.routes.js";
import commentRouter from "./src/routes/comment.routes.js";
import viewsRouter from "./src/routes/views.routes.js";
import likeRouter from "./src/routes/like.routes.js";
import bookmarkRouter from "./src/routes/bookmark.routes.js";
import testRouter from "./src/routes/test.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/admin", adminRouter);       
app.use("/api/v1/feed", feedRouter);
app.use("/api/v1", commentRouter);
app.use("/api/v1/views", viewsRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/bookmarks", bookmarkRouter);

// Test route for backend health check
app.use("/", testRouter);

// Server startup function
const startServer = async () => {
  try {
    await connectDB();

    app.on("error", (error) => {    // to check if there are any errors 
      console.log("ERROR", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {   // app will listen
      console.log(` Server is running at port : ${process.env.PORT}`);                 
    });
  } catch (err) {
    console.log("MONGO db connection failed !!! ", err);
  }
}

// Start the server
startServer();

export default app; 