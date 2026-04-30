import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyEvents, cancelEvent } from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getMyEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to cancel "${eventTitle}"? This will notify all booked users.`)) {
      try {
        await cancelEvent(eventId);
        toast.success('Event cancelled successfully');
        fetchEvents();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to cancel event');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      UPCOMING: { bg: '#d1fae5', color: '#065f46', text: 'UPCOMING' },
      ONGOING: { bg: '#fed7aa', color: '#9a3412', text: 'ONGOING' },
      COMPLETED: { bg: '#e5e7eb', color: '#374151', text: 'COMPLETED' },
      CANCELLED: { bg: '#fee2e2', color: '#991b1b', text: 'CANCELLED' }
    };
    const s = styles[status] || styles.UPCOMING;
    return <span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{s.text}</span>;
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px' }}>My Events</h1>
        <Link to="/organizer/create-event" className="btn-primary">+ Create New Event</Link>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <span style={{ fontSize: '48px' }}>📅</span>
          <p style={{ marginTop: '16px' }}>You haven't created any events yet.</p>
          <Link to="/organizer/create-event" className="btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Create Your First Event</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {events.map(event => (
            <div key={event.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '18px' }}>{event.title}</h3>
                    {getStatusBadge(event.event_status)}
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📅 {formatDate(event.event_date)}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📍 {event.venue}, {event.city}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>🎟️ {event.available_tickets} / {event.total_tickets} tickets available</p>
                </div>
                <div style={{ textAlign: 'right', minWidth: '200px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginBottom: '12px' }}>₹{event.price}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Link to={`/organizer/event/${event.id}/bookings`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>View Bookings</Link>
                    <Link to={`/organizer/edit-event/${event.id}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>Edit</Link>
                    {event.event_status === 'UPCOMING' && (
                      <button onClick={() => handleCancel(event.id, event.title)} className="btn-danger">Cancel Event</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerEvents;