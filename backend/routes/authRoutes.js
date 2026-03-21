import express from "express";
import {
  adminLogin,
  staffLogin,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin/login", adminLogin);
router.post("/staff/login", staffLogin);

// Protected profile routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/profile/change-password", verifyToken, changePassword);

export default router;
