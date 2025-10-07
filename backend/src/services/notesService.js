import { deleteImageFile } from "../middlewares/uploadMiddleware.js";
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

  if (role === "admin") note = await Note.findById(id);
  else note = await Note.findOne({ _id: id, user });

  if (note && note.images && note.images.length > 0) {
    note.images.forEach((imagePath) => deleteImageFile(imagePath));
  }

  if (role === "admin") {
    return await Note.findByIdAndDelete(id);
  }
  return await Note.findByIdAndDelete({ _id: id, user });
};
