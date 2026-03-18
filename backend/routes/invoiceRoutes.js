import express from "express";
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  archiveInvoice,
  restoreInvoice,
  markAsPaid,
  markAsUnpaid,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/", getAllInvoices);
router.get("/:id", getInvoiceById);
router.post("/", createInvoice);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);
router.patch("/:id/archive", archiveInvoice);
router.patch("/:id/restore", restoreInvoice);
router.patch("/:id/paid", markAsPaid);
router.patch("/:id/unpaid", markAsUnpaid);

export default router;
