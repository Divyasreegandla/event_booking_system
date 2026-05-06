import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadProfilePicture, deleteProfilePicture, getBookingSummary } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('User in Profile:', user);
      console.log('User created_at:', user.created_at);
      console.log('User profile_picture:', user.profile_picture);
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
      if (user.profile_picture) {
        setProfilePictureUrl(user.profile_picture);
      }
      fetchSummary();
    }
  }, [user]);

  // Function to refresh user data from backend
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
      // Refresh user data
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
      const response = await uploadProfilePicture(formData);
      console.log('Upload response:', response.data);
      toast.success('Profile picture updated');
      
      // Refresh user data from backend
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
        const response = await deleteProfilePicture();
        toast.success('Profile picture deleted');
        setProfilePictureUrl(null);
        // Refresh user data from backend
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
      
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Date parsing error:', e);
      return 'Not available';
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Left Column - Profile Picture */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{
            width: '150px',
            height: '150px',
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
            backgroundColor: '#6366f1'
          }}>
            {!profilePictureUrl && <span style={{ fontSize: '48px' }}>👤</span>}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
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
            <button onClick={handleDeletePicture} className="btn-danger" style={{ width: '100%' }}>
              Delete Photo
            </button>
          )}
        </div>

        {/* Right Column - Profile Info */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px' }}>Profile Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary">
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Email</label>
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
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Member since:</strong> {formatDate(user.created_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Summary */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginTop: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>My Activity Summary</h2>
        
        {!summary ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>{summary.total_bookings || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Bookings</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>{summary.total_tickets_purchased || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Tickets Purchased</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>₹{summary.total_amount_spent?.toLocaleString() || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Spent</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{summary.upcoming_events || 0}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Upcoming Events</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;