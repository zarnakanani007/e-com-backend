import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Use user ID + original extension to overwrite
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}${ext}`);
  },
});

export const upload = multer({ storage });
