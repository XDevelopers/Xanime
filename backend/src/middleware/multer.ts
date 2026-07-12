import multer from "multer";
import path from "path";
import { Request } from "express";
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/products");
  },

  filename(req, file, cb) {
    const uniqueName =
`product_${Date.now()}_${Math.round(Math.random()*10000)}`;

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Only JPG, PNG and WEBP images files are allowed."));
};

export const uploadProductImages = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
