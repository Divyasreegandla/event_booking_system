// frontend/src/components/ShareButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const ShareButton = ({ eventId, eventTitle, eventImage, size = 'normal' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const { t } = useLanguage();

  const getShareUrl = () => {
    return `${window.location.origin}/events/${eventId}`;
  };

  const updatePosition = () => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.right + window.scrollX - 200,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareWhatsApp = (e) => {
    e.stopPropagation();
    const url = getShareUrl();
    const text = `🎫 Check out this amazing event: ${eventTitle}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleShareFacebook = (e) => {
    e.stopPropagation();
    const url = getShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleShareTwitter = (e) => {
    e.stopPropagation();
    const url = getShareUrl();
    const text = `🎫 Check out ${eventTitle} on SmartEvent!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleShareEmail = (e) => {
    e.stopPropagation();
    const url = getShareUrl();
    const subject = `Check out this event: ${eventTitle}`;
    const body = `I found this amazing event on SmartEvent!\n\n${eventTitle}\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const closeDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const shareOptions = (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
        zIndex: 10000,
        minWidth: '220px',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #eef2ff', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
        Share {eventTitle.length > 30 ? eventTitle.substring(0, 30) + '...' : eventTitle}
      </div>
      
      <button
        onClick={handleCopyLink}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 16px',
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        <span style={{ fontSize: '20px' }}>🔗</span>
        Copy Link
      </button>
      
      <button
        onClick={handleShareWhatsApp}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 16px',
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        <span style={{ fontSize: '20px' }}>💬</span>
        WhatsApp
      </button>

      <button
        onClick={handleShareFacebook}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 16px',
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        <span style={{ fontSize: '20px' }}>📘</span>
        Facebook
      </button>

      <button
        onClick={handleShareTwitter}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 16px',
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        <span style={{ fontSize: '20px' }}>🐦</span>
        Twitter
      </button>

      <button
        onClick={handleShareEmail}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 16px',
          background: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        <span style={{ fontSize: '20px' }}>📧</span>
        Email
      </button>
    </div>
  );

  // Small variant for event cards
  if (size === 'small') {
    return (
      <>
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            color: '#6b7280'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.color = '#6366f1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <span>📤</span>
        </button>

        {isOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: 'transparent',
              }}
              onClick={closeDropdown}
            />
            {createPortal(shareOptions, document.body)}
          </>
        )}
      </>
    );
  }

  // Normal size for event details page
  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          borderRadius: '40px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s',
        }}
      >
        <span>📤</span> {t('share')}
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'transparent',
            }}
            onClick={closeDropdown}
          />
          {createPortal(shareOptions, document.body)}
        </>
      )}
    </>
  );
};

export default ShareButton;