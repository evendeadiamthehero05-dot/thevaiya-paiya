import React from 'react';
import '../styles/loadingScreen.css';

function LoadingScreen({ isVisible = true, imageUrl = "https://preview.redd.it/guys-need-that-pradeep-ranganathan-meme-v0-310o4kxy27zf1.jpeg?width=320&format=pjpg&auto=webp&s=2226f198d8cbb2f9338dec16577e1a66eaac37bf", text = "Game aada ready'a da punda" }) {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-popup">
        <div className="loading-content">
          {imageUrl && (
            <div className="loading-image-container">
              <img src={imageUrl} alt="Loading" className="loading-image" />
            </div>
          )}

          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>

          <h2 className="loading-text">{text}</h2>

          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
