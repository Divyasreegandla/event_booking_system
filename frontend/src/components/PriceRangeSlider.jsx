import React, { useState, useEffect } from 'react';

const PriceRangeSlider = ({ minPrice = 0, maxPrice = 15000, onPriceChange }) => {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  useEffect(() => {
    if (onPriceChange) {
      onPriceChange(min, max);
    }
  }, [min, max]);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value);
    if (value <= max - 100) {
      setMin(value);
    }
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= min + 100) {
      setMax(value);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleReset = () => {
    setMin(minPrice);
    setMax(maxPrice);
    if (onPriceChange) {
      onPriceChange(minPrice, maxPrice);
    }
  };

  return (
    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
      <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>Price Range</h4>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Min</span>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1' }}>{formatPrice(min)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Max</span>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6366f1' }}>{formatPrice(max)}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={min}
          onChange={handleMinChange}
          style={{ flex: 1, height: '4px', borderRadius: '2px' }}
        />
        <span style={{ color: '#cbd5e1' }}>—</span>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={max}
          onChange={handleMaxChange}
          style={{ flex: 1, height: '4px', borderRadius: '2px' }}
        />
      </div>
      
      <button
        onClick={handleReset}
        style={{
          marginTop: '12px',
          padding: '4px 12px',
          background: 'transparent',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          color: '#64748b'
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default PriceRangeSlider;