import axios from 'axios'

// Properties
export const propertyAPI = {
  getAll:         (params) => axios.get('/properties', { params }),
  getOne:         (id) => axios.get(`/properties/${id}`),
  create:         (data) => axios.post('/properties', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:         (id, data) => axios.put(`/properties/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:         (id) => axios.delete(`/properties/${id}`),
  deleteImage:    (id, imageUrl) => axios.delete(`/properties/${id}/images`, { data: { imageUrl } }),
  toggleSave:     (id) => axios.post(`/properties/${id}/save`),
  myListings:     () => axios.get('/properties/my-listings'),
  analytics:      () => axios.get('/properties/analytics'),
}

// Bookings
export const bookingAPI = {
  create:         (data) => axios.post('/bookings', data),
  myBookings:     () => axios.get('/bookings/my-bookings'),
  agentRequests:  () => axios.get('/bookings/agent-requests'),
  updateStatus:   (id, data) => axios.put(`/bookings/${id}/status`, data),
  cancel:         (id) => axios.put(`/bookings/${id}/cancel`),
  getAll:         (params) => axios.get('/bookings', { params }),
}

// Users
export const userAPI = {
  getAll:           (params) => axios.get('/users', { params }),
  getOne:           (id) => axios.get(`/users/${id}`),
  create:           (data) => axios.post('/users', data),
  update:           (id, data) => axios.put(`/users/${id}`, data),
  toggleStatus:     (id) => axios.put(`/users/${id}/toggle-status`),
  delete:           (id) => axios.delete(`/users/${id}`),
  platformAnalytics:() => axios.get('/users/analytics/platform'),
  getNotifications: () => axios.get('/users/notifications'),
  markRead:         (id) => axios.put(`/users/notifications/${id}/read`),
}

// Auth
export const authAPI = {
  login:          (data) => axios.post('/auth/login', data),
  register:       (data) => axios.post('/auth/register', data),
  me:             () => axios.get('/auth/me'),
  updateProfile:  (data) => axios.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => axios.put('/auth/change-password', data),
}
