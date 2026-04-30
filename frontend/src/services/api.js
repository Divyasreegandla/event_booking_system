// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH APIs ============
export const register = (userData) => api.post('/auth/register', userData);
export const login = (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const getCurrentUser = () => api.get('/auth/me');

// ============ EVENT APIs ============
export const getEvents = (params) => api.get('/events/', { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const getCategories = () => api.get('/events/categories/list');
export const createEvent = (eventData) => api.post('/events/', eventData);
export const updateEvent = (id, eventData) => api.put(`/events/${id}`, eventData);
export const cancelEvent = (id) => api.delete(`/events/${id}`);
export const getMyEvents = () => api.get('/events/organizer/my-events');
export const getEventBookings = (eventId) => api.get(`/events/organizer/${eventId}/bookings`);

// ============ BOOKING APIs ============
export const createBooking = (data) => api.post('/bookings/', data);
export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  // Ensure we always return an array
  if (!response.data) {
    return { data: [] };
  }
  // If response is array directly, wrap it
  if (Array.isArray(response.data)) {
    return { data: response.data };
  }
  return response;
};
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);
export const sendReminder = (bookingId) => api.post(`/notifications/${bookingId}/reminder`);

// ============ TICKET APIs ============
export const getMyTickets = async () => {
  const response = await api.get('/bookings/my-tickets');
  // Ensure tickets is always an array
  if (!response.data || !response.data.tickets) {
    return { data: { tickets: [] } };
  }
  return response;
};
export const getTicketDetails = (ticketCode) => api.get(`/bookings/ticket/${ticketCode}`);
export const verifyTicket = (ticketCode) => api.post(`/bookings/verify-ticket/${ticketCode}`);

// ============ NOTIFICATION APIs ============
export const getNotifications = () => api.get('/notifications/my-notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.post(`/notifications/${id}/read`);
export const markAllRead = () => api.post('/notifications/mark-all-read');

// ============ ADMIN APIs ============
export const getPlatformStats = () => api.get('/analytics/admin/platform-stats');
export const getDailySales = (days = 30) => api.get(`/analytics/admin/daily-sales?days=${days}`);
export const getMonthlyTrends = (months = 12) => api.get(`/analytics/admin/monthly-trends?months=${months}`);
export const getPopularEvents = (limit = 10) => api.get(`/analytics/admin/popular-events?limit=${limit}`);
export const getAllUsers = () => api.get('/admin/users');
export const updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role?role=${role}`);
export const getAllEventsAdmin = () => api.get('/admin/events/all');
export const getAllBookingsAdmin = () => api.get('/admin/bookings/all');

// ============ ORGANIZER ANALYTICS APIs ============
export const getOrganizerEventStats = () => api.get('/analytics/organizer/event-stats');
export const getOrganizerDashboardStats = () => api.get('/analytics/organizer/dashboard-stats');

export default api;