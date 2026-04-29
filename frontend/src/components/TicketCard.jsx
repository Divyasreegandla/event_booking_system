import React from 'react';
import QRCode from 'qrcode.react';

const TicketCard = ({ ticket, onDownload }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ticket-card" style={{ position: 'relative', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4>{ticket.event_title}</h4>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            {formatDate(ticket.event_date)} | {ticket.venue}
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            Ticket: {ticket.ticket_code}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          {ticket.qr_code && (
            <img 
              src={ticket.qr_code} 
              alt="QR" 
              style={{ width: '60px', height: '60px', cursor: 'pointer' }}
              onClick={() => onDownload(ticket)}
            />
          )}
        </div>
      </div>
      {ticket.is_used && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#10b981',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          USED
        </div>
      )}
    </div>
  );
};

export default TicketCard;