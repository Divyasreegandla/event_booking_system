// frontend/src/components/RecommendationsSection.jsx
import React, { useState, useEffect } from 'react';
import { getPersonalizedRecommendations, getTrendingEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import EventCard from './EventCard';

const RecommendationsSection = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage(); // Add language to trigger re-render
  const [personalized, setPersonalized] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personalized');

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  // Re-fetch when language changes (to update any translated content)
  useEffect(() => {
    fetchRecommendations();
  }, [language]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      if (user) {
        const personalizedRes = await getPersonalizedRecommendations().catch(() => ({ data: { recommendations: [] } }));
        setPersonalized(personalizedRes.data?.recommendations || []);
      }
      const trendingRes = await getTrendingEvents().catch(() => ({ data: { trending: [] } }));
      setTrending(trendingRes.data?.trending || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const displayEvents = activeTab === 'personalized' ? personalized : trending;
  const hasEvents = displayEvents.length > 0;

  return (
    <div style={{ margin: '2rem 0' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '2px solid #eef2ff' }}>
        {user && (
          <button
            onClick={() => setActiveTab('personalized')}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'personalized' ? 'bold' : 'normal',
              color: activeTab === 'personalized' ? '#6366f1' : '#6b7280',
              borderBottom: activeTab === 'personalized' ? '2px solid #6366f1' : 'none'
            }}
          >
            ⭐ {t('recommendedForYou')}
          </button>
        )}
        <button
          onClick={() => setActiveTab('trending')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'trending' ? 'bold' : 'normal',
            color: activeTab === 'trending' ? '#6366f1' : '#6b7280',
            borderBottom: activeTab === 'trending' ? '2px solid #6366f1' : 'none'
          }}
        >
          🔥 {t('trendingEvents')}
        </button>
      </div>

      {!hasEvents ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px' }}>
          <span style={{ fontSize: '48px' }}>🎯</span>
          <p style={{ marginTop: '12px', color: '#6b7280' }}>
            {activeTab === 'personalized' 
              ? 'No personalized recommendations yet. Browse and book events to get recommendations!'
              : 'No trending events at the moment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {displayEvents.slice(0, 4).map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;