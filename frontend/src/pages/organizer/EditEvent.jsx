import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, updateEvent } from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Music',
    venue: '',
    city: '',
    event_date: '',
    price: '',
    total_tickets: '',
    image_url: ''
  });

  const categories = ['Music', 'Tech', 'Sports', 'Business', 'Comedy'];

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await getEvent(id);
      const event = response.data;
      setFormData({
        title: event.title,
        description: event.description || '',
        category: event.category,
        venue: event.venue,
        city: event.city,
        event_date: event.event_date.slice(0, 16),
        price: event.price,
        total_tickets: event.total_tickets,
        image_url: event.image_url || ''
      });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error('Failed to load event');
      navigate('/organizer/events');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.event_date) <= new Date()) {
      toast.error('Event date must be in the future');
      return;
    }

    setLoading(true);
    try {
      await updateEvent(id, formData);
      toast.success('Event updated successfully!');
      navigate('/organizer/events');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #eef2ff', marginTop: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Edit Event</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Update your event details</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="form-group">
              <label>Event Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input-field" />
            </div>
            
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="input-field" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label>Event Date & Time *</label>
                <input type="datetime-local" name="event_date" value={formData.event_date} onChange={handleChange} required className="input-field" />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Venue *</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} required className="input-field" />
              </div>
              
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1" className="input-field" />
              </div>
              
              <div className="form-group">
                <label>Total Tickets *</label>
                <input type="number" name="total_tickets" value={formData.total_tickets} onChange={handleChange} required min="1" className="input-field" />
              </div>
            </div>
            
            <div className="form-group">
              <label>Image URL (optional)</label>
              <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="input-field" />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={() => navigate('/organizer/events')} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;