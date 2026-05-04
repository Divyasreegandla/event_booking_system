import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAsRead, markAllRead, deleteNotification } from '../services/api';
import toast from 'react-hot-toast';

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications || []);
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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to delete');
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
      case 'BOOKING': return '🎫';
      case 'PAYMENT': return '💰';
      case 'EVENT': return '🔔';
      default: return '📢';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor((now - date) / 3600000);
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    return `${diffDays} day ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h4>Notifications</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              padding: '4px 12px', 
              borderRadius: '20px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '12px'
            }}>
              Mark all read
            </button>
          )}
        </div>
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
              style={{ position: 'relative' }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>{getIcon(notif.type)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{notif.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {notif.message.length > 70 ? notif.message.substring(0, 70) + '...' : notif.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    {formatTime(notif.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      style={{
                        background: '#e0e7ff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        color: '#4f46e5'
                      }}
                    >
                      Read
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(notif.id, e)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      color: '#dc2626'
                    }}
                  >
                    Delete
                  </button>
                </div>
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