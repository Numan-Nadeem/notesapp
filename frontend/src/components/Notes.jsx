import React, { useEffect, useState } from "react";
import SpotlightCard from "./SpotlightCard";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../services/api.js";
import { FiEdit2, FiPaperclip, FiTrash, FiX } from "react-icons/fi";
import { GoKebabHorizontal } from "react-icons/go";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    createdAt: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNoteId, setUpdateNoteId] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const [optionsNoteId, setOptionsNoteId] = useState(null);
  const [imageFile, setImageFile] = useState([]);

  const handleAddNote = async (e) => {
    e.preventDefault();

    if (!newNote.title.trim() || !newNote.content.trim()) {
      console.warn("Please enter both title and content");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newNote.title);
      formData.append("content", newNote.content);

      if (imageFile && imageFile.length > 0) {
        imageFile.forEach((file) => formData.append("images", file));
      }

      const createdNote = await createNote(formData);

      if (createdNote) {
        setNotes((prev) => [createdNote, ...prev]);
        setNewNote({ title: "", content: "" });
        setImageFile([]);
        closeModal();
      }
    } catch (error) {
      console.error("❌ Error creating note:", error);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (newNote.title.trim() && newNote.content.trim() && updateNoteId) {
      try {
        const noteData = {
          title: newNote.title,
          content: newNote.content,
        };

        await updateNote(updateNoteId, noteData);

        setNotes(
          notes.map((note) =>
            note._id === updateNoteId ? { ...note, ...noteData } : note
          )
        );

        setNewNote({ title: "", content: "" });
        closeModal();
        setIsUpdating(false);
        setUpdateNoteId(null);
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  const handleEditClick = (noteId, title, content) => {
    setIsUpdating(true);
    setUpdateNoteId(noteId);
    setNewNote({ title, content });
    setShowModal(true);
  };

  const openModal = () => {
    setShowModal(true);
    setIsModalClosing(false);
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsModalClosing(false);
      setIsUpdating(false);
      setUpdateNoteId(null);
      setNewNote({ title: "", content: "" });
    }, 200);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      if (data && data.notes) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Notes</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Add New Note
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
          <div
            className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 text-white max-w-2xl w-full transform transition-all duration-200 ease-out ${
              isModalClosing
                ? "scale-95 opacity-0"
                : "scale-100 opacity-100 animate-bounce-in"
            }`}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-lg cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6">
              {isUpdating ? "Update Note" : "Add New Note"}
            </h2>

            <form onSubmit={isUpdating ? handleUpdateNote : handleAddNote}>
              <div className="mb-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter note title"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  rows={6}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-800 mb-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter note content"
                  required
                ></textarea>
                <div className="flex gap-4">
                  <label className="inline-block">
                    <span className="flex items-center gap-2 bg-black/60 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-colors font-semibold cursor-pointer">
                      <FiPaperclip /> Upload Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setImageFile(files);
                      }}
                    />
                  </label>
                  {imageFile && imageFile.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {imageFile.map((image, idx) => (
                        <div
                          key={idx}
                          className="relative group w-[5rem] h-[5rem]"
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${idx + 1}`}
                            className="rounded-xl w-full h-full object-cover border border-neutral-700"
                          />

                          <div
                            className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            onClick={() => {
                              const updated = imageFile.filter(
                                (_, i) => i !== idx
                              );
                              setImageFile(updated);
                            }}
                          >
                            <FiTrash className="text-xl text-red-400 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition-colors font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold cursor-pointer"
                >
                  {isUpdating ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {notes.map((note) => (
          <div
            key={note._id}
            className="relative"
            onMouseEnter={() => setHoveredNoteId(note._id)}
            onMouseLeave={() => {
              setHoveredNoteId(null);
              setOptionsNoteId(null);
            }}
          >
            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgb(21, 93, 252,0.3)"
            >
              <div className="flex justify-between items-center pb-3">
                <h1 className="text-xl font-bold line-clamp-2">{note.title}</h1>
                {hoveredNoteId === note._id && optionsNoteId !== note._id && (
                  <button
                    className="absolute top-2 right-2 px-2 py-1 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsNoteId(note._id);
                    }}
                  >
                    <GoKebabHorizontal />
                  </button>
                )}
                {optionsNoteId === note._id && (
                  <div
                    className={`absolute flex gap-1 top-2 right-2 bg-[rgb(6,0,16)] p-1 rounded-lg transform transition-all duration-200 ease-out ${
                      isModalClosing
                        ? "scale-95 opacity-0"
                        : "scale-100 opacity-100 animate-bounce-in"
                    }`}
                  >
                    <button
                      className="p-1 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-600"
                      onClick={() =>
                        handleEditClick(note._id, note.title, note.content)
                      }
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="p-1 rounded-lg cursor-pointer transition-all duration-300 hover:bg-red-600 hover:border-red-400"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      <FiTrash />
                    </button>
                    <button
                      className="p-1 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-600"
                      onClick={() => setOptionsNoteId(null)}
                      title="Close"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
              <p className="line-clamp-6 mb-5">{note.content}</p>

              {note.images && note.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {note.images.map((image, idx) => {
                    let imageUrl =
                      typeof image === "string" ? image : image.url;
                    imageUrl = imageUrl.replace(/\\/g, "/").replace(/^\/+/, "");
                    const BASE_URL = "http://localhost:3000";
                    imageUrl = `${BASE_URL}/uploads/${imageUrl
                      .split("uploads/")
                      .pop()}`;

                    return (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-neutral-700"
                      >
                        <img
                          src={imageUrl}
                          alt={`Note Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              <span
                className="absolute bottom-3 left-6 text-gray-500 text-xs mt-6"
                style={{ right: "auto" }}
              >
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleString()
                  : ""}
              </span>
            </SpotlightCard>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white text-lg">
            No notes yet. Create your first note!
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Notes;
