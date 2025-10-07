import express from "express";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../controllers/notesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotes);
router.post("/", upload.array("images", 5), createNote);
router.put("/:id", upload.array("images", 5), updateNote);
router.delete("/:id", deleteNote);

export default router;
