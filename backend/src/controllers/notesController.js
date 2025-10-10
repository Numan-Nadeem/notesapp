import cloudinary from "../config/cloudinary.js";
import { deleteImageFile } from "../middlewares/uploadMiddleware.js";
import * as notesService from "../services/notesService.js";
import Note from "../model/notesModel.js"; // Add this import
import path from "path";
import fs from "fs";

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
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          transformation: [
            {
              width: 1200,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        });

        imageUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
        fs.unlinkSync(file.path);
      }
    }

    const newNote = await notesService.createNewNote(
      title,
      content,
      req.user.id,
      imageUrls
    );

    res.status(201).json(newNote);
  } catch (err) {
    // Clean up local uploads in case of failure
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    next(err);
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, existingImages } = req.body;

    // Get the current note to compare images
    const currentNote = await Note.findOne(
      req.user.role === "admin" ? { _id: id } : { _id: id, user: req.user.id }
    );

    if (!currentNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    let keptImageUrls = [];
    if (existingImages) {
      try {
        keptImageUrls = JSON.parse(existingImages);
      } catch (e) {
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
          console.log(`✅ Deleted image ${image.public_id} from Cloudinary`);
        } catch (err) {
          console.error(
            `❌ Failed to delete image ${image.public_id}:`,
            err.message
          );
        }
      }
    }

    let newImageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          transformation: [
            {
              width: 1200,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        });

        newImageUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
        fs.unlinkSync(file.path);
      }
    }

    const updateData = {
      title,
      content,
      images: [...keptImages, ...newImageUrls], // Fixed: spread newImageUrls instead of wrapping in array
    };

    const updatedNote = await notesService.updateNote(
      id,
      req.user.id,
      req.user.role,
      updateData
    );
    if (!updatedNote) return res.status(404).json({ error: "Note not found" });

    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    // Clean up local uploads in case of failure
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ error: error.message });
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
