import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, getEventBookings } from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const EventBookings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [eventRes, bookingsRes] = await Promise.all([
        getEvent(id),
        getEventBookings(id)
      ]);
      setEvent(eventRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load bookings');
      navigate('/organizer/events');
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

  const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);

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
      
      {event && (
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{event.title}</h1>
          <p style={{ color: '#6b7280' }}>{formatDate(event.event_date)} at {event.venue}, {event.city}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{bookings.length}</h3>
          <p style={{ color: '#6b7280' }}>Total Bookings</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎟️</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTickets}</h3>
          <p style={{ color: '#6b7280' }}>Tickets Sold</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>💰</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(totalRevenue)}</h3>
          <p style={{ color: '#6b7280' }}>Total Revenue</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📈</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{event?.available_tickets || 0}</h3>
          <p style={{ color: '#6b7280' }}>Tickets Remaining</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Booking Details</h2>
        
        {bookings.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No bookings yet for this event.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Booking Ref</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Customer</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Total Amount</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Booking Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>{booking.booking_reference}</td>
                    <td style={{ padding: '12px' }}>
                      <div><strong>{booking.user?.username}</strong></div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{booking.user?.email}</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold' }}>{booking.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(booking.total_price)}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ 
                        background: booking.status === 'confirmed' ? '#d1fae5' : '#fee2e2',
                        color: booking.status === 'confirmed' ? '#065f46' : '#991b1b',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px'
                      }}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>{formatDate(booking.booking_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBookings;