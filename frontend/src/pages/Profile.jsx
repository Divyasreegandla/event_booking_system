// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadProfilePicture, deleteProfilePicture, getBookingSummary } from '../services/api';
import { getMyPoints, getPointTransactions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [points, setPoints] = useState(null);
  const [pointTransactions, setPointTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
      if (user.profile_picture) {
        setProfilePictureUrl(user.profile_picture);
      }
      fetchSummary();
      fetchPoints();
    }
  }, [user]);

  const refreshUserData = async () => {
    try {
      const response = await getProfile();
      if (response.data && updateUser) {
        updateUser(response.data);
        if (response.data.profile_picture) {
          setProfilePictureUrl(response.data.profile_picture);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getBookingSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setSummary({
        total_bookings: 0,
        total_tickets_purchased: 0,
        total_amount_spent: 0,
        upcoming_events: 0,
        completed_events: 0
      });
    }
  };

  const fetchPoints = async () => {
    try {
      const [pointsRes, transactionsRes] = await Promise.all([
        getMyPoints().catch(() => ({ data: null })),
        getPointTransactions().catch(() => ({ data: [] }))
      ]);
      setPoints(pointsRes.data);
      setPointTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await updateProfile(formData);
      toast.success('Profile updated successfully');
      if (updateUser && response.data.user) {
        updateUser(response.data.user);
      }
      setEditing(false);
      await refreshUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadProfilePicture(formData);
      toast.success('Profile picture updated');
      await refreshUserData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (window.confirm('Are you sure you want to delete your profile picture?')) {
      try {
        await deleteProfilePicture();
        toast.success('Profile picture deleted');
        setProfilePictureUrl(null);
        await refreshUserData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete picture');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      let date;
      if (typeof dateString === 'string') {
        const normalizedDate = dateString.replace(' ', 'T');
        date = new Date(normalizedDate);
      } else {
        date = new Date(dateString);
      }
      if (isNaN(date.getTime())) return 'Not available';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Not available';
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <BackButton />
      
      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
        {/* Left Column - Profile Picture */}
        <div className="profile-card" style={{ 
          background: 'var(--card-bg, white)', 
          borderRadius: '20px', 
          padding: '24px', 
          textAlign: 'center', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color, #eef2ff)'
        }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            margin: '0 auto 16px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: profilePictureUrl 
              ? `url(${profilePictureUrl}) center/cover` 
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}>
            {!profilePictureUrl && <span style={{ fontSize: '48px' }}>👤</span>}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer', padding: '8px 16px' }}>
              {uploading ? 'Uploading...' : t('uploadPhoto')}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          
          {profilePictureUrl && (
            <button onClick={handleDeletePicture} className="btn-danger" style={{ width: '100%', padding: '8px' }}>
              {t('deletePhoto')}
            </button>
          )}
        </div>

        {/* Right Column - Profile Info */}
        <div className="profile-card" style={{ 
          background: 'var(--card-bg, white)', 
          borderRadius: '20px', 
          padding: '24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color, #eef2ff)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--text-primary, #1e293b)' }}>{t('profileInformation')}</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary">
                {t('editProfile')}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ color: 'var(--text-primary, #1e293b)' }}>{t('username')}</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ color: 'var(--text-primary, #1e293b)' }}>{t('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                  {t('cancel')}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong style={{ color: 'var(--text-primary, #1e293b)' }}>{t('username')}:</strong> <span style={{ color: 'var(--text-secondary, #64748b)' }}>{user.username}</span></p>
              <p><strong style={{ color: 'var(--text-primary, #1e293b)' }}>{t('email')}:</strong> <span style={{ color: 'var(--text-secondary, #64748b)' }}>{user.email}</span></p>
              <p><strong style={{ color: 'var(--text-primary, #1e293b)' }}>{t('role')}:</strong> <span style={{ color: 'var(--text-secondary, #64748b)' }}>{user.role}</span></p>
              <p><strong style={{ color: 'var(--text-primary, #1e293b)' }}>{t('memberSince')}:</strong> <span style={{ color: 'var(--text-secondary, #64748b)' }}>{formatDate(user.created_at)}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Summary */}
      <div className="profile-card" style={{ 
        background: 'var(--card-bg, white)', 
        borderRadius: '20px', 
        padding: '24px', 
        marginTop: '24px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color, #eef2ff)'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--text-primary, #1e293b)' }}>{t('myActivity')}</h2>
        
        {!summary ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '16px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>{summary.total_bookings || 0}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{t('totalBookings')}</div>
            </div>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '16px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>{summary.total_tickets_purchased || 0}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{t('ticketsPurchased')}</div>
            </div>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '16px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>₹{summary.total_amount_spent?.toLocaleString() || 0}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{t('totalSpent')}</div>
            </div>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '16px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{summary.upcoming_events || 0}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{t('upcomingEvents')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Reward Points Section */}
      {points && (
        <div className="profile-card" style={{ 
          background: 'var(--card-bg, white)', 
          borderRadius: '20px', 
          padding: '24px', 
          marginTop: '24px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color, #eef2ff)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-primary, #1e293b)' }}>⭐ {t('myPoints')}</h2>
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '40px',
              fontWeight: 'bold',
              fontSize: '22px',
            }}>
              {points?.total_points || 0} {t('points')}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '14px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#6366f1' }}>
                {points?.points_by_type?.BOOKING || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{t('pointsFromBookings')}</div>
            </div>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '14px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>
                {points?.points_by_type?.REVIEW || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{t('pointsFromReviews')}</div>
            </div>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '14px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f59e0b' }}>
                {points?.points_by_type?.REFERRAL || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{t('pointsFromReferrals')}</div>
            </div>
            <div className="stat-card-profile" style={{ textAlign: 'center', padding: '14px', background: 'var(--stat-bg, #f8fafc)', borderRadius: '12px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {points?.points_by_type?.SIGNUP || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{t('pointsFromSignup')}</div>
            </div>
          </div>
          
          {pointTransactions && pointTransactions.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary, #1e293b)' }}>{t('pointsHistory')}</h3>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {pointTransactions.slice(0, 10).map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border-color, #eef2ff)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', color: 'var(--text-primary, #1e293b)' }}>{tx.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary, #9ca3af)' }}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{
                      fontWeight: 'bold',
                      color: tx.transaction_type === 'CREDIT' ? '#10b981' : '#dc2626',
                    }}>
                      {tx.transaction_type === 'CREDIT' ? '+' : '-'}{tx.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .dark-mode {
          --card-bg: #1e1e2e;
          --border-color: #334155;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --stat-bg: #2d2d3d;
        }
        
        .profile-card {
          transition: all 0.3s ease;
        }
        
        .stat-card-profile {
          transition: transform 0.2s;
        }
        
        .stat-card-profile:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Profile;