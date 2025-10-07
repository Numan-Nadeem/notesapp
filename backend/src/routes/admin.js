import express from "express";
import {
  getAllNotesWithUsers,
  getUsers,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("admin"));

router.get("/users", getUsers);
router.get("/notes", getAllNotesWithUsers);

export default router;
