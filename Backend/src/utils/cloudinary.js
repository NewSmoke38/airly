import {v2 as cloudinary} from "cloudinary"
import fs from "fs" 

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });



        // Uploading an image   
    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if (!localFilePath) return null  //If no file path is given (maybe the user didn’t upload a file), it immediately returns null.

            // upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"  // which type of file is it pic, vid..know yourself
            })
            // file has been uploaded successfully
                fs.unlinkSync(localFilePath)
                return response;
                
            
        } catch (error) {
            fs.unlinkSync(localFilePath) // removes the locally saved temporrary file as the upload operation got failed
            return null;
        }
    }

export { uploadOnCloudinary };








    
