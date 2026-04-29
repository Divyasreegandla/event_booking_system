import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav style={{ 
      background: 'white', 
      padding: '0 20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '64px'
      }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>
          🎫 SmartEvent
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#4b5563' }}>Home</Link>
          <Link to="/contact" style={{ textDecoration: 'none', color: '#4b5563' }}>Support</Link>
          
          {user ? (
            <>
              <Link to="/bookings" style={{ textDecoration: 'none', color: '#4b5563' }}>My Bookings</Link>
              <Link to="/tickets" style={{ textDecoration: 'none', color: '#4b5563' }}>My Tickets</Link>
              
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', position: 'relative' }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '-8px', 
                      right: '-8px', 
                      background: '#ef4444', 
                      color: 'white', 
                      fontSize: '10px', 
                      padding: '2px 6px', 
                      borderRadius: '10px' 
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
              </div>

              {/* User Info and Logout Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#4b5563' }}>👤 {user.username}</span>
                <button
                  onClick={handleLogout}
                  style={{ 
                    padding: '6px 16px', 
                    background: '#dc2626', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer' 
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: '#4b5563' }}>Login</Link>
              <Link to="/register" style={{ padding: '8px 20px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;