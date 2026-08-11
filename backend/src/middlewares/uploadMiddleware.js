import fs from "fs";
import path from "path";
import multer from "multer";

// A serverless filesystem is read-only apart from /tmp, so staged uploads have
// to land there before they're forwarded to Cloudinary.
const uploadsDir = process.env.VERCEL
  ? "/tmp/uploads/images"
  : "uploads/images";

// Created on first upload rather than at import time: an import-time mkdir
// throws EROFS on a read-only filesystem and takes the whole app down with it.
const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadsDir();
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
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
