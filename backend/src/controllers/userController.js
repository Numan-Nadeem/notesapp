import { getAllNotes, getAllUsers } from "../services/userService.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    if (!users) throw new Error("No users found!");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllNotesWithUsers = async (req, res, next) => {
  try {
    const notes = await getAllNotes();
    if (!notes) throw new Error("No notes found!");
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};
