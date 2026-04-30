import React, { useState, useEffect } from 'react';
import { getAllEventsAdmin } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getAllEventsAdmin();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      UPCOMING: { bg: '#d1fae5', color: '#065f46' },
      ONGOING: { bg: '#fed7aa', color: '#9a3412' },
      COMPLETED: { bg: '#e5e7eb', color: '#374151' },
      CANCELLED: { bg: '#fee2e2', color: '#991b1b' }
    };
    const s = styles[status] || styles.UPCOMING;
    return <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>{status}</span>;
  };

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.event_status === filter.toUpperCase());

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '28px' }}>All Events</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilter('all')} className={`btn-secondary ${filter === 'all' ? 'active' : ''}`} style={{ background: filter === 'all' ? '#2563eb' : '', color: filter === 'all' ? 'white' : '' }}>All</button>
          <button onClick={() => setFilter('upcoming')} className={`btn-secondary ${filter === 'upcoming' ? 'active' : ''}`} style={{ background: filter === 'upcoming' ? '#2563eb' : '', color: filter === 'upcoming' ? 'white' : '' }}>Upcoming</button>
          <button onClick={() => setFilter('ongoing')} className={`btn-secondary ${filter === 'ongoing' ? 'active' : ''}`} style={{ background: filter === 'ongoing' ? '#2563eb' : '', color: filter === 'ongoing' ? 'white' : '' }}>Ongoing</button>
          <button onClick={() => setFilter('completed')} className={`btn-secondary ${filter === 'completed' ? 'active' : ''}`} style={{ background: filter === 'completed' ? '#2563eb' : '', color: filter === 'completed' ? 'white' : '' }}>Completed</button>
          <button onClick={() => setFilter('cancelled')} className={`btn-secondary ${filter === 'cancelled' ? 'active' : ''}`} style={{ background: filter === 'cancelled' ? '#2563eb' : '', color: filter === 'cancelled' ? 'white' : '' }}>Cancelled</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Price</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Tickets</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Organizer</th>
               </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{event.id}</td>
                  <td style={{ padding: '12px' }}>
                    <Link to={`/events/${event.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                      {event.title.length > 40 ? event.title.substring(0, 40) + '...' : event.title}
                    </Link>
                  </td>
                  <td style={{ padding: '12px' }}>{event.category}</td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>{formatDate(event.event_date)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(event.price)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{event.available_tickets} / {event.total_tickets}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(event.event_status)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px' }}>{event.organizer_name || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;