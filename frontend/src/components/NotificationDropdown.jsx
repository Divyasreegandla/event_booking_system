import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAsRead, markAllRead } from '../services/api';

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return '🎫';
      case 'EVENT_REMINDER':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    return `${diffDays} day ago`;
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h4>Notifications</h4>
        {notifications.some(n => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
            Mark all read
          </button>
        )}
      </div>
      
      <div className="notification-dropdown-list">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            No notifications
          </div>
        ) : (
          notifications.slice(0, 5).map((notif) => (
            <div
              key={notif.id}
              className={`notification-dropdown-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => handleMarkAsRead(notif.id)}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{getIcon(notif.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{notif.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {notif.message.length > 80 ? notif.message.substring(0, 80) + '...' : notif.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    {formatTime(notif.created_at)}
                  </div>
                </div>
                {!notif.is_read && (
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%' }}></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="notification-dropdown-footer">
        <Link to="/notifications" onClick={onClose}>
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;