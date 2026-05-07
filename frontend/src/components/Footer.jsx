// frontend/src/components/Footer.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t, language } = useLanguage();
  const [, forceUpdate] = useState({});

  // Force re-render when language changes
  useEffect(() => {
    forceUpdate({});
  }, [language]);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>🎫 SmartEvent</h4>
          <p>{t('footerTagline') || 'Your gateway to the best events and experiences.'}</p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            {t('footerSubtitle') || 'Discover, book, and enjoy amazing events'}
          </p>
        </div>
        
        <div className="footer-section">
          <h4>{t('quickLinks') || 'Quick Links'}</h4>
          <Link to="/">{t('home')}</Link>
          <Link to="/bookings">{t('myBookings')}</Link>
          <Link to="/tickets">{t('myTickets')}</Link>
          <Link to="/notifications">{t('notifications') || 'Notifications'}</Link>
          <Link to="/contact">{t('support') || 'Support'}</Link>
        </div>
        
        <div className="footer-section">
          <h4>{t('contactUs') || 'Contact Us'}</h4>
          <p>📞 +91 98765 43210</p>
          <p>📧 support@smartevent.com</p>
          <p>💬 WhatsApp: +91 98765 43210</p>
        </div>
        
        <div className="footer-section">
          <h4>{t('followUs') || 'Follow Us'}</h4>
          <p>📷 Instagram</p>
          <p>🐦 Twitter</p>
          <p>📘 Facebook</p>
          <p>💼 LinkedIn</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 SmartEvent. {t('allRightsReserved') || 'All rights reserved.'} | {t('madeWith') || 'Made with ❤️ for event lovers'}</p>
      </div>
    </footer>
  );
};

export default Footer;