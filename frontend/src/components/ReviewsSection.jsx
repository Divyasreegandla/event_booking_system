import React, { useState, useEffect } from 'react';
import { getEventReviews, getEventRatingStats, createReview, updateReview, deleteReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

const ReviewsSection = ({ eventId, userHasAttended = false }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [eventId]);

  const fetchReviews = async () => {
    try {
      const response = await getEventReviews(eventId);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getEventRatingStats(eventId);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to review');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await updateReview(editingReview.id, rating, reviewText);
        toast.success('Review updated successfully');
      } else {
        await createReview(eventId, rating, reviewText);
        toast.success('Review submitted successfully');
      }
      
      setShowForm(false);
      setEditingReview(null);
      setRating(5);
      setReviewText('');
      fetchReviews();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.review_text || '');
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        toast.success('Review deleted');
        fetchReviews();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hasUserReviewed = reviews.some(r => r.user_id === user?.id);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading reviews...</div>;
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Reviews & Ratings</h3>
      
      {/* Rating Summary */}
      {stats && stats.total_reviews > 0 ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          padding: '20px', 
          background: '#f8fafc', 
          borderRadius: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#6366f1' }}>{stats.average_rating}</div>
            <StarRating rating={Math.round(stats.average_rating)} readonly size={20} />
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Based on {stats.total_reviews} reviews</div>
          </div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '30px', fontSize: '14px' }}>{star}★</span>
                <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '10px', height: '8px' }}>
                  <div style={{ 
                    width: `${(stats.rating_distribution?.[star] || 0) / stats.total_reviews * 100}%`, 
                    background: '#fbbf24', 
                    borderRadius: '10px', 
                    height: '8px' 
                  }}></div>
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{stats.rating_distribution?.[star] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', marginBottom: '24px' }}>
          <span style={{ fontSize: '48px' }}>⭐</span>
          <p style={{ marginTop: '12px', color: '#6b7280' }}>No reviews yet. Be the first to review!</p>
        </div>
      )}
      
      {/* FORCE SHOW BUTTON - Always show if logged in and haven't reviewed */}
      {user && !hasUserReviewed && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '24px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ✍️ Write a Review
        </button>
      )}
      
      {/* Review Form */}
      {showForm && (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #eef2ff'
        }}>
          <h4>{editingReview ? 'Edit Your Review' : 'Write Your Review'}</h4>
          
          <div style={{ margin: '16px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Your Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} size={28} />
          </div>
          
          <div style={{ margin: '16px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
              placeholder="Share your experience with this event..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingReview(null);
                setRating(5);
                setReviewText('');
              }}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reviews.map(review => (
          <div key={review.id} style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid #eef2ff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <strong>{review.username}</strong>
                  <StarRating rating={review.rating} readonly size={16} />
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  {formatDate(review.created_at)}
                  {review.updated_at && review.updated_at !== review.created_at && ' (edited)'}
                </div>
              </div>
              
              {user?.id === review.user_id && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditReview(review)}
                    style={{
                      padding: '4px 12px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    style={{
                      padding: '4px 12px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p style={{ marginTop: '12px', color: '#4b5563', lineHeight: '1.5' }}>
              {review.review_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;