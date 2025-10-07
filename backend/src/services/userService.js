import Note from "../model/notesModel.js";
import User from "../model/User.js";

export const getAllUsers = () => User.find({});

export const getAllNotes = () =>
  Note.find({}).populate("user", "name email role").exec();
