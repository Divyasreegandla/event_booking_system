import React, { useState, useEffect } from 'react';
import { getEventUpdates, createEventUpdate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LiveEventUpdates = ({ eventId, isOrganizer = false }) => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [updateType, setUpdateType] = useState('announcement');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, [eventId]);

  const fetchUpdates = async () => {
    try {
      const response = await getEventUpdates(eventId);
      setUpdates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSubmitting(true);
    try {
      await createEventUpdate(eventId, { message, update_type: updateType });
      toast.success('Update posted successfully!');
      setMessage('');
      setShowForm(false);
      fetchUpdates();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post update');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / 3600000);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'reminder': return '🔔';
      case 'change': return '⚠️';
      case 'cancellation': return '🚫';
      default: return '📝';
    }
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case 'announcement': return '#10b981';
      case 'reminder': return '#f59e0b';
      case 'change': return '#f59e0b';
      case 'cancellation': return '#dc2626';
      default: return '#6366f1';
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading updates...</div>;
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📢</span> Live Updates
        </h3>
        {isOrganizer && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            + Post Update
          </button>
        )}
      </div>

      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #eef2ff'
        }}>
          <h4 style={{ marginBottom: '12px' }}>Post an Update</h4>
          <form onSubmit={handleSubmitUpdate}>
            <div style={{ marginBottom: '12px' }}>
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}
              >
                <option value="announcement">📢 Announcement</option>
                <option value="reminder">🔔 Reminder</option>
                <option value="change">⚠️ Change/Venue Update</option>
                <option value="cancellation">🚫 Cancellation Notice</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your update message..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Posting...' : 'Post Update'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '8px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {updates.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '30px',
          background: '#f8fafc',
          borderRadius: '12px',
          color: '#6b7280'
        }}>
          No updates yet. Check back later for announcements!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {updates.map(update => (
            <div
              key={update.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                borderLeft: `4px solid ${getUpdateColor(update.update_type)}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getUpdateIcon(update.update_type)}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: getUpdateColor(update.update_type),
                  color: 'white'
                }}>
                  {update.update_type.toUpperCase()}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                  {formatTime(update.created_at)}
                </span>
              </div>
              <p style={{ color: '#374151', lineHeight: '1.5', marginBottom: '8px' }}>
                {update.message}
              </p>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                — {update.created_by_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveEventUpdates;