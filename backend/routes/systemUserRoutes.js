import express from "express";
import {
  getAllSystemUsers,
  getSystemUserById,
  getSystemUserByUserId,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  archiveSystemUser,
  restoreSystemUser,
} from "../controllers/systemUserController.js";

const router = express.Router();

router.get("/", getAllSystemUsers);
router.get("/uid/:userId", getSystemUserByUserId);
router.get("/:id", getSystemUserById);
router.post("/", createSystemUser);
router.put("/:id", updateSystemUser);
router.delete("/:id", deleteSystemUser);
router.patch("/:id/archive", archiveSystemUser);
router.patch("/:id/restore", restoreSystemUser);

export default router;
