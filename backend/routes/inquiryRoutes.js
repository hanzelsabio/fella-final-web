import express from "express";
import {
  getAllInquiries,
  getInquiryById,
  deleteInquiry,
  archiveInquiry,
  restoreInquiry,
  markAsResponded,
  markAsCancelled,
  markAsPending,
  updatePriority,
} from "../controllers/inquiryController.js";
import { submitInquiry } from "../controllers/inquirySubmitController.js";

const router = express.Router();

// ── Public route (used by the inquiry form on the website) ──
router.post("/submit", submitInquiry);

// ── Admin routes ──
router.get("/", getAllInquiries);
router.get("/:inquiry_number", getInquiryById);
router.delete("/:id", deleteInquiry);
router.patch("/:id/archive", archiveInquiry);
router.patch("/:id/restore", restoreInquiry);
router.patch("/:id/responded", markAsResponded);
router.patch("/:id/cancelled", markAsCancelled);
router.patch("/:id/pending", markAsPending);
router.patch("/:id/priority", updatePriority);

export default router;
