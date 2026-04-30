// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getPlatformStats, getDailySales, getPopularEvents } from '../../services/api';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await getPlatformStats();
      console.log('Platform Stats Response:', statsRes.data);
      
      // Handle different response structures
      let platformData = statsRes.data;
      
      // If data is nested in 'data' property
      if (statsRes.data && statsRes.data.data) {
        platformData = statsRes.data.data;
      }
      
      setStats(platformData);
      
      // Fetch daily sales
      try {
        const salesRes = await getDailySales(7);
        console.log('Daily Sales Response:', salesRes.data);
        setDailySales(Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data.data || []));
      } catch (err) {
        console.error('Failed to fetch daily sales:', err);
        setDailySales([]);
      }
      
      // Fetch popular events
      try {
        const popularRes = await getPopularEvents(5);
        console.log('Popular Events Response:', popularRes.data);
        setPopularEvents(Array.isArray(popularRes.data) ? popularRes.data : (popularRes.data.data || []));
      } catch (err) {
        console.error('Failed to fetch popular events:', err);
        setPopularEvents([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Safely get nested values
  const getTotalUsers = () => {
    if (!stats) return 0;
    // Check for nested structure
    if (stats.users?.total) return stats.users.total;
    if (stats.total_users) return stats.total_users;
    return 0;
  };

  const getOrganizersCount = () => {
    if (!stats) return 0;
    if (stats.users?.organizers) return stats.users.organizers;
    if (stats.total_organizers) return stats.total_organizers;
    return 0;
  };

  const getAdminsCount = () => {
    if (!stats) return 0;
    if (stats.users?.admins) return stats.users.admins;
    if (stats.total_admins) return stats.total_admins;
    return 0;
  };

  const getTotalEvents = () => {
    if (!stats) return 0;
    if (stats.events?.total) return stats.events.total;
    if (stats.total_events) return stats.total_events;
    return 0;
  };

  const getActiveEvents = () => {
    if (!stats) return 0;
    if (stats.events?.active) return stats.events.active;
    if (stats.active_events) return stats.active_events;
    return 0;
  };

  const getTotalTicketsSold = () => {
    if (!stats) return 0;
    if (stats.bookings?.tickets_sold) return stats.bookings.tickets_sold;
    if (stats.total_tickets_sold) return stats.total_tickets_sold;
    return 0;
  };

  const getTotalRevenue = () => {
    if (!stats) return 0;
    if (stats.bookings?.revenue) return stats.bookings.revenue;
    if (stats.total_revenue) return stats.total_revenue;
    return 0;
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <BackButton />
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <h2 style={{ marginTop: '16px', color: '#dc2626' }}>Error Loading Dashboard</h2>
          <p style={{ marginTop: '8px', color: '#6b7280' }}>{error}</p>
          <button onClick={fetchData} className="btn-primary" style={{ marginTop: '20px' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Admin Dashboard</h1>

      {/* Debug Info - Remove after fixing */}
      <details style={{ marginBottom: '20px', background: '#f3f4f6', padding: '10px', borderRadius: '8px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug: API Response Data</summary>
        <pre style={{ marginTop: '10px', fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(stats, null, 2)}
        </pre>
      </details>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{getTotalUsers()}</h3>
          <p style={{ opacity: 0.9 }}>Total Users</p>
          <small>{getOrganizersCount()} Organizers, {getAdminsCount()} Admins</small>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{getTotalEvents()}</h3>
          <p style={{ opacity: 0.9 }}>Total Events</p>
          <small>{getActiveEvents()} Active</small>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎟️</div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{getTotalTicketsSold()}</h3>
          <p style={{ opacity: 0.9 }}>Tickets Sold</p>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatCurrency(getTotalRevenue())}</h3>
          <p style={{ opacity: 0.9 }}>Total Revenue</p>
        </div>
      </div>

      {/* Recent Sales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent Daily Sales</h2>
          {dailySales.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No sales data available</p>
          ) : (
            <div>
              {dailySales.slice().reverse().slice(0, 5).map((sale, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span>{sale.date}</span>
                  <span style={{ fontWeight: 'bold' }}>{sale.tickets_sold} tickets</span>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(sale.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Events */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Top Events</h2>
          {popularEvents.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No events data available</p>
          ) : (
            <div>
              {popularEvents.map((event, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontWeight: '500' }}>{idx + 1}. {event.title?.length > 30 ? event.title.substring(0, 30) + '...' : event.title}</span>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{event.tickets_sold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/admin/users" className="btn-primary">Manage Users</Link>
        <Link to="/admin/events" className="btn-primary">Manage Events</Link>
        <Link to="/admin/bookings" className="btn-primary">View Bookings</Link>
        <Link to="/admin/analytics" className="btn-primary">Full Analytics</Link>
        <Link to="/admin/scan" className="btn-secondary">Verify Tickets</Link>
      </div>

      <style>{`
        .stat-card {
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 