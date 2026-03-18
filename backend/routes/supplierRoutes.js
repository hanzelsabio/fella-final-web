import express from "express";
import {
  getAllSuppliers,
  getSupplierById,
  getSupplierBySlug,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  archiveSupplier,
  restoreSupplier,
} from "../controllers/supplierController.js";

const router = express.Router();

router.get("/", getAllSuppliers);
router.get("/slug/:slug", getSupplierBySlug); // ← must be before /:id
router.get("/:id", getSupplierById);
router.post("/", createSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);
router.patch("/:id/archive", archiveSupplier);
router.patch("/:id/restore", restoreSupplier);

export default router;
