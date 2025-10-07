import { deleteImageFile } from "../middlewares/uploadMiddleware.js";
import * as notesService from "../services/notesService.js";

export const getNotes = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await notesService.getAllNotes({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || "",
      user: req.user.id,
      role: req.user.role,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];
    const newNote = await notesService.createNewNote(
      title,
      content,
      req.user.id,
      images
    );
    res.status(201).json(newNote);
  } catch (err) {
    if (req.files) req.files.forEach((file) => deleteImageFile(file.path));
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, keepExistingImages } = req.body;
    const newImages = req.files ? req.files.map((file) => file.path) : [];

    const existingNote = notesService.getAllNotes({
      page: 1,
      limit: 1,
      user: req.user.id,
      role: req.user.role,
    });

    const note = existingNote.notes.find((n) => n._id.toString() === id);

    const updateData = { title, content };

    if (keepExistingImages === true && note && note.images)
      updateData.images = [...note.images, newImages];
    else {
      if (note && note.images)
        note.images.forEach((imageFile) => deleteImageFile(imageFile.path));
      updateData.images = newImages;
    }

    const updatedNote = await notesService.updateNote(
      id,
      req.user.id,
      req.user.role,
      updateData
    );
    if (!note) return res.status(404).json({ error: "Note not found" });

    res.json(note);
  } catch (err) {
    if (req.files) {
      req.files.forEach((file) => deleteImageFile(file.path));
    }
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await notesService.deleteNote(id, req.user.id, req.user.role);
    if (!note) return res.status(404).json({ error: "Note not found" });

    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
};
