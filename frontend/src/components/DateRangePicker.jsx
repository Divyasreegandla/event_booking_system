import React, { useState } from 'react';

const DateRangePicker = ({ onDateChange, startDate: initialStart, endDate: initialEnd }) => {
  const [startDate, setStartDate] = useState(initialStart || '');
  const [endDate, setEndDate] = useState(initialEnd || '');

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    if (onDateChange) {
      onDateChange(value, endDate);
    }
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    if (onDateChange) {
      onDateChange(startDate, value);
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    if (onDateChange) {
      onDateChange('', '');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#64748b' }}>From:</span>
        <input
          type="date"
          value={startDate}
          onChange={handleStartChange}
          style={{
            padding: '8px 12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white'
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: '#64748b' }}>To:</span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndChange}
          style={{
            padding: '8px 12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white'
          }}
        />
      </div>
      {(startDate || endDate) && (
        <button
          onClick={handleClear}
          style={{
            padding: '6px 12px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#6b7280'
          }}
        >
          Clear Dates
        </button>
      )}
    </div>
  );
};

export default DateRangePicker;