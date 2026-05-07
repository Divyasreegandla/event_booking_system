// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const { user, userRole, logout, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const getProfilePicture = () => {
    if (user?.profile_picture) return user.profile_picture;
    if (localStorage.getItem('userProfilePic')) return localStorage.getItem('userProfilePic');
    return null;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={() => setShowMobileMenu(false)}>
          <span className="logo-icon">🎫</span>
          <span className="logo-text">SmartEvent</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          ☰
        </button>

        <div className={`nav-menu ${showMobileMenu ? 'active' : ''}`}>
          {/* Left side - Main Navigation */}
          <div className="nav-left">
            <Link to="/" onClick={() => setShowMobileMenu(false)} className="nav-link">
              <span>🏠</span> {t('home')}
            </Link>
            
            {user && (
              <>
                <Link to="/bookings" onClick={() => setShowMobileMenu(false)} className="nav-link">
                  <span>📋</span> {t('myBookings')}
                </Link>
                <Link to="/tickets" onClick={() => setShowMobileMenu(false)} className="nav-link">
                  <span>🎟️</span> {t('myTickets')}
                </Link>
                <Link to="/wishlist" onClick={() => setShowMobileMenu(false)} className="nav-link">
                  <span>❤️</span> {t('wishlist')}
                </Link>
                <Link to="/referral" onClick={() => setShowMobileMenu(false)} className="nav-link">
                  <span>🎁</span> {t('referralProgram')}
                </Link>
                <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="nav-link">
                  <span>👤</span> {t('profile')}
                </Link>
              </>
            )}

            {(isOrganizer() || isAdmin()) && (
              <div className="dropdown-nav">
                <button className="dropdown-nav-btn">
                  <span>🎪</span> {t('organizer')} <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-nav-content">
                  <Link to="/organizer/events" onClick={() => setShowMobileMenu(false)}>
                    <span>📋</span> {t('myEvents')}
                  </Link>
                  <Link to="/organizer/create-event" onClick={() => setShowMobileMenu(false)}>
                    <span>➕</span> {t('createEvent')}
                  </Link>
                  <Link to="/organizer/dashboard" onClick={() => setShowMobileMenu(false)}>
                    <span>📊</span> {t('analytics')}
                  </Link>
                </div>
              </div>
            )}

            {isAdmin() && (
              <div className="dropdown-nav">
                <button className="dropdown-nav-btn">
                  <span>👑</span> {t('admin')} <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-nav-content">
                  <Link to="/admin/dashboard" onClick={() => setShowMobileMenu(false)}>📊 Dashboard</Link>
                  <Link to="/admin/users" onClick={() => setShowMobileMenu(false)}>👥 Users</Link>
                  <Link to="/admin/events" onClick={() => setShowMobileMenu(false)}>📅 All Events</Link>
                  <Link to="/admin/bookings" onClick={() => setShowMobileMenu(false)}>🎫 All Bookings</Link>
                  <Link to="/admin/analytics" onClick={() => setShowMobileMenu(false)}>📈 Analytics</Link>
                  <Link to="/admin/coupons" onClick={() => setShowMobileMenu(false)}>🎟️ Coupons</Link>
                  <Link to="/admin/scan" onClick={() => setShowMobileMenu(false)}>🔍 Verify Ticket</Link>
                </div>
              </div>
            )}
          </div>

          {/* Right side - User Controls */}
          <div className="nav-right">
            {user ? (
              <>
                <div className="notification-wrapper">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="notification-btn"
                  >
                    🔔
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>
                  {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
                </div>

                <div className="user-menu-wrapper">
                  <div className="user-trigger">
                    {getProfilePicture() && !profilePicError ? (
                      <img src={getProfilePicture()} alt={user.username} className="user-avatar-img" />
                    ) : (
                      <div className="user-avatar-placeholder" style={{ background: getRoleBadgeColor() }}>
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="user-name">{user.username}</span>
                    <span className="user-role-badge" style={{ background: getRoleBadgeColor() }}>
                      {userRole}
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  <div className="user-dropdown-nav">
                    <Link to="/profile" onClick={() => setShowMobileMenu(false)}>👤 {t('profile')}</Link>
                    <Link to="/wishlist" onClick={() => setShowMobileMenu(false)}>❤️ {t('wishlist')}</Link>
                    <Link to="/referral" onClick={() => setShowMobileMenu(false)}>🎁 {t('referralProgram')}</Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="logout-nav-btn">🚪 {t('logout')}</button>
                  </div>
                </div>

                <div className="theme-controls">
                  <LanguageSwitcher />
                  <DarkModeToggle />
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">{t('login')}</Link>
                <Link to="/register" className="register-btn">{t('register')}</Link>
                <div className="theme-controls">
                  <LanguageSwitcher />
                  <DarkModeToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Navbar Container */
        .navbar {
          background: var(--bg-primary);
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-md);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
          width: 100%;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          white-space: nowrap;
        }

        .logo-icon {
          font-size: 1.6rem;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        /* Navigation Menu */
        .nav-menu {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          margin-left: 40px;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Navigation Links */
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: var(--hover-bg);
          color: var(--primary);
        }

        /* Dropdown Navigation */
        .dropdown-nav {
          position: relative;
        }

        .dropdown-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .dropdown-nav-btn:hover {
          background: var(--hover-bg);
          color: var(--primary);
        }

        .dropdown-arrow {
          font-size: 10px;
          margin-left: 4px;
        }

        .dropdown-nav-content {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 200px;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s;
          z-index: 100;
        }

        .dropdown-nav:hover .dropdown-nav-content {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-nav-content a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 14px;
          transition: background 0.2s;
        }

        .dropdown-nav-content a:hover {
          background: var(--hover-bg);
          color: var(--primary);
        }

        /* Notification */
        .notification-wrapper {
          position: relative;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s;
          color: var(--text-secondary);
        }

        .notification-btn:hover {
          background: var(--hover-bg);
        }

        .notif-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 50%;
          min-width: 18px;
          text-align: center;
        }

        /* User Menu */
        .user-menu-wrapper {
          position: relative;
        }

        .user-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--hover-bg);
          border-radius: 40px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .user-trigger:hover {
          background: var(--border-color);
        }

        .user-avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          color: white;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role-badge {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: bold;
          color: white;
        }

        .user-dropdown-nav {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          min-width: 180px;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s;
          z-index: 100;
        }

        .user-menu-wrapper:hover .user-dropdown-nav {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .user-dropdown-nav a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 14px;
          transition: background 0.2s;
        }

        .user-dropdown-nav a:hover {
          background: var(--hover-bg);
          color: var(--primary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: 4px 0;
        }

        .logout-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #dc2626;
          transition: background 0.2s;
        }

        .logout-nav-btn:hover {
          background: var(--hover-bg);
        }

        /* Theme Controls */
        .theme-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 12px;
          border-left: 1px solid var(--border-color);
        }

        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-btn {
          padding: 8px 16px;
          text-decoration: none;
          color: var(--primary);
          font-weight: 500;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .login-btn:hover {
          background: var(--hover-bg);
        }

        .register-btn {
          padding: 8px 20px;
          background: var(--gradient-primary);
          text-decoration: none;
          color: white;
          font-weight: 500;
          border-radius: 8px;
          transition: transform 0.2s;
        }

        .register-btn:hover {
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .nav-container {
            padding: 0 24px;
          }
          
          .nav-menu {
            margin-left: 20px;
          }
          
          .nav-link, .dropdown-nav-btn {
            padding: 8px 10px;
            font-size: 13px;
          }
        }

        @media (max-width: 992px) {
          .nav-menu {
            margin-left: 16px;
          }
          
          .nav-left {
            gap: 4px;
          }
          
          .nav-link, .dropdown-nav-btn {
            padding: 8px 8px;
            font-size: 13px;
          }
          
          .user-name {
            max-width: 80px;
          }
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 16px;
          }
          
          .mobile-menu-btn {
            display: block;
          }
          
          .nav-menu {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: flex-start;
            margin-left: 0;
            padding: 20px;
            transition: left 0.3s ease;
            overflow-y: auto;
          }
          
          .nav-menu.active {
            left: 0;
          }
          
          .nav-left {
            flex-direction: column;
            width: 100%;
            gap: 8px;
          }
          
          .nav-right {
            flex-direction: column;
            width: 100%;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
          }
          
          .nav-link, .dropdown-nav-btn {
            width: 100%;
            justify-content: center;
          }
          
          .dropdown-nav {
            width: 100%;
          }
          
          .dropdown-nav-btn {
            width: 100%;
            justify-content: center;
          }
          
          .dropdown-nav-content {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            display: none;
            width: 100%;
            margin-top: 8px;
          }
          
          .dropdown-nav:hover .dropdown-nav-content {
            display: block;
          }
          
          .user-menu-wrapper {
            width: 100%;
          }
          
          .user-trigger {
            justify-content: center;
            width: 100%;
          }
          
          .user-dropdown-nav {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            display: none;
            width: 100%;
            margin-top: 8px;
          }
          
          .user-menu-wrapper:hover .user-dropdown-nav {
            display: block;
          }
          
          .theme-controls {
            justify-content: center;
            border-left: none;
            padding-left: 0;
          }
          
          .auth-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          .auth-buttons .theme-controls {
            margin-top: 12px;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            display: none;
          }
          
          .logo-icon {
            font-size: 1.8rem;
          }
          
          .user-name {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;