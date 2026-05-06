import React, { useState, useEffect, useRef } from 'react';

const SeatAvailability = ({ eventId, initialAvailable, totalTickets }) => {
  const [available, setAvailable] = useState(initialAvailable);
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState('available');
  const wsRef = useRef(null);

  useEffect(() => {
    setAvailable(initialAvailable);
    updateStats(initialAvailable);
    connectWebSocket();
    
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [eventId, initialAvailable]);

  const updateStats = (availableTickets) => {
    const percent = (availableTickets / totalTickets) * 100;
    setPercentage(percent);
    
    if (availableTickets === 0) {
      setStatus('sold_out');
    } else if (availableTickets < totalTickets * 0.2) {
      setStatus('low');
    } else {
      setStatus('available');
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}&event_id=${eventId}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'availability_update') {
          setAvailable(data.available_tickets);
          updateStats(data.available_tickets);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'sold_out':
        return { text: 'Sold Out', color: '#dc2626', icon: '❌' };
      case 'low':
        return { text: 'Only Few Left!', color: '#f59e0b', icon: '⚡' };
      default:
        return { text: 'Available', color: '#10b981', icon: '✅' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🎟️</span>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Available Tickets</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {available} / {totalTickets}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            background: statusInfo.color + '20',
            color: statusInfo.color,
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {statusInfo.icon} {statusInfo.text}
          </span>
        </div>
      </div>
      
      <div style={{
        background: '#e2e8f0',
        borderRadius: '10px',
        height: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          background: status === 'low' ? '#f59e0b' : status === 'sold_out' ? '#dc2626' : '#10b981',
          height: '100%',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      {status === 'low' && (
        <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>
          ⚡ Hurry! Only {available} tickets left!
        </p>
      )}
    </div>
  );
};

export default SeatAvailability;