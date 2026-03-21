import express from "express";
import * as serviceController from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.post("/", serviceController.createService);
router.put("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);
router.patch("/:id/archive", serviceController.archiveService);
router.patch("/:id/restore", serviceController.restoreService);

export default router;
