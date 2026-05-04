import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookingConfirmationModal = ({ booking, event, onClose }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '90%',
        padding: '30px',
        textAlign: 'center',
        animation: 'slideIn 0.3s ease'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ color: '#10b981', marginBottom: '16px' }}>Booking Confirmed!</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Your tickets have been booked successfully!
        </p>
        
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '20px'
        }}>
          <p><strong>Booking Reference:</strong> {booking?.booking_reference}</p>
          <p><strong>Event:</strong> {event?.title}</p>
          <p><strong>Quantity:</strong> {booking?.quantity} tickets</p>
          <p><strong>Total Amount:</strong> ₹{booking?.total_price}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/tickets');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            View My Tickets
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;