import axios from "axios";

export const API_BASE_URL = "http://localhost:5000"; // ← exported so components can use it

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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

// Inquiries
export const inquiryAPI = {
  getAll: () => api.get("/inquiries"),
  getById: (inquiry_number) => api.get(`/inquiries/${inquiry_number}`),
  delete: (id) => api.delete(`/inquiries/${id}`),
  archive: (id) => api.patch(`/inquiries/${id}/archive`),
  restore: (id) => api.patch(`/inquiries/${id}/restore`),
  markAsResponded: (id) => api.patch(`/inquiries/${id}/responded`),
  markAsCancelled: (id) => api.patch(`/inquiries/${id}/cancelled`),
  markAsPending: (id) => api.patch(`/inquiries/${id}/pending`),
  changePriority: (id, priority) =>
    api.patch(`/inquiries/${id}/priority`, { priority }),
};

export default api;
