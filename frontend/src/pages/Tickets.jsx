// frontend/src/pages/Tickets.jsx
import React, { useState, useEffect } from 'react';
import { getMyTickets } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Tickets = () => {
  const { t, language } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchTickets();
    window.addEventListener('bookingCancelled', fetchTickets);
    return () => window.removeEventListener('bookingCancelled', fetchTickets);
  }, []);

  // Re-render when language changes
  useEffect(() => {
    setTickets([...tickets]);
  }, [language]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getMyTickets();
      
      let ticketsData = [];
      if (response.data && response.data.tickets) {
        ticketsData = response.data.tickets;
      } else if (Array.isArray(response.data)) {
        ticketsData = response.data;
      }
      
      setTickets(ticketsData);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
      setTickets([]);
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
    try {
      return new Date(dateString).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

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
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <BackButton />
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>{t('myTickets')}</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color, #e5e7eb)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '8px 20px',
            background: filter === 'active' ? '#2563eb' : 'transparent',
            color: filter === 'active' ? 'white' : 'var(--text-secondary, #6b7280)',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {t('activeTickets') || 'Active Tickets'} ({activeCount})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          style={{
            padding: '8px 20px',
            background: filter === 'cancelled' ? '#dc2626' : 'transparent',
            color: filter === 'cancelled' ? 'white' : 'var(--text-secondary, #6b7280)',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {t('cancelledTickets') || 'Cancelled Tickets'} ({cancelledCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 20px',
            background: filter === 'all' ? '#6b7280' : 'transparent',
            color: filter === 'all' ? 'white' : 'var(--text-secondary, #6b7280)',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {t('allTickets') || 'All Tickets'} ({tickets.length})
        </button>
      </div>

      {filteredTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--card-bg, white)', borderRadius: '16px' }}>
          <span style={{ fontSize: '48px' }}>🎟️</span>
          <p style={{ marginTop: '16px' }}>
            {filter === 'active' && (t('noActiveTickets') || 'No active tickets.')}
            {filter === 'cancelled' && (t('noCancelledTickets') || 'No cancelled tickets.')}
            {filter === 'all' && (t('noTickets') || 'No tickets yet.')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredTickets.map((ticket) => (
            <div 
              key={ticket.id} 
              style={{ 
                background: ticket.is_cancelled ? '#fef2f2' : 'var(--card-bg, white)', 
                borderRadius: '16px', 
                padding: '20px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                opacity: ticket.is_cancelled ? 0.8 : 1,
                position: 'relative',
                border: ticket.is_cancelled ? '1px solid #fecaca' : '1px solid var(--border-color, #eef2ff)'
              }}
            >
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
                  {t('cancelled')}
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
                color: ticket.is_cancelled ? '#6b7280' : 'var(--text-primary, #1f2937)'
              }}>
                {ticket.event_title || 'Event Ticket'}
              </h3>
              
              <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '14px', textAlign: 'center', marginBottom: '4px' }}>
                {ticket.venue || 'Venue TBA'}
              </p>
              <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '14px', textAlign: 'center', marginBottom: '12px' }}>
                {formatDate(ticket.event_date)}
              </p>
              <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '12px', textAlign: 'center', marginBottom: '4px' }}>
                {t('bookingReference') || 'Booking'}: {ticket.booking_reference}
              </p>
              <p style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '12px', textAlign: 'center', marginBottom: '12px', wordBreak: 'break-all' }}>
                {t('ticketCode') || 'Ticket'}: {ticket.ticket_code}
              </p>
              
              {!ticket.is_cancelled && (
                <>
                  <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    {ticket.qr_code ? (
                      <img 
                        src={ticket.qr_code} 
                        alt="QR Code" 
                        style={{ width: '150px', height: '150px', margin: '0 auto', cursor: 'pointer' }}
                        onClick={() => downloadTicket(ticket)}
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
                  <button onClick={() => downloadTicket(ticket)} className="btn-primary" style={{ width: '100%' }}>
                    {t('downloadTicket') || 'Download Ticket'}
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
                  {t('ticketCancelled') || 'This ticket has been cancelled and is no longer valid.'}
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