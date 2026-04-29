import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ fallbackPath = '/' }) => {
  const navigate = useNavigate();

  const goBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      navigate(fallbackPath); // Go to home if no history
    }
  };

  return (
    <button onClick={goBack} className="back-button">
      ← Back
    </button>
  );
};

export default BackButton;