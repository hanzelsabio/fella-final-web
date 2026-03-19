import api from "../../../../../services";

const BASE = "/invoices";

export const invoiceAPI = {
  getAll: () => api.get(BASE),
  getById: (invoice_number) => api.get(`${BASE}/${invoice_number}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
  archive: (id) => api.patch(`${BASE}/${id}/archive`),
  restore: (id) => api.patch(`${BASE}/${id}/restore`),
  markAsPaid: (id) => api.patch(`${BASE}/${id}/paid`),
  markAsUnpaid: (id) => api.patch(`${BASE}/${id}/unpaid`),
};
