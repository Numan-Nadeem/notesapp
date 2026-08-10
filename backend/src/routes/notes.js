import express from "express";
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from "../controllers/notesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { validateNote } from "../middlewares/validate.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", upload.array("images", 5), validateNote, createNote);
router.put("/:id", upload.array("images", 5), validateNote, updateNote);
router.delete("/:id", deleteNote);

export default router;
