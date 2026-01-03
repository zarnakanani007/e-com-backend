import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// -------------------- Register --------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required!" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatar = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFileName = `${Date.now()}-${req.file.originalname}`;
      const uploadsDir = path.join(process.cwd(), "uploads");
      const newPath = path.join(uploadsDir, newFileName);
      fs.renameSync(req.file.path, newPath);
      avatar = `/uploads/${newFileName}`;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      avatar,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: avatar
          ? `${req.protocol}://${req.get("host")}${avatar}?t=${Date.now()}`
          : null,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// -------------------- Login --------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password)
      return res
        .status(400)
        .json({ message: "Use Google login for this account" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    const avatarURL = user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${req.protocol}://${req.get("host")}${user.avatar}?t=${Date.now()}`
      : null;

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: avatarURL,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// -------------------- Google OAuth Login --------------------
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) return res.status(400).json({ message: "Google token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        password: null,
        role: "user",
        avatar: picture || null,
      });
    } else if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save();
    }

    const jwtToken = generateToken(user);

    const avatarURL = user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${req.protocol}://${req.get("host")}${user.avatar}?t=${Date.now()}`
      : null;

    res.status(200).json({
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: avatarURL,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({ message: "Google login failed", error: error.message });
  }
};

// -------------------- Update Profile --------------------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.file) {
      const uploadsDir = path.join(process.cwd(), "uploads");

      if (user.avatar && !user.avatar.startsWith("http")) {
        const oldPath = path.join(uploadsDir, path.basename(user.avatar));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const ext = path.extname(req.file.originalname);
      const newFileName = `${user._id}-${Date.now()}${ext}`;
      const newPath = path.join(uploadsDir, newFileName);
      fs.renameSync(req.file.path, newPath);
      user.avatar = `/uploads/${newFileName}`;
    }

    await user.save();

    const avatarURL = user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${req.protocol}://${req.get("host")}${user.avatar}?t=${Date.now()}`
      : null;

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: avatarURL,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// -------------------- Delete Account --------------------
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "Account deleted successfully!" });
  } catch (error) {
    console.error("Delete account error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// -------------------- Get All Emails --------------------
export const getRegisteredEmails = async (req, res) => {
  try {
    const users = await User.find().select("email -_id");
    const emails = users.map((user) => user.email);
    res.status(200).json(emails);
  } catch (error) {
    console.error("Get emails error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// -------------------- Get Logged-in User Profile --------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const avatarURL = user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${req.protocol}://${req.get("host")}${user.avatar}?t=${Date.now()}`
      : null;

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: avatarURL,
    });
  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
