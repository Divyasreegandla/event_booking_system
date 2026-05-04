import React, { useState } from 'react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 24 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating || 0;

  return (
    <div style={{ display: 'flex', gap: '4px' }} onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          style={{
            fontSize: `${size}px`,
            cursor: readonly ? 'default' : 'pointer',
            color: star <= displayRating ? '#fbbf24' : '#e5e7eb',
            transition: 'transform 0.1s',
            display: 'inline-block'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;