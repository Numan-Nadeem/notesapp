import React, { Suspense, useEffect } from "react";
import { FiClock, FiEdit2, FiImage, FiTrash, FiX } from "react-icons/fi";
import LazyImage from "./LazyImage.jsx";
import formatDate from "../utils/formatDate.js";

// Full-note reader opened by clicking a card in the notes grid. The parent
// owns the note/closing state so the same bounce-in/out animation pattern as
// the edit modal applies here.
const NoteViewModal = ({ note, isClosing, onClose, onEdit, onDelete }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!note) return null;

  const wasEdited =
    note.updatedAt &&
    note.createdAt &&
    new Date(note.updatedAt).getTime() !==
      new Date(note.createdAt).getTime();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={note.title}
        className={`relative rounded-2xl overflow-hidden text-white max-w-2xl w-full flex flex-col max-h-[85vh] transform transition-all duration-200 ease-out ${
          isClosing
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100 animate-bounce-in"
        }`}
        style={{
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 transition-colors p-2 rounded-lg cursor-pointer"
          style={{
            color: "var(--color-text-muted)",
            background: "var(--color-surface-raised)",
          }}
          aria-label="Close note"
        >
          <FiX size={20} />
        </button>

        <div className="overflow-y-auto p-8">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-2"
            style={{ color: "var(--color-accent)" }}
          >
            Note
          </p>
          <h2
            className="text-2xl font-bold mb-3 pr-10 break-words"
            style={{ color: "var(--color-text-primary)" }}
          >
            {note.title}
          </h2>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              <FiClock size={11} />
              {formatDate(note.createdAt)}
            </span>
            {wasEdited && (
              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--color-text-muted)" }}
                title={new Date(note.updatedAt).toLocaleString()}
              >
                (edited {formatDate(note.updatedAt)})
              </span>
            )}
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

          <p
            className="text-sm leading-relaxed whitespace-pre-wrap mb-6 break-words"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {note.content}
          </p>

          {note.images && note.images.length > 0 && (
            <div
              className={`grid gap-2 ${
                note.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {note.images.map((image, idx) => (
                <Suspense key={idx} fallback={null}>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg overflow-hidden block"
                    style={{
                      border: "1px solid var(--color-border-subtle)",
                      aspectRatio: note.images.length === 1 ? "16/9" : "4/3",
                    }}
                    title="Open image in new tab"
                  >
                    <LazyImage idx={idx} imageUrl={image.url} maxHeight="24rem" />
                  </a>
                </Suspense>
              ))}
            </div>
          )}
        </div>

        <div
          className="flex gap-3 justify-end p-6 shrink-0 max-sm:flex-col"
          style={{ borderTop: "1px solid var(--color-border-subtle)" }}
        >
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors duration-200 font-semibold cursor-pointer max-sm:order-2"
            style={{
              background: "var(--color-surface-overlay)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            <FiEdit2 size={14} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors duration-200 font-semibold cursor-pointer max-sm:order-1"
            style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}
          >
            <FiTrash size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteViewModal;
