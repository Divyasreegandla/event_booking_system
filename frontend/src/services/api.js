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
    console.log('Token being sent:', token ? 'Yes' : 'No');
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
      localStorage.removeItem('user');
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
export const getCategories = () => api.get('/events/categories');

// ============ BOOKING APIs ============
export const createBooking = (data) => api.post('/bookings/', data);
export const getMyBookings = () => {
  console.log('Fetching my bookings...');
  return api.get('/bookings/my-bookings');
};
export const cancelBooking = (id) => {
  console.log('Cancelling booking:', id);
  return api.delete(`/bookings/${id}`);
};
export const sendReminder = (bookingId) => api.post(`/notifications/${bookingId}/reminder`);

// ============ TICKET APIs ============
export const getMyTickets = () => api.get('/bookings/my-tickets');
export const getTicketDetails = (ticketCode) => api.get(`/bookings/ticket/${ticketCode}`);
export const verifyTicket = (ticketCode) => api.post(`/bookings/verify-ticket/${ticketCode}`);

// ============ NOTIFICATION APIs ============
export const getNotifications = () => api.get('/notifications/my-notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.post(`/notifications/${id}/read`);
export const markAllRead = () => api.post('/notifications/mark-all-read');

export default api;