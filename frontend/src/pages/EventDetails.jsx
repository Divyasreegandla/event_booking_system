import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, getMyBookings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import ReviewsSection from '../components/ReviewsSection';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userHasAttended, setUserHasAttended] = useState(false);

  useEffect(() => {
    fetchEvent();
    if (user) {
      checkUserAttendance();
    }
    window.scrollTo(0, 0);
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const response = await getEvent(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkUserAttendance = async () => {
    try {
      const response = await getMyBookings();
      let bookings = [];
      if (Array.isArray(response.data)) {
        bookings = response.data;
      } else if (response.data?.bookings) {
        bookings = response.data.bookings;
      }
      
      const hasAttended = bookings.some(
        booking => booking.event_id === parseInt(id) && 
        booking.status === 'confirmed' &&
        new Date(booking.event_date) < new Date()
      );
      setUserHasAttended(hasAttended);
      console.log('User has attended:', hasAttended); // Debug log
    } catch (error) {
      console.error('Failed to check attendance:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`, { state: { event, quantity } });
  };

  const getStatusColor = () => {
    const status = event?.event_status;
    if (status === 'UPCOMING') return '#10b981';
    if (status === 'ONGOING') return '#f59e0b';
    if (status === 'COMPLETED') return '#6b7280';
    if (status === 'CANCELLED') return '#ef4444';
    return '#6b7280';
  };

  const defaultImage = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop";
  const eventImage = event?.image_url || defaultImage;

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="event-detail-container">
      <BackButton />
      
      <div className="event-detail-card">
        <div className="event-detail-header" style={{ backgroundImage: `url(${eventImage})` }}>
          <div className="event-detail-overlay">
            <span className="event-category-large">{event.category}</span>
          </div>
        </div>
        
        <div className="event-detail-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h1 className="event-detail-title">{event.title}</h1>
            <span style={{ 
              background: getStatusColor(), 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {event.event_status}
            </span>
          </div>
          
          <div className="event-info-grid">
            <div className="event-info-item">
              <span className="event-info-label">📅 Date & Time</span>
              <span className="event-info-value">{formatDate(event.event_date)}</span>
            </div>
            <div className="event-info-item">
              <span className="event-info-label">📍 Venue</span>
              <span className="event-info-value">{event.venue}</span>
            </div>
            <div className="event-info-item">
              <span className="event-info-label">🏙️ City</span>
              <span className="event-info-value">{event.city}</span>
            </div>
            <div className="event-info-item">
              <span className="event-info-label">🎟️ Available Tickets</span>
              <span className="event-info-value"><strong>{event.available_tickets}</strong> / {event.total_tickets}</span>
            </div>
            <div className="event-info-item">
              <span className="event-info-label">👤 Organized by</span>
              <span className="event-info-value">{event.organizer_name || 'SmartEvent'}</span>
            </div>
          </div>
          
          <div className="event-description-section">
            <h3>About This Event</h3>
            <p>{event.description}</p>
          </div>
          
          {event.event_status === 'UPCOMING' && event.available_tickets > 0 ? (
            <div className="booking-section">
              <div className="price-box">
                <span className="price-label">Ticket Price</span>
                <span className="price-amount">₹{event.price}</span>
              </div>
              <div className="booking-controls">
                <div className="quantity-selector">
                  <span>Quantity:</span>
                  <input
                    type="number"
                    min="1"
                    max={Math.min(10, event.available_tickets)}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="quantity-input"
                  />
                  <span className="total-price">
                    Total: <strong>₹{(event.price * quantity).toFixed(2)}</strong>
                  </span>
                </div>
                <button onClick={handleBooking} className="book-now-btn-large">
                  Book Now →
                </button>
              </div>
            </div>
          ) : event.event_status === 'CANCELLED' ? (
            <div className="sold-out-card" style={{ background: '#fee2e2' }}>
              <span>🚫</span>
              <h3>Event Cancelled</h3>
              <p>This event has been cancelled. Please contact support for refunds.</p>
            </div>
          ) : (
            <div className="sold-out-card">
              <span>🎟️</span>
              <h3>Sold Out!</h3>
              <p>This event has no more tickets available.</p>
            </div>
          )}
          
          {/* REVIEWS SECTION */}
          <ReviewsSection eventId={event.id} userHasAttended={userHasAttended} />
        </div>
      </div>
    </div>
  );
};

export default EventDetails;