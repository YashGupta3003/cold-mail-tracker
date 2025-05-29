import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const emailsApi = {
  // Get all emails
  getAll: () => api.get('/emails'),
  
  // Get email by ID
  getById: (id) => api.get(`/emails/${id}`),
  
  // Create new email
  create: (emailData) => api.post('/emails', emailData),
  
  // Update email
  update: (id, emailData) => api.put(`/emails/${id}`, emailData),
  
  // Delete email
  delete: (id) => api.delete(`/emails/${id}`),
  
  // Get statistics
  getStats: () => api.get('/emails/stats'),
  
  // Filter emails by status
  getByStatus: (status) => api.get(`/emails/filter/${status}`)
};

export default api;