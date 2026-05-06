import React, { useState, useEffect } from 'react';
import { addToWishlist, removeFromWishlist, checkInWishlist } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const WishlistButton = ({ eventId, size = 'small', variant = 'icon' }) => {
  const { user } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && eventId) {
      checkWishlistStatus();
    }
  }, [eventId, user]);

  const checkWishlistStatus = async () => {
    try {
      const response = await checkInWishlist(eventId);
      setIsInWishlist(response.data.in_wishlist);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save events');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(eventId);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ event_id: eventId });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggleWishlist}
        disabled={loading}
        style={{
          padding: size === 'small' ? '6px 12px' : '10px 20px',
          background: isInWishlist ? '#dc2626' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: size === 'small' ? '12px' : '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {isInWishlist ? '❤️ Saved' : '🤍 Save'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: size === 'small' ? '20px' : '28px',
        opacity: loading ? 0.5 : 1,
        color: isInWishlist ? '#dc2626' : '#9ca3af'
      }}
    >
      {isInWishlist ? '❤️' : '🤍'}
    </button>
  );
};

export default WishlistButton;