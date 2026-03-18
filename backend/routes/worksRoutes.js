import express from "express";
import {
  getAllWorks,
  getActiveWorks,
  createWork,
  updateWork,
  deleteWork,
  archiveWork,
  restoreWork,
} from "../controllers/worksController.js";

const router = express.Router();

router.get("/", getAllWorks);
router.get("/active", getActiveWorks);
router.post("/", createWork);
router.put("/:id", updateWork);
router.delete("/:id", deleteWork);
router.patch("/:id/archive", archiveWork);
router.patch("/:id/restore", restoreWork);

export default router;
