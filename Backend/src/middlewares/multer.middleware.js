import multer from "multer";

// for pfp media in user profile
const pfpStorage = multer.diskStorage({
  destination: function (req, file, cb) {     
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)
  }
})

export const uploadPfp = multer({ 
    storage: pfpStorage,
     limits: { fileSize: 1 * 1024 * 1024 } // 1 mb limit
 })


 // for pics in tweets
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/temp"),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

export const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});