// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, userRole, logout, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [profilePicError, setProfilePicError] = useState(false);

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
    navigate('/login');
  };

  const getRoleBadgeColor = () => {
    if (isAdmin()) return '#dc2626';
    if (isOrganizer()) return '#f59e0b';
    return '#10b981';
  };

  // Get profile picture from user or localStorage
  const getProfilePicture = () => {
    if (user?.profile_picture) return user.profile_picture;
    if (localStorage.getItem('userProfilePic')) return localStorage.getItem('userProfilePic');
    return null;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">🎫 SmartEvent</Link>

        <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          ☰
        </button>

        <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
          <Link to="/" onClick={() => setShowMobileMenu(false)}>Home</Link>
          <Link to="/contact" onClick={() => setShowMobileMenu(false)}>Support</Link>
          
          {user ? (
            <>
              <Link to="/bookings" onClick={() => setShowMobileMenu(false)}>My Bookings</Link>
              <Link to="/tickets" onClick={() => setShowMobileMenu(false)}>My Tickets</Link>
              <Link to="/wishlist" onClick={() => setShowMobileMenu(false)}>❤️ Wishlist</Link>
              <Link to="/profile" onClick={() => setShowMobileMenu(false)}>👤 Profile</Link>
              
              {/* Organizer Dropdown */}
              {(isOrganizer() || isAdmin()) && (
                <div 
                  className="dropdown"
                  onMouseEnter={() => setOpenDropdown('organizer')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="dropdown-btn">🎪 Organizer ▼</button>
                  <div className={`dropdown-content ${openDropdown === 'organizer' ? 'show' : ''}`}>
                    <Link to="/organizer/events" onClick={() => setShowMobileMenu(false)}>My Events</Link>
                    <Link to="/organizer/create-event" onClick={() => setShowMobileMenu(false)}>Create Event</Link>
                    <Link to="/organizer/dashboard" onClick={() => setShowMobileMenu(false)}>Analytics</Link>
                  </div>
                </div>
              )}
              
              {/* Admin Dropdown */}
              {isAdmin() && (
                <div 
                  className="dropdown"
                  onMouseEnter={() => setOpenDropdown('admin')}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="dropdown-btn">👑 Admin ▼</button>
                  <div className={`dropdown-content ${openDropdown === 'admin' ? 'show' : ''}`}>
                    <Link to="/admin/dashboard" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
                    <Link to="/admin/users" onClick={() => setShowMobileMenu(false)}>Users</Link>
                    <Link to="/admin/events" onClick={() => setShowMobileMenu(false)}>All Events</Link>
                    <Link to="/admin/bookings" onClick={() => setShowMobileMenu(false)}>All Bookings</Link>
                    <Link to="/admin/analytics" onClick={() => setShowMobileMenu(false)}>Analytics</Link>
                    <Link to="/admin/coupons" onClick={() => setShowMobileMenu(false)}>🎟️ Coupons</Link>
                    <Link to="/admin/scan" onClick={() => setShowMobileMenu(false)}>🎟️ Verify Ticket</Link>
                  </div>
                </div>
              )}
              
              {/* Notification Bell */}
              <div className="notification-container">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="notification-bell"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
              </div>

              {/* User Menu */}
              <div className="user-menu">
                <div className="user-info">
                  {/* Profile Picture with error handling - FIXED POINTER */}
                  {getProfilePicture() && !profilePicError ? (
                    <img 
                      src={getProfilePicture()} 
                      alt={user.username}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      onError={() => setProfilePicError(true)}
                    />
                  ) : (
                    <span className="user-avatar" style={{ fontSize: '18px' }}>👤</span>
                  )}
                  <span className="user-name">{user.username}</span>
                  <span className="role-badge" style={{ 
                    background: getRoleBadgeColor(),
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    marginLeft: '8px'
                  }}>
                    {userRole}
                  </span>
                </div>
                <div className="dropdown-menu-user">
                  <Link 
                    to="/profile" 
                    onClick={() => setShowMobileMenu(false)} 
                    style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#1f2937' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    👤 My Profile
                  </Link>
                  <Link 
                    to="/wishlist" 
                    onClick={() => setShowMobileMenu(false)} 
                    style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', color: '#1f2937' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    ❤️ Wishlist
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    🚪 Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        
        .dropdown {
          position: relative;
          display: inline-block;
        }
        
        .dropdown-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #4a5568;
          font-weight: 500;
          padding: 8px 0;
          transition: color 0.2s;
        }
        
        .dropdown-btn:hover {
          color: #6366f1;
        }
        
        .dropdown-content {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          min-width: 200px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          z-index: 1000;
          overflow: hidden;
          margin-top: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          border: 1px solid #eef2ff;
        }
        
        .dropdown-content.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .dropdown-content a {
          display: block;
          padding: 12px 16px;
          text-decoration: none;
          color: #1f2937;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .dropdown-content a:hover {
          background: #f8fafc;
          color: #6366f1;
        }
        
        .user-menu {
          position: relative;
          cursor: pointer;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 40px;
          background: #f3f4f6;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .user-info:hover {
          background: #e5e7eb;
        }
        
        .user-avatar {
          font-size: 18px;
        }
        
        .user-name {
          font-weight: 500;
          font-size: 14px;
          color: #1f2937;
        }
        
        .dropdown-menu-user {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          min-width: 150px;
          z-index: 1000;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          border: 1px solid #eef2ff;
        }
        
        .user-menu:hover .dropdown-menu-user {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .logout-btn {
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #dc2626;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .logout-btn:hover {
          background: #fef2f2;
        }
        
        /* Profile and Wishlist link hover styles */
        .dropdown-menu-user a {
          transition: background 0.2s;
        }
        
        .dropdown-menu-user a:hover {
          background: #f8fafc;
          color: #6366f1;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
          .nav-links {
            display: none;
            flex-direction: column;
            width: 100%;
            padding: 1rem 0;
            position: absolute;
            top: 70px;
            left: 0;
            background: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .nav-links.active {
            display: flex;
          }
          .dropdown {
            width: 100%;
          }
          .dropdown-content {
            position: static;
            box-shadow: none;
            padding-left: 1rem;
            margin-top: 0;
            opacity: 1;
            visibility: visible;
            transform: none;
            display: none;
          }
          .dropdown:hover .dropdown-content {
            display: block;
          }
          .dropdown-btn {
            width: 100%;
            text-align: left;
            padding: 8px 0;
          }
          .user-menu {
            width: 100%;
          }
          .user-info {
            justify-content: space-between;
            width: 100%;
          }
          .dropdown-menu-user {
            position: static;
            box-shadow: none;
            margin-top: 0;
            padding-left: 1rem;
            opacity: 1;
            visibility: visible;
            transform: none;
            display: none;
          }
          .user-menu:hover .dropdown-menu-user {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;