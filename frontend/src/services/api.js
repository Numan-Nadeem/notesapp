import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.post("/auth/refresh");
        return api.request(error.config);
      } catch (refreshError) {
        console.warn("Session expired, redirecting to login...", refreshError);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const checkhealth = async () => api.get("/");

export const login = async (formData) => {
  const response = await api.post("/auth/login", formData);
  return response;
};

export const signup = async (formData) => {
  const response = await api.post("/auth/signup", formData);
  return response;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const getNotes = async () => {
  try {
    const response = await api.get("/notes");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const createNote = async (noteData) => {
  try {
    const response = await api.post("/notes", noteData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateNote = async (id, noteData) =>
  api.put(`/notes/${id}`, noteData);

export const deleteNote = async (id) => {
  try {
    const response = api.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getNote = async (id) => api.get(`/notes/${id}`);

export default api;
