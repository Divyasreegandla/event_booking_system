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
  if (!response.data) {
    return { data: [] };
  }
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
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

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

// ============ PAYMENT APIs ============
export const initiatePayment = (bookingId, paymentMethod) => 
  api.post('/payments/initiate', { booking_id: bookingId, payment_method: paymentMethod });

export const simulatePayment = (paymentId, success = true) => 
  api.post(`/payments/simulate/${paymentId}?success=${success}`);

export const getPaymentStatus = (bookingId) => 
  api.get(`/payments/status/${bookingId}`);

// ============ COUPON APIs ============
export const validateCoupon = (couponCode, bookingAmount) => 
  api.post('/coupons/validate', { coupon_code: couponCode, booking_amount: bookingAmount });

export const createCoupon = (couponData) => api.post('/coupons/', couponData);
export const getAllCoupons = () => api.get('/coupons/');
export const toggleCouponStatus = (couponId) => api.patch(`/coupons/${couponId}/toggle`);

// ============ REVIEW APIs ============
export const createReview = (eventId, rating, reviewText) => 
  api.post(`/reviews/${eventId}`, { rating, review_text: reviewText });

export const updateReview = (reviewId, rating, reviewText) => 
  api.put(`/reviews/${reviewId}`, { rating, review_text: reviewText });

export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);

export const getEventReviews = (eventId, skip = 0, limit = 50) => 
  api.get(`/reviews/event/${eventId}?skip=${skip}&limit=${limit}`);

export const getEventRatingStats = (eventId) => 
  api.get(`/reviews/event/${eventId}/stats`);

export const getMyReviews = () => api.get('/reviews/my-reviews');

// ============ ENHANCED SEARCH APIs ============
export const advancedSearch = (params) => api.get('/search/advanced', { params });
export const getCities = () => api.get('/search/cities');
export const getAllCategories = () => api.get('/search/categories');

// ============ PHASE 4: WISHLIST APIs ============
export const getWishlist = () => api.get('/wishlist/');
export const addToWishlist = (data) => api.post('/wishlist/', data);
export const removeFromWishlist = (eventId) => api.delete(`/wishlist/${eventId}`);
export const checkInWishlist = (eventId) => api.get(`/wishlist/check/${eventId}`);

// ============ PHASE 4: RECOMMENDATION APIs ============
export const getPersonalizedRecommendations = (limit = 6) => api.get(`/recommendations/personalized?limit=${limit}`);
export const getTrendingEvents = (limit = 6) => api.get(`/recommendations/trending?limit=${limit}`);
export const getSimilarEvents = (eventId, limit = 4) => api.get(`/recommendations/similar/${eventId}?limit=${limit}`);
export const trackEventView = (eventId) => api.post(`/recommendations/track/${eventId}`);

// ============ PHASE 4: EVENT UPDATES APIs ============
export const getEventUpdates = (eventId) => api.get(`/event-updates/event/${eventId}`);
export const createEventUpdate = (eventId, data) => api.post(`/event-updates/event/${eventId}`, data);
export const deleteEventUpdate = (updateId) => api.delete(`/event-updates/${updateId}`);

// ============ PHASE 4: USER PROFILE APIs ============
export const getProfile = () => api.get('/user/me');
export const updateProfile = (data) => api.put('/user/profile', data);
export const uploadProfilePicture = (formData) => api.post('/user/profile-picture', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProfilePicture = () => api.delete('/user/profile-picture');
export const getBookingSummary = () => api.get('/user/booking-summary');

// ============ PHASE 4: CHATBOT APIs ============
export const sendChatMessage = (data) => api.post('/chatbot/chat', data);
export const sendGuestChatMessage = (data) => api.post('/chatbot/guest-chat', data);

// ============ PHASE 5: REWARD POINTS APIs ============
export const getMyPoints = () => api.get('/rewards/my-points');
export const getPointsSummary = () => api.get('/rewards/my-points/summary');
export const getPointTransactions = () => api.get('/rewards/transactions');

// ============ PHASE 5: REFERRAL APIs ============
export const getReferralCode = () => api.get('/referrals/my-code');
export const generateReferralCode = () => api.post('/referrals/generate');
export const useReferralCode = (code) => api.post(`/referrals/use?code=${code}`);
export const getMyReferrals = () => api.get('/referrals/my-referrals');
export const getReferralStats = () => api.get('/referrals/stats');

// ============ PHASE 5: TRANSLATION APIs ============
export const getSupportedLanguages = () => api.get('/translations/supported-languages');
export const getTranslations = (langCode) => api.get(`/translations/translations/${langCode}`);
export const setUserLanguage = (language) => api.post('/translations/set-language', { language });

export const usePointsForBooking = (bookingId, pointsToUse) => 
  api.post('/rewards/use-points', { booking_id: bookingId, points: pointsToUse });

export const getPointsValue = () => 
  api.get('/rewards/points-value');
export default api;