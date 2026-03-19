import axios from "axios";

export const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Image URL helper ──────────────────────────────────────────────────────────
// Always call this before rendering any image src from the backend.
// - Already absolute URLs (http/https) are returned as-is
// - Relative /uploads/... paths get the backend base URL prepended
// - base64 data: URIs are returned as-is (draft previews)
// - null/undefined returns empty string (no broken img tags)
export const getImageUrl = (url) => {
  if (!url) return "";

  // 🛡 If an object is passed like { url: "..." }
  if (typeof url === "object" && url.url) {
    url = url.url;
  }

  if (typeof url !== "string") return "";

  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;

  return url;
};

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

// Products
export const productAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  archive: (id) => api.patch(`/products/${id}/archive`),
  restore: (id) => api.patch(`/products/${id}/restore`),
};

// Drafts
export const draftAPI = {
  getAll: () => api.get("/drafts"),
  getById: (id) => api.get(`/drafts/${id}`),
  save: (data) => api.post("/drafts", data),
  update: (id, data) => api.put(`/drafts/${id}`, data),
  delete: (id) => api.delete(`/drafts/${id}`),
  publish: (id) => api.post(`/drafts/${id}/publish`),
};

// Services
export const serviceAPI = {
  getAll: () => api.get("/services"),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  archive: (id) => api.patch(`/services/${id}/archive`),
  restore: (id) => api.patch(`/services/${id}/restore`),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  archive: (id) => api.patch(`/categories/${id}/archive`),
  restore: (id) => api.patch(`/categories/${id}/restore`),
};

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
