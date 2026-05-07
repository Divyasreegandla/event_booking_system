// frontend/src/pages/Referral.jsx
import React, { useState, useEffect } from 'react';
import { getReferralCode, generateReferralCode, getReferralStats, getMyReferrals } from '../services/api';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import { useLanguage } from '../context/LanguageContext';

const Referral = () => {
  const { t, language } = useLanguage(); // Changed from translationService
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const [codeRes, statsRes, referralsRes] = await Promise.all([
        getReferralCode().catch(() => ({ data: null })),
        getReferralStats().catch(() => ({ data: null })),
        getMyReferrals().catch(() => ({ data: { referrals: [] } }))
      ]);
      
      setReferralCode(codeRes.data);
      setStats(statsRes.data);
      setReferrals(referralsRes.data?.referrals || []);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const response = await generateReferralCode();
      setReferralCode(response.data);
      toast.success(t('codeGenerated') || 'Referral code generated!');
      fetchReferralData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('somethingWrong'));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralCode?.code) return;
    try {
      await navigator.clipboard.writeText(referralCode.code);
      toast.success(t('codeCopied'));
    } catch (err) {
      toast.error(t('somethingWrong'));
    }
  };

  const handleShareWhatsApp = () => {
    if (!referralCode?.code) return;
    const text = `🎫 Join me on SmartEvent! Use my referral code: ${referralCode.code} to get started and earn rewards!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    if (!referralCode?.code) return;
    const subject = "Join me on SmartEvent";
    const body = `Hi! I'm using SmartEvent to book amazing events. Use my referral code: ${referralCode.code} when you sign up!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '48px' }}>🎁</span>
          <h1 style={{ fontSize: '28px', marginTop: '12px' }}>{t('referralProgram')}</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Invite friends and earn 50 points for each successful referral!
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '24px',
          color: 'white',
          textAlign: 'center',
        }}>
          <h3 style={{ marginBottom: '16px', opacity: 0.9 }}>{t('yourReferralCode')}</h3>
          
          {referralCode?.code ? (
            <>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                display: 'inline-block',
                minWidth: '250px',
              }}>
                <span style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  color: '#6366f1',
                  fontFamily: 'monospace',
                }}>
                  {referralCode.code}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopyCode}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  📋 {t('copyCode')}
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  style={{
                    padding: '10px 20px',
                    background: '#25D366',
                    border: 'none',
                    borderRadius: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  💬 {t('shareViaWhatsApp')}
                </button>
                <button
                  onClick={handleShareEmail}
                  style={{
                    padding: '10px 20px',
                    background: '#ea4335',
                    border: 'none',
                    borderRadius: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  📧 Email
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleGenerateCode}
              disabled={generating}
              style={{
                padding: '12px 24px',
                background: 'white',
                border: 'none',
                borderRadius: '40px',
                color: '#6366f1',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {generating ? (t('generating') || 'Generating...') : (t('generateCode') || 'Generate Code')}
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6366f1' }}>
              {stats?.total_referrals || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {t('totalReferrals')}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {stats?.completed_referrals || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {t('completedReferrals')}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats?.points_earned || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {t('pointsEarnedFromReferrals')}
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginBottom: '20px' }}>{t('howItWorks')}</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#eef2ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '24px',
              }}>📤</div>
              <p><strong>{t('referralStep1')}</strong></p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#eef2ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '24px',
              }}>📝</div>
              <p><strong>{t('referralStep2')}</strong></p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#eef2ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '24px',
              }}>🎫</div>
              <p><strong>{t('referralStep3')}</strong></p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#eef2ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '24px',
              }}>⭐</div>
              <p><strong>{t('referralStep4')}</strong></p>
            </div>
          </div>
        </div>

        {referrals.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ marginBottom: '16px' }}>Your Referrals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {referrals.map(ref => (
                <div
                  key={ref.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      {ref.referred_user_name || `User ${ref.referred_user_id}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(ref.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: ref.status === 'completed' ? '#d1fae5' : '#fef3c7',
                    color: ref.status === 'completed' ? '#065f46' : '#92400e',
                  }}>
                    {ref.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referral;