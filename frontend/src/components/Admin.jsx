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
    <div className="max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
            tab === "users"
              ? "bg-blue-600"
              : "bg-neutral-800 hover:bg-neutral-700"
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab("notes")}
          className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
            tab === "notes"
              ? "bg-blue-600"
              : "bg-neutral-800 hover:bg-neutral-700"
          }`}
        >
          Notes ({notes.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-400 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : tab === "users" ? (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left">
            <thead className="bg-neutral-900 text-gray-400 text-sm">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-neutral-800">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        u.role === "admin"
                          ? "bg-purple-900 text-purple-300"
                          : "bg-neutral-800 text-gray-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left">
            <thead className="bg-neutral-900 text-gray-400 text-sm">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n._id} className="border-t border-neutral-800">
                  <td className="px-4 py-3">{n.title}</td>
                  <td className="px-4 py-3">
                    {n.user?.email || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))}
              {notes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
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
