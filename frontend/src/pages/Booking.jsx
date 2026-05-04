import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking, validateCoupon } from '../services/api';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, quantity: initialQuantity } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');

  if (!event) {
    navigate('/');
    return null;
  }

  const originalAmount = event.price * initialQuantity;
  const discountedAmount = couponApplied ? couponApplied.final_amount : originalAmount;
  const discountAmount = couponApplied ? couponApplied.discount_amount : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponMessage('');
    try {
      const response = await validateCoupon(couponCode, originalAmount);
      const result = response.data;
      
      if (result.valid) {
        setCouponApplied(result);
        setCouponMessage(`✅ ${result.message}`);
        toast.success(result.message);
      } else {
        setCouponApplied(null);
        setCouponMessage(`❌ ${result.message}`);
        toast.error(result.message);
      }
    } catch (error) {
      setCouponMessage('❌ Failed to validate coupon');
      toast.error('Failed to validate coupon');
      setCouponApplied(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponMessage('');
    toast.success('Coupon removed');
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const bookingData = {
        event_id: event.id,
        quantity: initialQuantity
      };
      
      const response = await createBooking(bookingData);
      const booking = response.data;
      
      toast.success('Booking created! Redirecting to payment...');
      
      navigate('/payment-checkout', { 
        state: { 
          booking, 
          event,
          couponApplied,
          originalAmount,
          discountedAmount
        } 
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <BackButton />
      
      <div className="booking-wrapper">
        <div className="booking-event-details">
          <h2>Event Details</h2>
          <div className="booking-event-card">
            <div 
              className="booking-event-image" 
              style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop'})` }}
            ></div>
            <div className="booking-event-info">
              <h3>{event.title}</h3>
              <p><strong>📅 Date:</strong> {formatDate(event.event_date)}</p>
              <p><strong>📍 Venue:</strong> {event.venue}, {event.city}</p>
              <p><strong>🎟️ Category:</strong> {event.category}</p>
              <p><strong>Quantity:</strong> {initialQuantity} tickets</p>
            </div>
          </div>
        </div>
        
        <div className="booking-summary-card">
          <h2>Order Summary</h2>
          
          {/* Coupon Section - VISIBLE AND WORKING */}
          <div style={{ 
            margin: '16px 0', 
            padding: '16px', 
            background: 'linear-gradient(135deg, #f8fafc, #eef2ff)', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <label style={{ fontWeight: '600', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              🎟️ Apply Coupon Code
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code (e.g., WELCOME10, SAVE20)"
                disabled={couponApplied !== null}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white'
                }}
              />
              {couponApplied ? (
                <button
                  onClick={handleRemoveCoupon}
                  style={{
                    padding: '12px 20px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    opacity: applyingCoupon ? 0.7 : 1
                  }}
                >
                  {applyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              )}
            </div>
            {couponMessage && (
              <p style={{ 
                fontSize: '12px', 
                marginTop: '8px', 
                color: couponMessage.includes('✅') ? '#10b981' : '#dc2626' 
              }}>
                {couponMessage}
              </p>
            )}
            {!couponApplied && (
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                Try: WELCOME10, SAVE20, FLAT200, STUDENT25
              </p>
            )}
          </div>
          
          {/* Bill Details Breakdown */}
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#f8fafc', 
            borderRadius: '12px'
          }}>
            <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Bill Details</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Ticket Price:</span>
              <span>₹{event.price} x {initialQuantity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
              <span>Subtotal:</span>
              <span>₹{originalAmount}</span>
            </div>
            {couponApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px', color: '#10b981' }}>
                <span>Discount ({couponCode}):</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}
            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '8px', paddingTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total Amount:</span>
                <span style={{ fontSize: '18px', color: '#6366f1' }}>₹{discountedAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="confirm-booking-btn"
          >
            {loading ? 'Processing...' : 'Proceed to Payment →'}
          </button>
          
          <p className="booking-note">
            By confirming your booking, you agree to our terms and conditions.
            You will be redirected to payment page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Booking;