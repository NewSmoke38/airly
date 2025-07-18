import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from './app.js';

dotenv.config({
    path: './.env'
});

const startServer = async () => {
  try {
           await connectDB();

        app.on("error", (error) => {    // to check if there are any errors 
        console.log("ERROR", error);
        throw error;
    });


    app.listen(process.env.PORT || 8000, () => {   // app will listen and start the server, imp for aws deployement
        console.log(` Server is running at port :     
            ${process.env.PORT}`);                 

    });
} catch (err) {
    console.log("MONGO db connection failed !!! ", err);
    
}
}

startServer();

app.get('/', (req, res) => {
  res.send('Yo, backend is live! Welcome to the API.');
});

