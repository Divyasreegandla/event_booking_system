// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import QuickLogout from './components/QuickLogout';  // Add this import

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />

            {/* User Routes */}
            <Route path="/booking/:eventId" element={
              <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
                <Booking />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
                <BookingHistory />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']}>
                <Notifications />
              </ProtectedRoute>
            } />

            {/* Organizer Routes */}
            <Route path="/organizer/events" element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <OrganizerEvents />
              </ProtectedRoute>
            } />
            <Route path="/organizer/create-event" element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/organizer/edit-event/:id" element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <EditEvent />
              </ProtectedRoute>
            } />
            <Route path="/organizer/dashboard" element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/organizer/event/:id/bookings" element={
              <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                <EventBookings />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEvents />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/scan" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
                <QRScanner />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
        
        {/* Toaster for notifications - placed here */}
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
        
        {/* QuickLogout - floating button for debugging - placed here */}
        <QuickLogout />
        
      </Router>
    </AuthProvider>
  );
}

export default App;