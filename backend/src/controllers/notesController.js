import cloudinary from "../config/cloudinary.js";
import * as notesService from "../services/notesService.js";
import { notFoundError } from "../utils/ApiError.js";
import fs from "fs";

// Remove any locally-buffered multer files (best effort).
const cleanupLocalFiles = (files) => {
  if (!files) return;
  for (const file of files) {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore */
      }
    }
  }
};

// Upload a batch of local files to Cloudinary and remove them from disk.
const uploadImages = async (files = []) => {
  const uploaded = [];
  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      transformation: [
        { width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" },
      ],
    });
    uploaded.push({ url: result.secure_url, public_id: result.public_id });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }
  return uploaded;
};

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

export const getNote = async (req, res, next) => {
  try {
    const note = await notesService.getNoteById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    if (!note) throw notFoundError("Note not found");
    res.json(note);
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const imageUrls = await uploadImages(req.files);

    const newNote = await notesService.createNewNote(
      title,
      content,
      req.user.id,
      imageUrls
    );

    res.status(201).json(newNote);
  } catch (err) {
    cleanupLocalFiles(req.files);
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, existingImages } = req.body;

    const currentNote = await notesService.getNoteById(
      id,
      req.user.id,
      req.user.role
    );
    if (!currentNote) throw notFoundError("Note not found");

    let keptImageUrls = [];
    if (existingImages) {
      try {
        keptImageUrls = JSON.parse(existingImages);
      } catch {
        keptImageUrls = [];
      }
    }

    const keptImages = currentNote.images.filter((img) =>
      keptImageUrls.includes(img.url)
    );

    const imagesToDelete = currentNote.images.filter(
      (img) => !keptImageUrls.includes(img.url)
    );

    for (const image of imagesToDelete) {
      if (image.public_id) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (err) {
          console.error(
            `❌ Failed to delete image ${image.public_id}:`,
            err.message
          );
        }
      }
    }

    const newImageUrls = await uploadImages(req.files);

    const updateData = {
      title,
      content,
      images: [...keptImages, ...newImageUrls],
    };

    const updatedNote = await notesService.updateNote(
      id,
      req.user.id,
      req.user.role,
      updateData
    );
    if (!updatedNote) throw notFoundError("Note not found");

    res.json(updatedNote);
  } catch (err) {
    cleanupLocalFiles(req.files);
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await notesService.deleteNote(id, req.user.id, req.user.role);
    if (!note) throw notFoundError("Note not found");

    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
};
