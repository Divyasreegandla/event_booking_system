import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ fallbackPath = '/' }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <button onClick={goBack} className="back-button">
      ← Back
    </button>
  );
};

export default BackButton;