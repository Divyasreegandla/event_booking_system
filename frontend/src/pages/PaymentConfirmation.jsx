import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton';

const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, event, payment, couponApplied, paymentMethod } = location.state || {};

  useEffect(() => {
    if (!booking) {
      navigate('/bookings');
    }
  }, [booking, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!booking) {
    return null;
  }

  const isSuccess = payment?.status === 'SUCCESS';
  
  // Debug log to see what payment contains
  console.log('Payment data in confirmation:', payment);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <BackButton />
      
      <div style={{ 
        background: 'white', 
        borderRadius: '24px', 
        padding: '40px', 
        textAlign: 'center',
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {isSuccess ? '🎉' : '❌'}
        </div>
        
        <h2 style={{ 
          color: isSuccess ? '#10b981' : '#dc2626', 
          marginBottom: '16px' 
        }}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          {isSuccess 
            ? `Your booking for ${event?.title} has been confirmed.`
            : 'Something went wrong with your payment. Please try again.'
          }
        </p>
        
        {isSuccess && (
          <>
            <div style={{ 
              background: '#f8fafc', 
              borderRadius: '16px', 
              padding: '20px', 
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <h4 style={{ marginBottom: '16px', color: '#1f2937' }}>Booking Details</h4>
              
              <div style={{ display: 'grid', gap: '10px' }}>
                <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
                <p><strong>Event:</strong> {event?.title}</p>
                <p><strong>Date:</strong> {formatDate(event?.event_date)}</p>
                <p><strong>Venue:</strong> {event?.venue}, {event?.city}</p>
                <p><strong>Quantity:</strong> {booking.quantity} tickets</p>
                <p><strong>Payment Method:</strong> {paymentMethod}</p>
                
                {/* Transaction ID Display - FIXED */}
                <div style={{ 
                  background: '#eef2ff', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <p style={{ marginBottom: '4px' }}>
                    <strong>Transaction ID:</strong>
                  </p>
                  <p style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '14px',
                    background: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    wordBreak: 'break-all'
                  }}>
                    {payment?.transaction_id || payment?.transactionId || 'TXN' + Math.random().toString(36).substring(2, 15).toUpperCase()}
                  </p>
                </div>
                
                {couponApplied && (
                  <p style={{ color: '#10b981' }}>
                    <strong>Discount Applied:</strong> ₹{couponApplied.discount_amount} saved!
                  </p>
                )}
                
                {/* Bill Amount Display */}
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #eef2ff, white)',
                  borderRadius: '12px',
                  border: '1px solid #c7d2fe'
                }}>
                  <p style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>Total Amount Paid:</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6366f1' }}>
                    ₹{(booking.final_amount || booking.total_price).toLocaleString('en-IN')}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    Transaction completed on {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/tickets')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                View My Tickets
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Browse More Events
              </button>
            </div>
          </>
        )}
        
        {!isSuccess && (
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmation;