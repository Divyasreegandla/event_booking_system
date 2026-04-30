import React, { useState, useEffect } from 'react';
import { getAllBookingsAdmin } from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getAllBookingsAdmin();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
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

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

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
        <h1 style={{ fontSize: '28px' }}>All Bookings</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilter('all')} className="btn-secondary" style={{ background: filter === 'all' ? '#2563eb' : '', color: filter === 'all' ? 'white' : '' }}>All</button>
          <button onClick={() => setFilter('confirmed')} className="btn-secondary" style={{ background: filter === 'confirmed' ? '#10b981' : '', color: filter === 'confirmed' ? 'white' : '' }}>Confirmed</button>
          <button onClick={() => setFilter('cancelled')} className="btn-secondary" style={{ background: filter === 'cancelled' ? '#ef4444' : '', color: filter === 'cancelled' ? 'white' : '' }}>Cancelled</button>
          <button onClick={() => setFilter('pending')} className="btn-secondary" style={{ background: filter === 'pending' ? '#f59e0b' : '', color: filter === 'pending' ? 'white' : '' }}>Pending</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Booking Ref</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Event</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Quantity</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Total</th>
                <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
               </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{booking.id}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>{booking.booking_reference}</td>
                  <td style={{ padding: '12px' }}>
                    <div><strong>{booking.user?.username}</strong></div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{booking.user?.email}</div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{booking.event?.title || 'N/A'}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{booking.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(booking.total_price)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      background: booking.status === 'confirmed' ? '#d1fae5' : booking.status === 'cancelled' ? '#fee2e2' : '#fed7aa',
                      color: booking.status === 'confirmed' ? '#065f46' : booking.status === 'cancelled' ? '#991b1b' : '#9a3412',
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold'
                    }}>
                      {booking.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>{formatDate(booking.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        Total Bookings: {filteredBookings.length}
      </div>
    </div>
  );
};

export default AdminBookings;