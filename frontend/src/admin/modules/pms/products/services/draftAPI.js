import api from "../../../../../services";

const BASE = "/drafts";

export const draftAPI = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  save: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
  publish: (id) => api.post(`${BASE}/${id}/publish`),
};
