import express from "express";
import {
  getAllReviews,
  getActiveReviews,
  createReview,
  updateReview,
  deleteReview,
  archiveReview,
  restoreReview,
  getReviewsSettings,
  updateReviewsSettings,
} from "../controllers/reviewsController.js";

const router = express.Router();

router.get("/settings", getReviewsSettings);
router.put("/settings", updateReviewsSettings);
router.get("/", getAllReviews);
router.get("/active", getActiveReviews);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.patch("/:id/archive", archiveReview);
router.patch("/:id/restore", restoreReview);

export default router;
