import express from "express";
import {
  getAllFaqs,
  getActiveFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  archiveFaq,
  restoreFaq,
} from "../controllers/faqsController.js";

const router = express.Router();

router.get("/", getAllFaqs);
router.get("/active", getActiveFaqs);
router.post("/", createFaq);
router.put("/:id", updateFaq);
router.delete("/:id", deleteFaq);
router.patch("/:id/archive", archiveFaq);
router.patch("/:id/restore", restoreFaq);

export default router;
