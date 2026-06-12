/**
 * API service layer — Axios instance + all API functions.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Products ─────────────────────────────────────────────── */
export const productAPI = {
  getAll:  ()           => api.get('/api/products'),
  getById: (id)         => api.get(`/api/products/${id}`),
  create:  (data)       => api.post('/api/products/', data),
  update:  (id, data)   => api.put(`/api/products/${id}`, data),
  delete:  (id)         => api.delete(`/api/products/${id}`),
};

/* ── Customers ────────────────────────────────────────────── */
export const customerAPI = {
  getAll:  ()     => api.get('/api/customers'),
  getById: (id)   => api.get(`/api/customers/${id}`),
  create:  (data) => api.post('/api/customers/', data),
  delete:  (id)   => api.delete(`/api/customers/${id}`),
};

/* ── Orders ───────────────────────────────────────────────── */
export const orderAPI = {
  getAll:  ()     => api.get('/api/orders'),
  getById: (id)   => api.get(`/api/orders/${id}`),
  create:  (data) => api.post('/api/orders/', data),
  delete:  (id)   => api.delete(`/api/orders/${id}`),
};

/* ── Dashboard ────────────────────────────────────────────── */
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
};

export default api;
