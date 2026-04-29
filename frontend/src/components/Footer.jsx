import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>🎫 SmartEvent</h4>
          <p>Your gateway to the best events and experiences.</p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>
            Discover, book, and enjoy amazing events
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/bookings">My Bookings</Link>
          <Link to="/tickets">My Tickets</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/contact">Support</Link>
        </div>
        
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>📞 +91 98765 43210</p>
          <p>📧 support@smartevent.com</p>
          <p>💬 WhatsApp: +91 98765 43210</p>
        </div>
        
        <div className="footer-section">
          <h4>Follow Us</h4>
          <p>📷 Instagram</p>
          <p>🐦 Twitter</p>
          <p>📘 Facebook</p>
          <p>💼 LinkedIn</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 SmartEvent. All rights reserved. | Made with ❤️ for event lovers</p>
      </div>
    </footer>
  );
};

export default Footer;