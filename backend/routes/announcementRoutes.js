import express from "express";
import {
  getAllAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  restoreAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

router.get("/", getAllAnnouncements);
router.get("/active", getActiveAnnouncements);
router.post("/", createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);
router.patch("/:id/archive", archiveAnnouncement);
router.patch("/:id/restore", restoreAnnouncement);

export default router;
