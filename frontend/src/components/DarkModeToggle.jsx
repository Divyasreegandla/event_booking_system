// frontend/src/components/DarkModeToggle.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="dark-mode-toggle"
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{isDark ? '☀️' : '🌙'}</span>
        <span>{isDark ? t('lightMode') : t('darkMode')}</span>
      </span>
    </button>
  );
};

export default DarkModeToggle;