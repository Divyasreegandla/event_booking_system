import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/api';
import toast from 'react-hot-toast';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, quantity: initialQuantity } = location.state || {};
  const [loading, setLoading] = useState(false);

  if (!event) {
    navigate('/');
    return null;
  }

  const totalAmount = event.price * initialQuantity;

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

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      await createBooking({
        event_id: event.id,
        quantity: initialQuantity
      });
      
      toast.success('Booking confirmed! Check your email for your tickets.');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="booking-container">
      <button onClick={goBack} className="back-button">← Back to Event</button>
      
      <div className="booking-wrapper">
        <div className="booking-event-details">
          <h2>Event Details</h2>
          <div className="booking-event-card">
            <div className="booking-event-image" style={{ backgroundImage: `url(${event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop'})` }}></div>
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
          <div className="summary-row">
            <span>Ticket Price</span>
            <span>₹{event.price}</span>
          </div>
          <div className="summary-row">
            <span>Quantity</span>
            <span>x {initialQuantity}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Total Amount</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="confirm-booking-btn"
          >
            {loading ? 'Processing...' : 'Confirm Booking →'}
          </button>
          
          <p className="booking-note">
            By confirming your booking, you agree to our terms and conditions.
            Tickets will be sent to your registered email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Booking;