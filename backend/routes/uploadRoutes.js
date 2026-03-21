import express from "express";
import * as uploadController from "../controllers/uploadController.js";

const router = express.Router();

router.post("/image", uploadController.uploadImage);
router.delete("/image", uploadController.deleteImage);

export default router;
