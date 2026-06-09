import axios from "axios";
import { SERVER_URL, UPLOADS_URL } from "../config";

// ─── Axios Instance ────────────────────────────────────────────────────────────
// All API calls go through this single instance so the base URL and default
// headers are set in one place.  Change VITE_API_URL in client/.env to point
// at a different environment (staging, production, etc.).
const api = axios.create({
  baseURL: SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("taskit_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — unwrap errors ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,          // success → return the data payload
  (error) => {
    const message =
      error.response?.data?.message ||  // server error message
      error.message ||                  // axios / network error
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
};

// ─── Tasks API ────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: ({
    search = "",
    status = "all",
    page = 1,
    limit = 6,
    category = "all",
    priority = "all",
  }) => {
    const params = { search, status, page, limit, category, priority };
    return api.get("/tasks", { params });
  },

  create: (payload, files = []) => {
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description || "");
      if (payload.category !== undefined)
        formData.append("category", payload.category);
      if (payload.priority !== undefined)
        formData.append("priority", payload.priority);
      if (payload.dueDate !== undefined)
        formData.append("dueDate", payload.dueDate || "");
      files.forEach((file) => formData.append("attachments", file));
      return api.post("/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post("/tasks", payload);
  },

  update: (id, payload, files = []) => {
    if (files.length > 0) {
      const formData = new FormData();
      if (payload.title !== undefined) formData.append("title", payload.title);
      if (payload.description !== undefined)
        formData.append("description", payload.description);
      if (payload.status !== undefined)
        formData.append("status", payload.status);
      if (payload.category !== undefined)
        formData.append("category", payload.category);
      if (payload.priority !== undefined)
        formData.append("priority", payload.priority);
      if (payload.dueDate !== undefined)
        formData.append("dueDate", payload.dueDate || "");
      files.forEach((file) => formData.append("attachments", file));
      return api.put(`/tasks/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.put(`/tasks/${id}`, payload);
  },

  remove: (id) => api.delete(`/tasks/${id}`),
};

// ─── Comments API ─────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (taskId) => api.get(`/tasks/${taskId}/comments`),

  add: (taskId, text, files = []) => {
    if (files.length > 0) {
      const formData = new FormData();
      formData.append("text", text || "");
      files.forEach((file) => formData.append("attachments", file));
      return api.post(`/tasks/${taskId}/comments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post(`/tasks/${taskId}/comments`, { text });
  },
};

// ─── Upload URL Helper ─────────────────────────────────────────────────────────
export const getUploadUrl = (fileName) => `${UPLOADS_URL}/${fileName}`;

export default api;
