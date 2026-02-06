import React, { useState, useEffect } from 'react';
import '../styles/roleRevealScreen.css';

function RoleRevealScreen({ currentPlayer, onContinue }) {
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container">
      <div className="role-reveal-screen">
        <div className={`role-card ${isRevealing ? 'revealing' : 'revealed'}`}>
          {isRevealing ? (
            <div className="role-hidden">
              <p>Your Role is...</p>
            </div>
          ) : (
            <div className="role-content">
              <h1>{currentPlayer?.role}</h1>
              <p className="role-description">
                This is your secret role. Don't reveal it to others!
              </p>
            </div>
          )}
        </div>

        {!isRevealing && (
          <button className="primary" onClick={onContinue} style={{ width: '100%', padding: '1rem' }}>
            I've Memorized My Role
          </button>
        )}
      </div>
    </div>
  );
}

export default RoleRevealScreen;
