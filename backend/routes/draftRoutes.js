import express from "express";
import * as draftController from "../controllers/draftController.js";

const router = express.Router();

router.get("/", draftController.getAllDrafts);
router.get("/:id", draftController.getDraftById);
router.post("/", draftController.saveDraft);
router.put("/:id", draftController.saveDraft);
router.delete("/:id", draftController.deleteDraft);
router.post("/:id/publish", draftController.publishDraft);

export default router;
