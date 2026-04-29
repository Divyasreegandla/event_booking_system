import React, { useState, useEffect } from 'react';
import { getMyTickets } from '../services/api';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active', 'cancelled', 'all'

  useEffect(() => {
    fetchTickets();
    
    // Listen for booking cancellation events
    window.addEventListener('bookingCancelled', fetchTickets);
    return () => window.removeEventListener('bookingCancelled', fetchTickets);
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getMyTickets();
      console.log('Tickets response:', response.data);
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticket) => {
    if (ticket.qr_code) {
      const link = document.createElement('a');
      link.download = `ticket-${ticket.ticket_code}.png`;
      link.href = ticket.qr_code;
      link.click();
      toast.success('Ticket downloaded!');
    } else {
      toast.error('No QR code available');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter tickets based on selection
  const getFilteredTickets = () => {
    if (filter === 'active') {
      return tickets.filter(t => !t.is_cancelled);
    }
    if (filter === 'cancelled') {
      return tickets.filter(t => t.is_cancelled);
    }
    return tickets;
  };

  const filteredTickets = getFilteredTickets();
  const activeCount = tickets.filter(t => !t.is_cancelled).length;
  const cancelledCount = tickets.filter(t => t.is_cancelled).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>My Tickets</h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '8px 20px',
            background: filter === 'active' ? '#2563eb' : 'transparent',
            color: filter === 'active' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Active Tickets ({activeCount})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          style={{
            padding: '8px 20px',
            background: filter === 'cancelled' ? '#dc2626' : 'transparent',
            color: filter === 'cancelled' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Cancelled Tickets ({cancelledCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 20px',
            background: filter === 'all' ? '#6b7280' : 'transparent',
            color: filter === 'all' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          All Tickets ({tickets.length})
        </button>
      </div>

      {filteredTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <span style={{ fontSize: '48px' }}>🎟️</span>
          <p style={{ marginTop: '16px' }}>
            {filter === 'active' && 'No active tickets.'}
            {filter === 'cancelled' && 'No cancelled tickets.'}
            {filter === 'all' && 'No tickets yet.'}
          </p>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            {filter === 'active' && 'Book events to get your digital tickets here!'}
            {filter === 'cancelled' && 'Cancelled bookings will appear here.'}
            {filter === 'all' && 'Book events to get your digital tickets here!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              style={{ 
                background: ticket.is_cancelled ? '#fef2f2' : 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                opacity: ticket.is_cancelled ? 0.8 : 1,
                position: 'relative',
                border: ticket.is_cancelled ? '1px solid #fecaca' : 'none'
              }}
            >
              {/* Cancelled Badge */}
              {ticket.is_cancelled && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#dc2626',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  CANCELLED
                </div>
              )}
              
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px', opacity: ticket.is_cancelled ? 0.5 : 1 }}>
                {ticket.is_cancelled ? '🚫' : '🎫'}
              </div>
              
              <h3 style={{ 
                fontSize: '18px', 
                textAlign: 'center', 
                marginBottom: '12px',
                textDecoration: ticket.is_cancelled ? 'line-through' : 'none',
                color: ticket.is_cancelled ? '#6b7280' : '#1f2937'
              }}>
                {ticket.event_title || 'Event Ticket'}
              </h3>
              
              <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '4px' }}>
                {ticket.venue}
              </p>
              <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>
                {formatDate(ticket.event_date)}
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginBottom: '4px' }}>
                Booking: {ticket.booking_reference}
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', marginBottom: '12px', wordBreak: 'break-all' }}>
                Ticket: {ticket.ticket_code}
              </p>
              
              {!ticket.is_cancelled && (
                <>
                  <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    {ticket.qr_code ? (
                      <img 
                        src={ticket.qr_code} 
                        alt="QR Code" 
                        style={{ width: '150px', height: '150px', margin: '0 auto' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '150px', 
                        height: '150px', 
                        margin: '0 auto', 
                        background: '#f3f4f6', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '8px'
                      }}>
                        <span style={{ color: '#9ca3af' }}>No QR</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => downloadTicket(ticket)}
                    style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Download Ticket
                  </button>
                </>
              )}
              
              {ticket.is_cancelled && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '16px', 
                  padding: '12px',
                  background: '#fee2e2',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '14px'
                }}>
                  This ticket has been cancelled and is no longer valid.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;