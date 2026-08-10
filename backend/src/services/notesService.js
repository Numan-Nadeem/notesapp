import cloudinary from "../config/cloudinary.js";
import Note from "../model/notesModel.js";

export const getAllNotes = async ({
  page = 1,
  limit = 5,
  search = "",
  user,
  role,
}) => {
  const query =
    role === "admin"
      ? search
        ? { title: { $regex: search, $options: "i" } }
        : {}
      : {
          user,
          ...(search && { title: { $regex: search, $options: "i" } }),
        };

  const skip = (page - 1) * limit;

  let notesQuery = Note.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (role === "admin") {
    notesQuery = notesQuery.populate("user", "name email role");
  }

  const notes = await notesQuery;

  const total = await Note.countDocuments(query);
  return {
    notes,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

export const getNoteById = async (id, user, role) => {
  const filter = role === "admin" ? { _id: id } : { _id: id, user };
  return await Note.findOne(filter);
};

export const createNewNote = async (title, content, user, images = []) =>
  await Note.create({ title, content, user, images });

export const updateNote = async (id, user, role, data) => {
  if (role === "admin") {
    return await Note.findByIdAndUpdate(id, data, { new: true });
  }
  return await Note.findOneAndUpdate({ _id: id, user }, data, { new: true });
};

export const deleteNote = async (id, user, role) => {
  let note;

  if (role === "admin") {
    note = await Note.findById(id);
  } else {
    note = await Note.findOne({ _id: id, user });
  }

  if (!note) return null;

  if (note.images && note.images.length > 0) {
    for (const image of note.images) {
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
  }

  const deletedNote =
    role === "admin"
      ? await Note.findByIdAndDelete(id)
      : await Note.findOneAndDelete({ _id: id, user });

  return deletedNote;
};
