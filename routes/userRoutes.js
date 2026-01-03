import express from "express";
import { getUsers, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// No middleware needed here, admin check is inside controller
router.get("/", getUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
