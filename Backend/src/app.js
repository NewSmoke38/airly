import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"



const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
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
import userRouter from './routes/user.routes.js'
import profileRouter from "./routes/profile.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import adminRouter from "./routes/admin.routes.js";
import feedRouter from "./routes/feed.routes.js";
import commentRouter from "./routes/comment.routes.js";


// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/admin", adminRouter);       
app.use("/api/v1/feed", feedRouter);
app.use("/api/v1", commentRouter);

// http://localhost:8000/api/v1/users/register







export default app;