import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// try catch method is always best
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URI}/${"Vibely"}`)
        console.log(`\nMongoDB connected !! DB HOST:
            ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGODB connection FAILED", error);
        process.exit(1)
    }
}; 

export default connectDB; 