import React, { useState } from 'react';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending message (you can connect to actual email API later)
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
         <BackButton />
      <div className="contact-card">
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Get in Touch</h1>
        <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
          Have questions about an event or need help with a booking? We're here for you.
        </p>

        <div className="contact-info-grid">
          <div className="contact-method">
            <div className="icon">📧</div>
            <h4>Email Support</h4>
            <p>support@smartevent.com</p>
            <small>We reply within 24h</small>
          </div>
          <div className="contact-method">
            <div className="icon">📞</div>
            <h4>Phone</h4>
            <p>+91 98765 43210</p>
            <small>Mon-Sat, 10 AM - 7 PM</small>
          </div>
          <div className="contact-method">
            <div className="icon">💬</div>
            <h4>WhatsApp</h4>
            <p>+91 98765 43210</p>
            <small>Chat with us</small>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Send us a message</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
            <textarea
              name="message"
              rows="4"
              placeholder="How can we help you?"
              value={formData.message}
              onChange={handleChange}
              required
              className="input-field"
              style={{ resize: 'vertical' }}
            ></textarea>
            <button 
              type="submit" 
              disabled={sending} 
              className="btn-primary" 
              style={{ width: 'fit-content' }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;