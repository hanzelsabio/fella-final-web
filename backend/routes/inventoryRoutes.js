import express from "express";
import {
  getAllInventory,
  getInventoryById,
  getInventoryBySlug,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  archiveInventoryItem,
  restoreInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getAllInventory);
router.get("/slug/:slug", getInventoryBySlug);
router.get("/:id", getInventoryById);
router.post("/", createInventoryItem);
router.put("/:id", updateInventoryItem);
router.delete("/:id", deleteInventoryItem);
router.patch("/:id/archive", archiveInventoryItem);
router.patch("/:id/restore", restoreInventoryItem);

export default router;
