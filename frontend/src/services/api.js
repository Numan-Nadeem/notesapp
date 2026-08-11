import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Flag to prevent infinite refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api.request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api.request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem("userData");
        window.dispatchEvent(new CustomEvent("auth-expired"));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const checkhealth = async () => api.get("/");

export const login = async (formData) => {
  const response = await api.post("/auth/login", formData);
  return response;
};

export const googleLogin = async (data) => {
  const response = await api.post("/auth/google", data);
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
  const response = await api.get("/notes");
  return response.data;
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

export const updateNote = async (id, noteData) => {
  try {
    const response = await api.put(`/notes/${id}`, noteData);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

export const getNote = async (id) => api.get(`/notes/${id}`);

export const getAdminUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getAdminNotes = async () => {
  const response = await api.get("/admin/notes");
  return response.data;
};

export default api;
