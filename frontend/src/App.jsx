// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import QuickLogout from './components/QuickLogout';
import LanguageSwitcher from './components/LanguageSwitcher';
import DarkModeToggle from './components/DarkModeToggle';
import Chatbot from './components/Chatbot';

// User Pages
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Booking from './pages/Booking';
import BookingHistory from './pages/BookingHistory';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import QRScanner from './components/QRScanner';
import Footer from './components/Footer';

// Organizer Pages
import OrganizerEvents from './pages/organizer/OrganizerEvents';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import EventBookings from './pages/organizer/EventBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBookings from './pages/admin/AdminBookings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCoupons from './pages/admin/AdminCoupons';

import PaymentCheckout from './pages/PaymentCheckout';
import PaymentConfirmation from './pages/PaymentConfirmation';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Referral from './pages/Referral';

// Sidebar Component - Same styling for both logged in and logged out users
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, userRole, logout, isAdmin, isOrganizer } = useAuth();
  const { t, language } = useLanguage(); // Added language to trigger re-render
  const [profilePicError, setProfilePicError] = useState(false);
  const location = useLocation();
  const [, forceUpdate] = useState({});

  // Force re-render when language changes
  useEffect(() => {
    forceUpdate({});
  }, [language]);

  const getProfilePicture = () => {
    if (user?.profile_picture) return user.profile_picture;
    if (localStorage.getItem('userProfilePic')) return localStorage.getItem('userProfilePic');
    return null;
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const profilePic = getProfilePicture();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>🎫</span>
            <span>SmartEvent</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>✕</button>
        </div>

        {/* User Profile Section - Only when logged in */}
        {user && (
          <div className="sidebar-user">
            {profilePic && !profilePicError ? (
              <img 
                src={profilePic} 
                alt={user.username} 
                className="sidebar-avatar-img" 
                onError={() => setProfilePicError(true)} 
              />
            ) : (
              <div className="sidebar-avatar">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="sidebar-user-name">{user.username}</div>
            <div className="sidebar-user-role">{userRole}</div>
          </div>
        )}

        <div className="sidebar-nav">
          {/* Main Menu Section - Same for all users */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">{t('mainMenu') || 'MAIN MENU'}</div>
            <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`} onClick={toggleSidebar}>
              <span>🏠</span> {t('home')}
            </Link>
            
            {/* Only show these when logged in */}
            {user && (
              <>
                <Link to="/bookings" className={`sidebar-link ${isActive('/bookings') ? 'active' : ''}`} onClick={toggleSidebar}>
                  <span>📋</span> {t('myBookings')}
                </Link>
                <Link to="/tickets" className={`sidebar-link ${isActive('/tickets') ? 'active' : ''}`} onClick={toggleSidebar}>
                  <span>🎟️</span> {t('myTickets')}
                </Link>
                <Link to="/wishlist" className={`sidebar-link ${isActive('/wishlist') ? 'active' : ''}`} onClick={toggleSidebar}>
                  <span>❤️</span> {t('wishlist')}
                </Link>
                <Link to="/referral" className={`sidebar-link ${isActive('/referral') ? 'active' : ''}`} onClick={toggleSidebar}>
                  <span>🎁</span> {t('referralProgram')}
                </Link>
              </>
            )}
            
            {/* Support - Show for all users */}
            <Link to="/contact" className={`sidebar-link ${isActive('/contact') ? 'active' : ''}`} onClick={toggleSidebar}>
              <span>📞</span> {t('support') || 'Support'}
            </Link>
          </div>

          {/* Organizer Section - Only for organizers and admins when logged in */}
          {user && (isOrganizer() || isAdmin()) && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('organizer') || 'ORGANIZER'}</div>
              <Link to="/organizer/events" className={`sidebar-link ${isActive('/organizer/events') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>📋</span> {t('myEvents')}
              </Link>
              <Link to="/organizer/create-event" className={`sidebar-link ${isActive('/organizer/create-event') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>➕</span> {t('createEvent')}
              </Link>
              <Link to="/organizer/dashboard" className={`sidebar-link ${isActive('/organizer/dashboard') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>📊</span> {t('analytics')}
              </Link>
            </div>
          )}

          {/* Admin Section - Only for admins when logged in */}
          {user && isAdmin() && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('admin') || 'ADMIN'}</div>
              <Link to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>📊</span> Dashboard
              </Link>
              <Link to="/admin/users" className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>👥</span> Users
              </Link>
              <Link to="/admin/events" className={`sidebar-link ${isActive('/admin/events') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>📅</span> All Events
              </Link>
              <Link to="/admin/bookings" className={`sidebar-link ${isActive('/admin/bookings') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>🎫</span> All Bookings
              </Link>
              <Link to="/admin/analytics" className={`sidebar-link ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>📈</span> Analytics
              </Link>
              <Link to="/admin/coupons" className={`sidebar-link ${isActive('/admin/coupons') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>🎟️</span> Coupons
              </Link>
              <Link to="/admin/scan" className={`sidebar-link ${isActive('/admin/scan') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>🔍</span> Verify Ticket
              </Link>
            </div>
          )}

          {/* Profile Section - Only when logged in */}
          {user && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('profile') || 'PROFILE'}</div>
              <Link to="/profile" className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>👤</span> {t('profile')}
              </Link>
              <Link to="/notifications" className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>🔔</span> {t('notifications')}
              </Link>
            </div>
          )}

          {/* Settings Section - Same for all users */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">{t('settings') || 'SETTINGS'}</div>
            <div className="sidebar-controls">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
          </div>

          {/* Auth Section - Only when NOT logged in */}
          {!user && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('account') || 'ACCOUNT'}</div>
              <Link to="/login" className={`sidebar-link ${isActive('/login') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>🔐</span> {t('login')}
              </Link>
              <Link to="/register" className={`sidebar-link ${isActive('/register') ? 'active' : ''}`} onClick={toggleSidebar}>
                <span>✨</span> {t('register')}
              </Link>
            </div>
          )}

          {/* Logout Button - Only when logged in */}
          {user && (
            <button onClick={handleLogout} className="sidebar-logout">
              <span>🚪</span> {t('logout')}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// Mobile Menu Button
const MenuButton = ({ onClick }) => {
  const { user } = useAuth();
  if (!user) return null;
  
  return (
    <button className="menu-toggle-btn" onClick={onClick}>
      ☰
    </button>
  );
};

// Layout wrapper with sidebar for all pages
const PageLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      {/* Sidebar - Visible for ALL users */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Menu button for mobile */}
      <MenuButton onClick={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className={`main-content ${isAuthPage ? 'auth-page-full' : ''}`}>
        <main className="content-area">
          <div className={`content-container ${isAuthPage ? 'auth-container-full' : ''}`}>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

// Main App Content
const AppContent = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PageLayout>
          <Home />
        </PageLayout>
      } />
      <Route path="/events/:id" element={
        <PageLayout>
          <EventDetails />
        </PageLayout>
      } />
      <Route path="/login" element={
        <PageLayout>
          <Login />
        </PageLayout>
      } />
      <Route path="/register" element={
        <PageLayout>
          <Register />
        </PageLayout>
      } />
      <Route path="/contact" element={
        <PageLayout>
          <Contact />
        </PageLayout>
      } />

      {/* User Routes */}
      <Route path="/booking/:eventId" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <Booking />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <BookingHistory />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/tickets" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <Tickets />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <Notifications />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <Wishlist />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <Profile />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/referral" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <Referral />
          </PageLayout>
        </ProtectedRoute>
      } />

      {/* Organizer Routes */}
      <Route path="/organizer/events" element={
        <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <OrganizerEvents />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/organizer/create-event" element={
        <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <CreateEvent />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/organizer/edit-event/:id" element={
        <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <EditEvent />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/organizer/dashboard" element={
        <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <OrganizerDashboard />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/organizer/event/:id/bookings" element={
        <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <EventBookings />
          </PageLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <PageLayout>
            <AdminDashboard />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <PageLayout>
            <AdminUsers />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <PageLayout>
            <AdminEvents />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <PageLayout>
            <AdminBookings />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <PageLayout>
            <AdminAnalytics />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/coupons" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <PageLayout>
            <AdminCoupons />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/scan" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
          <PageLayout>
            <QRScanner />
          </PageLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/payment-checkout" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <PaymentCheckout />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/payment-confirmation" element={
        <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
          <PageLayout>
            <PaymentConfirmation />
          </PageLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
            },
          }}
        />
        <QuickLogout />
        <Chatbot />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;