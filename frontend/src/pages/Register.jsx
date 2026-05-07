// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [referralCode, setReferralCode] = useState('');
  const [showReferralField, setShowReferralField] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {}, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      alert(t('passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      const userData = { 
        username, 
        email, 
        password, 
        role,
        referral_code: showReferralField && referralCode ? referralCode : undefined
      };
      await register(userData);
      navigate('/login');
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>{t('createAccount') || 'Create Account'}</h2>
            <p>Sign up to start booking events</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>{t('username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
              />
            </div>

            <div className="input-group">
              <label>{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="input-group">
              <label>{t('role')}</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="USER">User - Browse and book events</option>
                <option value="ORGANIZER">Organizer - Create and manage events</option>
              </select>
            </div>

            <div className="referral-toggle">
              <button type="button" onClick={() => setShowReferralField(!showReferralField)}>
                {showReferralField ? '− Hide referral code' : '+ Have a referral code?'}
              </button>
            </div>

            {showReferralField && (
              <div className="input-group">
                <label>🎁 Referral Code <span>(Optional)</span></label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  maxLength="20"
                />
              </div>
            )}

            <div className="input-group">
              <label>{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="input-group">
              <label>{t('confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Creating account...' : (t('signUp') || 'Sign Up')}
            </button>
          </form>

          <div className="register-footer">
            <p>
              {t('haveAccount') || 'Already have an account?'} <Link to="/login">{t('signIn') || 'Sign in'}</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .register-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: transparent;
        }
        
        .register-container {
          width: 100%;
          max-width: 480px;
        }
        
        .register-card {
          background: var(--card-bg, white);
          border-radius: 24px;
          padding: 40px;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border-color, #eef2ff);
          animation: fadeInUp 0.4s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dark-mode .register-card {
          background: #1e1e2e;
          border-color: #334155;
        }
        
        .register-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .register-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
          margin-bottom: 8px;
        }
        
        .register-header p {
          color: var(--text-secondary, #64748b);
          font-size: 14px;
        }
        
        .input-group {
          margin-bottom: 20px;
        }
        
        .input-group label {
          display: block;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .input-group label span {
          font-size: 11px;
          color: #9ca3af;
          font-weight: normal;
        }
        
        .input-group input,
        .input-group select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.2s;
          background: var(--bg-primary, white);
          color: var(--text-primary, #1e293b);
        }
        
        .dark-mode .input-group input,
        .dark-mode .input-group select {
          background: #2d2d3d;
          border-color: #475569;
          color: #f1f5f9;
        }
        
        .input-group input:focus,
        .input-group select:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .referral-toggle {
          margin-bottom: 20px;
        }
        
        .referral-toggle button {
          background: none;
          border: none;
          color: #6366f1;
          cursor: pointer;
          font-size: 13px;
          padding: 0;
          text-decoration: underline;
        }
        
        .register-btn {
          width: 100%;
          background: var(--gradient-primary);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        
        .register-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .register-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color, #eef2ff);
          color: var(--text-secondary, #64748b);
        }
        
        .dark-mode .register-footer {
          border-top-color: #334155;
        }
        
        .register-footer a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
        }
        
        @media (max-width: 480px) {
          .register-card {
            padding: 24px;
          }
          
          .register-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;