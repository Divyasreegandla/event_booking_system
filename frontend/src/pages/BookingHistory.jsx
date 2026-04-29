import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking, sendReminder } from '../services/api';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      console.log('Bookings fetched:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId, eventTitle) => {
  if (window.confirm(`Are you sure you want to cancel "${eventTitle}"?`)) {
    setActionInProgress(bookingId);
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully!');
      await fetchBookings();
      
      // Dispatch event to notify Tickets page to refresh
      window.dispatchEvent(new Event('bookingCancelled'));
      
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel');
    } finally {
      setActionInProgress(null);
    }
  }
};

  const handleSendReminder = async (bookingId) => {
    setActionInProgress(bookingId);
    try {
      const response = await sendReminder(bookingId);
      console.log('Reminder response:', response);
      toast.success('Reminder sent to your email!');
    } catch (error) {
      console.error('Reminder error:', error);
      toast.error(error.response?.data?.detail || 'Failed to send reminder');
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Separate bookings
  const activeBookings = bookings.filter(b => b.status?.toLowerCase() === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status?.toLowerCase() === 'cancelled');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>My Bookings</h1>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <span style={{ fontSize: '48px' }}>📭</span>
          <p style={{ marginTop: '16px' }}>No bookings yet.</p>
        </div>
      ) : (
        <>
          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <>
              <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#2563eb' }}>Active Bookings</h2>
              {activeBookings.map(booking => (
                <div key={booking.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 2 }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{booking.event_title}</h3>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📅 {formatDate(booking.event_date)}</p>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📍 {booking.venue}, {booking.city}</p>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>🎟️ {booking.quantity} tickets</p>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>🔖 {booking.booking_reference}</p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginBottom: '12px' }}>${booking.total_price}</p>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#d1fae5', color: '#065f46' }}>
                        ✓ CONFIRMED
                      </span>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <button
                          onClick={() => handleSendReminder(booking.id)}
                          disabled={actionInProgress === booking.id}
                          style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          {actionInProgress === booking.id ? 'Sending...' : '📧 Send Reminder'}
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id, booking.event_title)}
                          disabled={actionInProgress === booking.id}
                          style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          {actionInProgress === booking.id ? 'Processing...' : '❌ Cancel Booking'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <>
              <h2 style={{ fontSize: '20px', marginBottom: '16px', marginTop: '32px', color: '#6b7280' }}>Cancelled Bookings</h2>
              {cancelledBookings.map(booking => (
                <div key={booking.id} style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '16px', opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 2 }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '8px', textDecoration: 'line-through' }}>{booking.event_title}</h3>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📅 {formatDate(booking.event_date)}</p>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>📍 {booking.venue}, {booking.city}</p>
                      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>🎟️ {booking.quantity} tickets</p>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>🔖 {booking.booking_reference}</p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#6b7280', marginBottom: '12px' }}>${booking.total_price}</p>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#fee2e2', color: '#991b1b' }}>
                        ✗ CANCELLED
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BookingHistory;