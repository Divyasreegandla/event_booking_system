import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initiatePayment, simulatePayment, validateCoupon } from '../services/api';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, event } = location.state || {};
  
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!booking || !event) {
    navigate('/bookings');
    return null;
  }

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    try {
      const response = await validateCoupon(couponCode, booking.total_price);
      const result = response.data;
      
      if (result.valid) {
        setCouponApplied(result);
        toast.success(result.message);
      } else {
        setCouponApplied(null);
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to validate coupon');
      setCouponApplied(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const initResponse = await initiatePayment(booking.id, paymentMethod);
      const payment = initResponse.data;
      
      toast.loading('Processing payment...', { id: 'payment' });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const simulateResponse = await simulatePayment(payment.payment_id, true);
      const result = simulateResponse.data;
      
      if (result.status === 'SUCCESS') {
        toast.success('Payment successful!', { id: 'payment' });
        
        // Pass complete payment data including transaction_id
        navigate('/payment-confirmation', {
          state: {
            booking,
            event,
            payment: {
              status: result.status,
              transaction_id: result.transaction_id,
              payment_id: result.payment_id,
              amount: result.amount
            },
            couponApplied,
            paymentMethod
          }
        });
      } else {
        toast.error('Payment failed. Please try again.', { id: 'payment' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Payment failed', { id: 'payment' });
    } finally {
      setProcessing(false);
    }
  };

  const originalAmount = booking.total_price;
  const discountedAmount = couponApplied ? couponApplied.final_amount : originalAmount;
  const discountAmount = couponApplied ? couponApplied.discount_amount : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '2rem', marginTop: '20px' }}>
        {/* Left Column - Payment Form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '24px' }}>Payment Details</h2>
          
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderRadius: '12px', 
            padding: '16px', 
            marginBottom: '24px',
            color: 'white'
          }}>
            <h3 style={{ marginBottom: '8px', color: 'white' }}>{event.title}</h3>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>📅 {formatDate(event.event_date)}</p>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>📍 {event.venue}, {event.city}</p>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>🎟️ {booking.quantity} tickets</p>
          </div>
          
          {/* Coupon Section */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>🎟️ Apply Coupon</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                disabled={couponApplied !== null}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              />
              {couponApplied ? (
                <button
                  onClick={handleRemoveCoupon}
                  style={{
                    padding: '12px 24px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    opacity: applyingCoupon ? 0.7 : 1
                  }}
                >
                  {applyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              )}
            </div>
            {couponApplied && (
              <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>
                ✓ Coupon applied! You saved ₹{discountAmount}
              </p>
            )}
          </div>
          
          {/* Payment Method */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>💳 Payment Method</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {['CARD', 'UPI', 'NETBANKING', 'WALLET'].map(method => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={processing}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: processing ? 0.7 : 1
            }}
          >
            {processing ? 'Processing...' : `Pay ₹${discountedAmount}`}
          </button>
        </div>
        
        {/* Right Column - Order Summary */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          height: 'fit-content',
          position: 'sticky',
          top: '100px'
        }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '2px solid #eef2ff', paddingBottom: '12px' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span>Ticket Price</span>
            <span>₹{event.price} x {booking.quantity}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span>Subtotal</span>
            <span>₹{originalAmount}</span>
          </div>
          
          {couponApplied && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#10b981' }}>
              <span>Discount</span>
              <span>- ₹{discountAmount}</span>
            </div>
          )}
          
          <div style={{ borderTop: '2px dashed #e2e8f0', margin: '16px 0', paddingTop: '16px' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span style={{ color: '#6366f1' }}>₹{discountedAmount}</span>
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            background: '#f8fafc', 
            borderRadius: '8px', 
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            🔒 Secure payment powered by SmartEvent
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;