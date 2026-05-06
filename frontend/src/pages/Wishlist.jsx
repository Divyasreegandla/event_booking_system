import React, { useState, useEffect } from 'react';
import { getWishlist, removeFromWishlist } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Wishlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await getWishlist();
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (eventId) => {
    try {
      await removeFromWishlist(eventId);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const handleBookNow = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>❤️ My Wishlist</h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <span style={{ fontSize: '64px' }}>🤍</span>
          <h2 style={{ marginTop: '16px', color: '#374151' }}>Your wishlist is empty</h2>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Save events you like and they'll appear here!
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  background: `url(${item.event_image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=100&h=100&fit=crop'}) center/cover`,
                  backgroundSize: 'cover'
                }} />
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{item.event_title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    📅 {formatDate(item.event_date)} | 📍 {item.event_city}
                  </p>
                  <p style={{ fontWeight: 'bold', color: '#6366f1', marginTop: '4px' }}>
                    ₹{item.event_price}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleBookNow(item.event_id)}
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Book Now →
                </button>
                <button
                  onClick={() => handleRemove(item.event_id)}
                  className="btn-danger"
                  style={{ padding: '8px 20px' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;