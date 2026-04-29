import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Booking from './pages/Booking';
import BookingHistory from './pages/BookingHistory';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import QRScanner from './components/QRScanner';
import Footer from './components/Footer';
import Contact from './pages/Contact';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/booking/:eventId" element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/admin/scan" element={
              <ProtectedRoute>
                <QRScanner />
              </ProtectedRoute>
            } />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
        <Toaster 
  position="top-right"
  toastOptions={{
    duration: 5000, // 5 seconds (default is 2000ms / 2 seconds)
    style: {
      background: '#363636',
      color: '#fff',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
    },
    success: {
      duration: 5000,
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
    error: {
      duration: 6000,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>
      </Router>
    </AuthProvider>
  );
}

export default App;