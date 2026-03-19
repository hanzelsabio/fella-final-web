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

export const invoiceAPI = {
  getAll: () => api.get("/invoices"),
  getById: (invoice_number) => api.get(`/invoices/${invoice_number}`),
  create: (data) => api.post("/invoices", data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  archive: (id) => api.patch(`/invoices/${id}/archive`),
  restore: (id) => api.patch(`/invoices/${id}/restore`),
  markAsPaid: (id) => api.patch(`/invoices/${id}/paid`),
  markAsUnpaid: (id) => api.patch(`/invoices/${id}/unpaid`),
};

export default api;
