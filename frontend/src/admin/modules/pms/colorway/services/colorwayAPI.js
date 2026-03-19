import api from "../../../../../services";

const BASE = "/colors";

// Note: archive/restore use PUT (not PATCH) — intentional, matches backend
export const colorAPI = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
  archive: (id) => api.put(`${BASE}/${id}/archive`),
  restore: (id) => api.put(`${BASE}/${id}/restore`),
};
