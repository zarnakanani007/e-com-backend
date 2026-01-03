import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getReviewStats
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.get("/stats/:productId", getReviewStats);
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;  