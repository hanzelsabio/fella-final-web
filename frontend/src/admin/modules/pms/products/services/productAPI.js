import api from "../../../../../services";

const BASE = "/products";

export const productAPI = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
  archive: (id) => api.patch(`${BASE}/${id}/archive`),
  restore: (id) => api.patch(`${BASE}/${id}/restore`),
};
