import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = "uploads/images";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  },
});

export const deleteImageFile = (imagePath) => {
  try {
    const normalizedPath = path.normalize(imagePath);
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
      console.log("Image deleted! ", normalizedPath);
    } else {
      console.log("File not found! ", normalizedPath);
    }
  } catch (error) {
    console.log(error);
  }
};
