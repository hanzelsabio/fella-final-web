import api from "../../../../../services";

const BASE = "/system-users";

export const systemUserAPI = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  getByUserId: (userId) => api.get(`${BASE}/uid/${userId}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
  archive: (id) => api.patch(`${BASE}/${id}/archive`),
  restore: (id) => api.patch(`${BASE}/${id}/restore`),
};
