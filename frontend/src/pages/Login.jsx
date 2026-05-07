// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error handled in auth context
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container-centered">
      <div className="login-card-centered">
        <div className="login-icon-centered">🎫</div>
        
        <h2 className="login-title-centered">{t('welcomeBack') || 'Welcome Back'}</h2>
        <p className="login-subtitle-centered">Sign in to continue to your account</p>

        <form onSubmit={handleSubmit} className="login-form-centered">
          <div className="input-centered">
            <label>{t('email') || 'Email'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-centered">
            <label>{t('password') || 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-button-centered" disabled={loading}>
            {loading ? 'Signing in...' : (t('signIn') || 'Sign In')}
          </button>
        </form>

        <div className="login-footer-centered">
          <p>
            {t('noAccount') || "Don't have an account?"}{' '}
            <Link to="/register">{t('signUp') || 'Sign up'}</Link>
          </p>
        </div>

        <div className="demo-centered">
          <p className="demo-title-centered">🎯 Demo Accounts (Click to auto-fill)</p>
          <div className="demo-buttons-centered">
            <button type="button" className="demo-user-centered" onClick={() => fillDemo('user@smartevent.com', 'user123')}>
              👤 User
            </button>
            <button type="button" className="demo-organizer-centered" onClick={() => fillDemo('organizer@smartevent.com', 'organizer123')}>
              🎪 Organizer
            </button>
            <button type="button" className="demo-admin-centered" onClick={() => fillDemo('admin@smartevent.com', 'admin123')}>
              👑 Admin
            </button>
          </div>
          <div className="demo-creds-centered">
            <span>user@smartevent.com / user123</span>
            <span>organizer@smartevent.com / organizer123</span>
            <span>admin@smartevent.com / admin123</span>
          </div>
        </div>
      </div>

      <style>{`
        .login-container-centered {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          width: 100%;
        }
        
        .login-card-centered {
          max-width: 450px;
          width: 100%;
          background: var(--card-bg, rgba(255, 255, 255, 0.98));
          backdrop-filter: blur(10px);
          border-radius: 32px;
          padding: 48px 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(99, 102, 241, 0.15);
          animation: fadeIn 0.4s ease;
        }
        
        .dark-mode .login-card-centered {
          background: rgba(30, 30, 46, 0.98);
          border-color: rgba(99, 102, 241, 0.2);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .login-icon-centered {
          font-size: 56px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .login-title-centered {
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          color: var(--text-primary, #1e293b);
          margin-bottom: 8px;
        }
        
        .login-subtitle-centered {
          text-align: center;
          color: var(--text-secondary, #64748b);
          font-size: 14px;
          margin-bottom: 32px;
        }
        
        .login-form-centered {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .input-centered {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .input-centered label {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary, #1e293b);
        }
        
        .input-centered input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--border-color, #e2e8f0);
          border-radius: 16px;
          font-size: 15px;
          transition: all 0.2s;
          background: var(--bg-primary, white);
          color: var(--text-primary, #1e293b);
        }
        
        .dark-mode .input-centered input {
          background: #2d2d3d;
          border-color: #475569;
          color: #f1f5f9;
        }
        
        .input-centered input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .login-button-centered {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        
        .login-button-centered:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
        }
        
        .login-button-centered:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .login-footer-centered {
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color, #eef2ff);
        }
        
        .dark-mode .login-footer-centered {
          border-top-color: #334155;
        }
        
        .login-footer-centered a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
        }
        
        .login-footer-centered a:hover {
          text-decoration: underline;
        }
        
        .demo-centered {
          margin-top: 24px;
          padding: 16px;
          background: var(--bg-secondary, #f8fafc);
          border-radius: 20px;
          border: 1px solid var(--border-color, #eef2ff);
        }
        
        .dark-mode .demo-centered {
          background: #2d2d3d;
          border-color: #475569;
        }
        
        .demo-title-centered {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-secondary, #64748b);
          text-align: center;
        }
        
        .demo-buttons-centered {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }
        
        .demo-user-centered {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          transition: all 0.2s;
        }
        
        .demo-organizer-centered {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          transition: all 0.2s;
        }
        
        .demo-admin-centered {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          transition: all 0.2s;
        }
        
        .demo-user-centered:hover,
        .demo-organizer-centered:hover,
        .demo-admin-centered:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .demo-creds-centered {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 10px;
          color: var(--text-secondary, #64748b);
          text-align: center;
          padding-top: 8px;
          border-top: 1px solid var(--border-color, #eef2ff);
        }
        
        .dark-mode .demo-creds-centered {
          border-top-color: #475569;
        }
        
        @media (max-width: 480px) {
          .login-card-centered {
            padding: 32px 24px;
          }
          
          .login-title-centered {
            font-size: 24px;
          }
          
          .demo-buttons-centered {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;