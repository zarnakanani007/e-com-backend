import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  updateProfile,
  deleteAccount,
  getRegisteredEmails,
  googleLogin,
  getProfile,
} from "../controllers/authControllers.js";

const router = express.Router();

// Multer Config 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // For logged-in user (update profile)
    if (req.user) {
      const ext = path.extname(file.originalname);
      cb(null, `${req.user._id}-${Date.now()}${ext}`);
    } else {
      // For registration (user not yet created)
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  },
});

const upload = multer({ storage });

// Routes
// Register (with avatar)
router.post("/register", upload.single("avatar"), registerUser);

// Login (email/password)
router.post("/login", loginUser);

// Update profile (with avatar)
router.put("/update-profile", protect, upload.single("avatar"), updateProfile);

// Delete account
router.delete("/delete", protect, deleteAccount);

// Get all registered emails
router.get("/emails", protect, getRegisteredEmails);

// Google login
router.post("/google", googleLogin);

// Get logged-in user profile
router.get("/profile", protect, getProfile);

export default router;
