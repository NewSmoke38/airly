import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"



const app = express();

// CORS Configuration
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// here we set a limit to how much JSON we can recieve 
app.use(express.json({limit: "16kb"}))    // middleware is needed for JSON 

// getting req from a url
app.use(express.urlencoded({extended: true, limit: "16kb"}))   // extended here makes the url have nested objects also, its a powerful thing man

// for storing public kinda stuff so that anyone can use it, pdfs, images and all
app.use(express.static("public"))

app.use(cookieParser())

// for pfp being too large 
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Profile picture too large. Max 3MB allowed." });
  }

  // let other errors pass through
  next(err);
});


// routes import
import userRouter from './routes/user.routes.js'
import profileRouter from "./routes/profile.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import adminRouter from "./routes/admin.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/admin", adminRouter);       

// http://localhost:8000/api/v1/users/register







export default app;