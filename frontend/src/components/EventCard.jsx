import React from 'react';
import { useNavigate } from 'react-router-dom';
import WishlistButton from './WishlistButton';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const getCategoryIcon = () => {
    switch (event.category) {
      case 'Music': return '🎵';
      case 'Tech': return '💻';
      case 'Sports': return '🏈';
      case 'Business': return '💼';
      case 'Comedy': return '😂';
      default: return '🎫';
    }
  };

  const getCategoryColor = () => {
    switch (event.category) {
      case 'Music': return 'linear-gradient(135deg, #f59e0b, #ef4444)';
      case 'Tech': return 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
      case 'Sports': return 'linear-gradient(135deg, #10b981, #06b6d4)';
      case 'Business': return 'linear-gradient(135deg, #6366f1, #a855f7)';
      case 'Comedy': return 'linear-gradient(135deg, #ec4899, #f43f5e)';
      default: return 'linear-gradient(135deg, #6b7280, #9ca3af)';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getEventStatusBadge = () => {
    const status = event.event_status;
    if (status === 'UPCOMING') return { text: 'UPCOMING', color: '#10b981' };
    if (status === 'ONGOING') return { text: 'LIVE', color: '#f59e0b' };
    if (status === 'COMPLETED') return { text: 'COMPLETED', color: '#6b7280' };
    if (status === 'CANCELLED') return { text: 'CANCELLED', color: '#ef4444' };
    return null;
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/events/${event.id}`);
  };

  const statusBadge = getEventStatusBadge();
  const defaultImage = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=250&fit=crop";
  const eventImage = event.image_url || defaultImage;

  return (
    <div className="event-card-modern">
      <div 
        className="event-card-image-modern" 
        style={{ 
          backgroundImage: `url(${eventImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        <div className="event-category-badge" style={{ background: getCategoryColor() }}>
          {getCategoryIcon()} {event.category}
        </div>
        {statusBadge && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: statusBadge.color,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {statusBadge.text}
          </div>
        )}
      </div>
      
      <div className="event-card-content-modern">
        <h3 className="event-card-title-modern">{event.title}</h3>
        
        <div className="event-card-details-modern">
          <div className="event-detail-modern">
            <span className="detail-icon">📅</span>
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="event-detail-modern">
            <span className="detail-icon">📍</span>
            <span>{event.city}</span>
          </div>
        </div>
        
        <div className="event-card-footer">
          <div className="event-card-price-modern">{formatPrice(event.price)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WishlistButton eventId={event.id} size="small" />
            {event.event_status === 'UPCOMING' && event.available_tickets > 0 ? (
              <button onClick={handleBookNow} className="book-now-btn">
                Book Now →
              </button>
            ) : event.event_status === 'CANCELLED' ? (
              <span style={{ color: '#ef4444', fontSize: '12px' }}>Cancelled</span>
            ) : (
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Sold Out</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;