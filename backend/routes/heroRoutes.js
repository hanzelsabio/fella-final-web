import express from "express";
import {
  getAllSlides,
  getActiveSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  archiveSlide,
  restoreSlide,
} from "../controllers/heroController.js";

const router = express.Router();

router.get("/", getAllSlides);
router.get("/active", getActiveSlides);
router.post("/", createSlide);
router.put("/:id", updateSlide);
router.delete("/:id", deleteSlide);
router.patch("/:id/archive", archiveSlide);
router.patch("/:id/restore", restoreSlide);

export default router;
