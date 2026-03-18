import express from "express";
import {
  getAllCustomers,
  getCustomerById,
  getCustomerBySlug,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  archiveCustomer,
  restoreCustomer,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/", getAllCustomers);
router.get("/slug/:slug", getCustomerBySlug);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.patch("/:id/archive", archiveCustomer);
router.patch("/:id/restore", restoreCustomer);

export default router;
