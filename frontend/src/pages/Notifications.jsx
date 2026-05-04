import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllRead, deleteNotification } from '../services/api';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';

const Notifications = () => {
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
      toast.success('Marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id);
        toast.success('Notification deleted');
        fetchNotifications();
      } catch (error) {
        toast.error('Failed to delete notification');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) {
      try {
        await Promise.all(notifications.map(n => deleteNotification(n.id)));
        toast.success('All notifications deleted');
        fetchNotifications();
      } catch (error) {
        toast.error('Failed to delete notifications');
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING': return '🎫';
      case 'PAYMENT': return '💰';
      case 'EVENT': return '🔔';
      case 'SYSTEM': return '📢';
      default: return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'BOOKING': return '#10b981';
      case 'PAYMENT': return '#6366f1';
      case 'EVENT': return '#f59e0b';
      default: return '#6b7280';
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px' }}>Notifications</h1>
          {unreadCount > 0 && (
            <p style={{ color: '#6366f1', fontSize: '14px', marginTop: '4px' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllRead} className="btn-secondary" style={{ padding: '8px 16px' }}>
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleDeleteAll} className="btn-danger" style={{ padding: '8px 16px' }}>
              Delete All
            </button>
          )}
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <span style={{ fontSize: '64px' }}>🔔</span>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>No notifications yet.</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            When you book events or receive updates, they'll appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                background: notif.is_read ? 'white' : 'linear-gradient(135deg, #eef2ff, white)',
                borderRadius: '16px',
                padding: '20px',
                borderLeft: `4px solid ${getTypeColor(notif.type)}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '28px' }}>{getIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '16px' }}>{notif.title}</strong>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: getTypeColor(notif.type),
                      color: 'white'
                    }}>
                      {notif.type}
                    </span>
                    {!notif.is_read && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        background: '#6366f1',
                        color: 'white'
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {formatTime(notif.created_at)}
                    </span>
                    {notif.booking_reference && (
                      <span style={{ fontSize: '11px', color: '#6366f1', fontFamily: 'monospace' }}>
                        Ref: {notif.booking_reference}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;