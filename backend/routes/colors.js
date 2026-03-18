import express from "express";
import * as colorController from "../controllers/colorController.js";

const router = express.Router();

router.get("/", colorController.getAllColors);
router.get("/:id", colorController.getColorById);
router.post("/", colorController.createColor);
router.put("/:id/archive", colorController.archiveColor);
router.put("/:id/restore", colorController.restoreColor);
router.put("/:id", colorController.updateColor);
router.delete("/:id", colorController.deleteColor);

export default router;
