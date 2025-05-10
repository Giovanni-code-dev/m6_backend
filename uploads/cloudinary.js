import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configura Cloudinary con le variabili d'ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage con nome file unico
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "epicode",
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        return uniqueSuffix + '-' + file.originalname
      },
    },
  })

  // Filter per accettare solo immagini
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo file immagine sono consentiti!"), false)
    }
  }
  
  const cloudinaryUploader = multer({ storage, fileFilter })

  export default cloudinaryUploader
