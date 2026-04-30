import React, { useState, useEffect } from 'react';
import { getPlatformStats, getDailySales, getMonthlyTrends, getPopularEvents } from '../../services/api';
import BackButton from '../../components/BackButton';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesDays, setSalesDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [salesDays]);

  const fetchData = async () => {
    try {
      const [statsRes, salesRes, trendsRes, popularRes] = await Promise.all([
        getPlatformStats(),
        getDailySales(salesDays),
        getMonthlyTrends(12),
        getPopularEvents(10)
      ]);
      setStats(statsRes.data);
      setDailySales(salesRes.data);
      setMonthlyTrends(trendsRes.data);
      setPopularEvents(popularRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
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
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Platform Analytics</h1>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{stats?.total_users || 0}</h3>
          <p style={{ color: '#6b7280' }}>Total Users</p>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{stats?.total_events || 0}</h3>
          <p style={{ color: '#6b7280' }}>Total Events</p>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{stats?.total_tickets_sold || 0}</h3>
          <p style={{ color: '#6b7280' }}>Tickets Sold</p>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(stats?.total_revenue || 0)}</h3>
          <p style={{ color: '#6b7280' }}>Total Revenue</p>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '18px' }}>Daily Sales (Last {salesDays} Days)</h2>
          <select value={salesDays} onChange={(e) => setSalesDays(Number(e.target.value))} className="input-field" style={{ width: 'auto', padding: '6px 12px' }}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        {dailySales.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No sales data available</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '600px' }}>
              {dailySales.map((sale, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>{sale.date}</span>
                    <span>{sale.tickets_sold} tickets</span>
                    <span>{formatCurrency(sale.revenue)}</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '30px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min(100, (sale.revenue / Math.max(...dailySales.map(s => s.revenue))) * 100)}%`, 
                      background: 'linear-gradient(90deg, #2563eb, #7c3aed)', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      paddingLeft: '8px', 
                      color: 'white', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(sale.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Trends */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Monthly Trends</h2>
        {monthlyTrends.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No monthly data available</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Month</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Bookings</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Tickets Sold</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Revenue</th>
                 </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((trend, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{trend.month}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{trend.bookings_count || 0}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{trend.tickets_sold || 0}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(trend.revenue || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popular Events */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Top 10 Events by Sales</h2>
        {popularEvents.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No event data available</p>
        ) : (
          <div>
            {popularEvents.map((event, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold', color: '#2563eb', width: '30px' }}>#{idx + 1}</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>{event.title}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{event.category}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>{event.tickets_sold} tickets sold</div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(event.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;