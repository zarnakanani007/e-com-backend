import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper to verify admin from token
const verifyAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new Error("Unauthorized, token missing!");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      throw new Error("Unauthorized, admin only!");
    }
    return decoded;
  } catch (err) {
    throw new Error("Unauthorized, invalid token!");
  }
};

// Get All Users
export const getUsers = async (req, res) => {
  try {
    verifyAdminToken(req);
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    verifyAdminToken(req);
    const { name, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.role = role || user.role;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    verifyAdminToken(req);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
