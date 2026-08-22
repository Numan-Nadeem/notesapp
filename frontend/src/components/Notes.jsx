import React, { Suspense, useEffect, useMemo, useState } from "react";
import SpotlightCard from "./SpotlightCard";
import NoteViewModal from "./NoteViewModal";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../services/api.js";
import formatDate from "../utils/formatDate.js";
import {
  FiEdit2,
  FiPaperclip,
  FiTrash,
  FiX,
  FiPlus,
  FiSearch,
  FiFileText,
  FiImage,
  FiClock,
} from "react-icons/fi";

const LazyImage = React.lazy(() => import("./LazyImage.jsx"));

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    image: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateNoteId, setUpdateNoteId] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const [optionsNoteId, setOptionsNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingNote, setViewingNote] = useState(null);
  const [isViewClosing, setIsViewClosing] = useState(false);

  const openNoteView = (note) => {
    setIsViewClosing(false);
    setViewingNote(note);
    setOptionsNoteId(null);
  };

  const closeNoteView = () => {
    setIsViewClosing(true);
    setTimeout(() => {
      setViewingNote(null);
      setIsViewClosing(false);
    }, 200);
  };

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

      if (newNote.image && newNote.image.length > 0) {
        newNote.image.forEach((file) => formData.append("images", file));
      }

      const createdNote = await createNote(formData);

      if (createdNote) {
        setNotes((prev) => [createdNote, ...prev]);
        setNewNote({ title: "", content: "", image: [] });
        closeModal();
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim() || !updateNoteId) {
      console.warn("Please enter both title and content");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newNote.title);
      formData.append("content", newNote.content);

      const existingImages = newNote.image.filter(
        (img) => typeof img === "string"
      );
      const newImages = newNote.image.filter((img) => img instanceof File);

      formData.append("existingImages", JSON.stringify(existingImages));

      if (newImages.length > 0) {
        newImages.forEach((file) => formData.append("images", file));
      }

      const response = await updateNote(updateNoteId, formData);

      setNotes(
        notes.map((note) => (note._id === updateNoteId ? response.data : note))
      );

      setNewNote({ title: "", content: "", image: [] });
      closeModal();
      setIsUpdating(false);
      setUpdateNoteId(null);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleEditClick = (noteId, title, content, images) => {
    setIsUpdating(true);
    setUpdateNoteId(noteId);
    setNewNote({ title, content, image: images.map((image) => image.url) });
    setShowModal(true);
  };

  const handleViewEdit = (note) => {
    setViewingNote(null);
    handleEditClick(note._id, note.title, note.content, note.images || []);
  };

  const handleViewDelete = (noteId) => {
    handleDeleteNote(noteId);
    closeNoteView();
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
      setLoading(true);
      const data = await getNotes();
      if (data && data.notes) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-xs font-medium tracking-widest uppercase mb-2"
              style={{ color: "var(--color-accent)" }}
            >
              Your collection
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold tracking-[-0.02em]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Notes
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              {loading
                ? "Loading..."
                : `${notes.length} note${notes.length === 1 ? "" : "s"} total`}
            </p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer hover:translate-y-[-1px]"
            style={{ background: "var(--color-accent)", color: "#060010" }}
          >
            <FiPlus size={16} />
            New note
          </button>
        </div>

        {/* Search */}
        {notes.length > 0 && (
          <div className="relative max-w-md">
            <FiSearch
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm transition-colors duration-200"
              style={{
                border: "1px solid var(--color-border-default)",
                background: "var(--color-surface-raised)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className={`relative rounded-2xl overflow-hidden p-8 text-white max-w-2xl w-full transform transition-all duration-200 ease-out ${
              isModalClosing
                ? "scale-95 opacity-0"
                : "scale-100 opacity-100 animate-bounce-in"
            }`}
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 transition-colors p-2 rounded-lg cursor-pointer"
              style={{ color: "var(--color-text-muted)" }}
            >
              <FiX size={20} />
            </button>

            <p
              className="text-xs font-medium tracking-widest uppercase mb-2"
              style={{ color: "var(--color-accent)" }}
            >
              {isUpdating ? "Edit note" : "New note"}
            </p>
            <h2 className="text-2xl font-bold mb-8">
              {isUpdating ? "Update your note" : "Create a note"}
            </h2>

            <form onSubmit={isUpdating ? handleUpdateNote : handleAddNote}>
              <div className="mb-5">
                <label
                  htmlFor="title"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
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
                  className="w-full px-4 py-3 rounded-xl text-sm transition-colors duration-200"
                  style={{
                    border: "1px solid var(--color-border-default)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="Give it a title"
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="content"
                  className="block text-xs font-medium mb-2"
                  style={{ color: "var(--color-text-secondary)" }}
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
                  className="w-full px-4 py-3 rounded-xl mb-4 text-sm resize-none transition-colors duration-200"
                  style={{
                    border: "1px solid var(--color-border-default)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="Start writing..."
                  required
                ></textarea>

                {/* Image upload + previews */}
                <div className="flex gap-4 max-sm:flex-col">
                  <label className="inline-block">
                    <span
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors duration-200 font-medium cursor-pointer text-sm"
                      style={{
                        background: "var(--color-surface-overlay)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      <FiPaperclip size={14} /> Attach images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setNewNote({ ...newNote, image: files });
                      }}
                    />
                  </label>
                  {newNote.image && newNote.image.length > 0 && (
                    <Suspense fallback={null}>
                      <div className="flex gap-2 flex-wrap max-sm:grid max-sm:grid-cols-4">
                        {newNote.image.map((image, idx) => {
                          const imageUrl =
                            image instanceof File
                              ? URL.createObjectURL(image)
                              : image;

                          return (
                            <div
                              key={idx}
                              className="relative group w-[5rem] rounded-lg overflow-hidden"
                              style={{
                                border: "1px solid var(--color-border-subtle)",
                              }}
                            >
                              <LazyImage
                                idx={idx}
                                imageUrl={imageUrl}
                                maxHeight="4rem"
                              />

                              <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                style={{ background: "rgba(0,0,0,0.7)" }}
                                onClick={() => {
                                  const updated = newNote.image.filter(
                                    (_, i) => i !== idx
                                  );
                                  setNewNote({ ...newNote, image: updated });
                                }}
                              >
                                <FiTrash
                                  className="text-sm"
                                  style={{ color: "#f87171" }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Suspense>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end max-sm:flex-col max-sm:items-stretch">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl transition-colors duration-200 font-semibold cursor-pointer max-sm:order-2"
                  style={{
                    background: "var(--color-surface-overlay)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl transition-all duration-200 font-semibold cursor-pointer max-sm:order-1"
                  style={{ background: "var(--color-accent)", color: "#060010" }}
                >
                  {isUpdating ? "Save changes" : "Create note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note view modal — opened by clicking a card */}
      {viewingNote && (
        <NoteViewModal
          note={viewingNote}
          isClosing={isViewClosing}
          onClose={closeNoteView}
          onEdit={() => handleViewEdit(viewingNote)}
          onDelete={() => handleViewDelete(viewingNote._id)}
        />
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 animate-pulse"
              style={{
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border-subtle)",
                minHeight: "180px",
              }}
            >
              <div
                className="h-5 rounded w-2/3 mb-4"
                style={{ background: "var(--color-surface-overlay)" }}
              />
              <div
                className="h-3 rounded w-full mb-2"
                style={{ background: "var(--color-surface-overlay)" }}
              />
              <div
                className="h-3 rounded w-4/5"
                style={{ background: "var(--color-surface-overlay)" }}
              />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 && notes.length > 0 ? (
        <div className="text-center py-20">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--color-surface-raised)",
              color: "var(--color-text-muted)",
            }}
          >
            <FiSearch size={20} />
          </div>
          <p
            className="text-base font-medium mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            No matches found
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Try a different search term.
          </p>
        </div>
      ) : notes.length === 0 ? (
        <div
          className="rounded-2xl p-12 md:p-20 text-center"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "var(--color-accent-dim)",
              color: "var(--color-accent)",
            }}
          >
            <FiFileText size={24} />
          </div>
          <p
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            No notes yet
          </p>
          <p
            className="text-sm mb-8 max-w-xs mx-auto"
            style={{ color: "var(--color-text-muted)" }}
          >
            Create your first note to start organizing your thoughts.
          </p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer hover:translate-y-[-1px]"
            style={{ background: "var(--color-accent)", color: "#060010" }}
          >
            <FiPlus size={16} />
            Create a note
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="relative group cursor-pointer"
              title="Click to view note"
              onClick={() => openNoteView(note)}
              onMouseEnter={() => setHoveredNoteId(note._id)}
              onMouseLeave={() => {
                setHoveredNoteId(null);
                setOptionsNoteId(null);
              }}
            >
              <SpotlightCard
                className="custom-spotlight-card h-full"
                spotlightColor="rgba(200, 255, 0, 0.15)"
              >
                <div className="flex flex-col h-full">
                  {/* Title row */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3
                      className="text-base font-semibold line-clamp-2 leading-snug"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {note.title}
                    </h3>
                    {hoveredNoteId === note._id && optionsNoteId !== note._id && (
                      <button
                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors duration-200"
                        style={{
                          color: "var(--color-text-muted)",
                          background: "var(--color-surface-overlay)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOptionsNoteId(note._id);
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                    )}
                    {optionsNoteId === note._id && (
                      <div
                        className={`absolute top-0 right-0 flex gap-1 p-1 rounded-lg transform transition-all duration-200 ease-out z-20 ${
                          isModalClosing
                            ? "scale-95 opacity-0"
                            : "scale-100 opacity-100 animate-bounce-in"
                        }`}
                        style={{
                          background: "var(--color-surface-overlay)",
                          border: "1px solid var(--color-border-default)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors duration-200 hover:bg-white/5"
                          style={{ color: "var(--color-text-secondary)" }}
                          onClick={() =>
                            handleEditClick(
                              note._id,
                              note.title,
                              note.content,
                              note.images || []
                            )
                          }
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors duration-200"
                          style={{ color: "#f87171" }}
                          onClick={() => handleDeleteNote(note._id)}
                          title="Delete"
                        >
                          <FiTrash size={14} />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md cursor-pointer transition-colors duration-200 hover:bg-white/5"
                          style={{ color: "var(--color-text-muted)" }}
                          onClick={() => setOptionsNoteId(null)}
                          title="Close"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <p
                    className="text-sm leading-relaxed line-clamp-4 mb-4 flex-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {note.content}
                  </p>

                  {/* Images */}
                  {note.images && note.images.length > 0 && (
                    <div
                      className={`grid gap-1.5 mb-4 ${
                        note.images.length === 1
                          ? "grid-cols-1"
                          : note.images.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-3"
                      }`}
                    >
                      {note.images.slice(0, 3).map((image, idx) => (
                        <Suspense key={idx} fallback={null}>
                          <div
                            className="rounded-lg overflow-hidden"
                            style={{
                              border: "1px solid var(--color-border-subtle)",
                              aspectRatio:
                                note.images.length === 1 ? "16/9" : "1/1",
                            }}
                          >
                            <LazyImage
                              idx={idx}
                              imageUrl={image.url}
                              maxHeight={
                                note.images.length === 1 ? "12rem" : "5rem"
                              }
                            />
                          </div>
                        </Suspense>
                      ))}
                    </div>
                  )}

                  {/* Metadata footer */}
                  <div
                    className="flex items-center gap-3 pt-3"
                    style={{ borderTop: "1px solid var(--color-border-subtle)" }}
                  >
                    <span
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <FiClock size={11} />
                      {formatDate(note.createdAt)}
                    </span>
                    {note.images && note.images.length > 0 && (
                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <FiImage size={11} />
                        {note.images.length}
                      </span>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Notes;
