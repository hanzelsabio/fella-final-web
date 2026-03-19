import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

// Colors
export const colorAPI = {
  getAll: () => api.get("/colors"),
  getById: (id) => api.get(`/colors/${id}`),
  create: (data) => api.post("/colors", data),
  update: (id, data) => api.put(`/colors/${id}`, data),
  delete: (id) => api.delete(`/colors/${id}`),
  archive: (id) => api.put(`/colors/${id}/archive`),
  restore: (id) => api.put(`/colors/${id}/restore`),
};

export default api;
