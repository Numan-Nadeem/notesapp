import { useEffect, useState } from "react";
import { getAdminUsers, getAdminNotes } from "../services/api.js";

const Admin = () => {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [usersData, notesData] = await Promise.all([
          getAdminUsers(),
          getAdminNotes(),
        ]);
        if (!active) return;
        setUsers(Array.isArray(usersData) ? usersData : []);
        setNotes(Array.isArray(notesData) ? notesData : []);
      } catch (err) {
        if (!active) return;
        setError(
          err.response?.data?.error || "Failed to load admin data"
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("users")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{
            background: tab === "users" ? "var(--color-accent)" : "var(--color-surface-raised)",
            color: tab === "users" ? "#060010" : "var(--color-text-secondary)",
            border: tab === "users" ? "none" : "1px solid var(--color-border-subtle)",
          }}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab("notes")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          style={{
            background: tab === "notes" ? "var(--color-accent)" : "var(--color-surface-raised)",
            color: tab === "notes" ? "#060010" : "var(--color-text-secondary)",
            border: tab === "notes" ? "none" : "1px solid var(--color-border-subtle)",
          }}
        >
          Notes ({notes.length})
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
      ) : tab === "users" ? (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--color-border-subtle)" }}>
          <table className="w-full text-left">
            <thead style={{ background: "var(--color-surface-raised)" }}>
              <tr>
                <th className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Name</th>
                <th className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Email</th>
                <th className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: u.role === "admin" ? "rgba(168, 130, 255, 0.15)" : "var(--color-surface-overlay)",
                        color: u.role === "admin" ? "#a882ff" : "var(--color-text-secondary)",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--color-border-subtle)" }}>
          <table className="w-full text-left">
            <thead style={{ background: "var(--color-surface-raised)" }}>
              <tr>
                <th className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Title</th>
                <th className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Author</th>
                <th className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n._id} style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
                  <td className="px-4 py-3">{n.title}</td>
                  <td className="px-4 py-3">
                    {n.user?.email || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))}
              {notes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                    No notes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
