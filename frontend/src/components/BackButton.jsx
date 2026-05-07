// frontend/src/components/BackButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BackButton = ({ fallbackPath = '/' }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button onClick={goBack} className="back-button">
      ← {t('back')}
    </button>
  );
};

export default BackButton;