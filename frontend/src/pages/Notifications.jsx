import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllRead } from '../services/api';
import BackButton from '../components/BackButton';

const Notifications = () => {
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
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
       <BackButton />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn-secondary" style={{ padding: '8px 16px' }}>
            Mark All as Read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <span style={{ fontSize: '48px' }}>🔔</span>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>No notifications yet.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
              onClick={() => handleMarkAsRead(notif.id)}
            >
              <div className="notification-icon">{getIcon(notif.type)}</div>
              <div className="notification-content">
                <div className="notification-title">{notif.title}</div>
                <div className="notification-message">{notif.message}</div>
                <div className="notification-time">{formatTime(notif.created_at)}</div>
              </div>
              {!notif.is_read && (
                <div style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%', marginTop: '8px' }}></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;