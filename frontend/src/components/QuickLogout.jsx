// frontend/src/components/QuickLogout.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QuickLogout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <button
      onClick={handleLogout}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#dc2626',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '50px',
        cursor: 'pointer',
        zIndex: 9999,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        fontWeight: 'bold'
      }}
    >
      🚪 Quick Logout
    </button>
  );
};

export default QuickLogout;