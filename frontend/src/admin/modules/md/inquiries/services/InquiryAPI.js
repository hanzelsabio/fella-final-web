import api from "../../../../../services";

const BASE = "/inquiries";

export const inquiryAPI = {
  getAll: () => api.get(BASE),
  getById: (inquiry_number) => api.get(`${BASE}/${inquiry_number}`),
  delete: (id) => api.delete(`${BASE}/${id}`),
  archive: (id) => api.patch(`${BASE}/${id}/archive`),
  restore: (id) => api.patch(`${BASE}/${id}/restore`),
  markAsResponded: (id) => api.patch(`${BASE}/${id}/responded`),
  markAsCancelled: (id) => api.patch(`${BASE}/${id}/cancelled`),
  markAsPending: (id) => api.patch(`${BASE}/${id}/pending`),
  changePriority: (id, priority) =>
    api.patch(`${BASE}/${id}/priority`, { priority }),
};
