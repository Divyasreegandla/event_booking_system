import React, { useState } from 'react';

const SortDropdown = ({ onSortChange, currentSort = 'date' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(currentSort);

  const sortOptions = [
    { value: 'date', label: '📅 Date (Earliest)', icon: '📅' },
    { value: 'price_low', label: '💰 Price (Low to High)', icon: '💰' },
    { value: 'price_high', label: '💰 Price (High to Low)', icon: '💸' },
    { value: 'popularity', label: '🔥 Popularity', icon: '🔥' }
  ];

  const handleSelect = (value) => {
    setSelectedSort(value);
    setIsOpen(false);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  const getCurrentLabel = () => {
    const option = sortOptions.find(opt => opt.value === selectedSort);
    return option ? option.label : 'Sort by';
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 16px',
          background: 'white',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
      >
        <span>🔽</span> {getCurrentLabel()}
      </button>
      
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              zIndex: 999,
              minWidth: '220px',
              overflow: 'hidden'
            }}
          >
            {sortOptions.map(option => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: selectedSort === option.value ? '#eef2ff' : 'white',
                  fontWeight: selectedSort === option.value ? '600' : '400'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedSort === option.value ? '#eef2ff' : 'white'}
              >
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SortDropdown;