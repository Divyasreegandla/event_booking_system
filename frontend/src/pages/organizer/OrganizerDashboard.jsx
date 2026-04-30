import React, { useState, useEffect } from 'react';
import { getOrganizerDashboardStats, getOrganizerEventStats } from '../../services/api';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const OrganizerDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [eventStats, setEventStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [dashboardRes, eventsRes] = await Promise.all([
        getOrganizerDashboardStats(),
        getOrganizerEventStats()
      ]);
      setDashboardStats(dashboardRes.data);
      setEventStats(eventsRes.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Organizer Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.total_events || 0}</h3>
          <p style={{ color: '#6b7280' }}>Total Events</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎟️</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.total_tickets_sold || 0}</h3>
          <p style={{ color: '#6b7280' }}>Tickets Sold</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(dashboardStats?.total_revenue || 0)}</h3>
          <p style={{ color: '#6b7280' }}>Total Revenue</p>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.upcoming_events || 0}</h3>
          <p style={{ color: '#6b7280' }}>Upcoming Events</p>
        </div>
      </div>

      {/* Events by Status */}
      {dashboardStats?.events_by_status && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Events by Status</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div><span style={{ fontWeight: 'bold', color: '#10b981' }}>UPCOMING:</span> {dashboardStats.events_by_status.UPCOMING || 0}</div>
            <div><span style={{ fontWeight: 'bold', color: '#f59e0b' }}>ONGOING:</span> {dashboardStats.events_by_status.ONGOING || 0}</div>
            <div><span style={{ fontWeight: 'bold', color: '#6b7280' }}>COMPLETED:</span> {dashboardStats.events_by_status.COMPLETED || 0}</div>
            <div><span style={{ fontWeight: 'bold', color: '#ef4444' }}>CANCELLED:</span> {dashboardStats.events_by_status.CANCELLED || 0}</div>
          </div>
        </div>
      )}

      {/* Event Performance Table */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Event Performance</h2>
        {eventStats.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No events created yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Event</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Tickets Sold</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Remaining</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Revenue</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {eventStats.map(stat => (
                  <tr key={stat.event_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      <Link to={`/organizer/event/${stat.event_id}/bookings`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {stat.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(stat.event_date).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold' }}>{stat.tickets_sold}</td>
                    <td style={{ textAlign: 'center', padding: '12px', color: stat.remaining_tickets > 0 ? '#10b981' : '#ef4444' }}>{stat.remaining_tickets}</td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(stat.total_revenue)}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ 
                        background: stat.event_status === 'UPCOMING' ? '#d1fae5' : stat.event_status === 'ONGOING' ? '#fed7aa' : '#e5e7eb',
                        color: stat.event_status === 'UPCOMING' ? '#065f46' : stat.event_status === 'ONGOING' ? '#9a3412' : '#374151',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px'
                      }}>
                        {stat.event_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link to="/organizer/create-event" className="btn-primary">+ Create New Event</Link>
      </div>
    </div>
  );
};

export default OrganizerDashboard;