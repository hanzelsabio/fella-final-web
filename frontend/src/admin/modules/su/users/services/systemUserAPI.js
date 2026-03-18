import axios from "axios";

// export const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: "/api",
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

// System Users
export const systemUserAPI = {
  getAll: () => api.get("/system-users"),
  getById: (id) => api.get(`/system-users/${id}`),
  getByUserId: (userId) => api.get(`/system-users/uid/${userId}`),
  create: (data) => api.post("/system-users", data),
  update: (id, data) => api.put(`/system-users/${id}`, data),
  delete: (id) => api.delete(`/system-users/${id}`),
  archive: (id) => api.patch(`/system-users/${id}/archive`),
  restore: (id) => api.patch(`/system-users/${id}/restore`),
};

export default api;
