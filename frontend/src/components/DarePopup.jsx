import React from 'react';
import '../styles/darePopup.css';

function DarePopup({ dare, onComplete }) {
  return (
    <div className="dare-overlay">
      <div className="dare-popup">
        <h2>⚠️ Wrong Guess!</h2>
        <p className="dare-intro">Here's your dare:</p>

        <div className="dare-content">
          <p className="dare-text">{dare?.text}</p>
        </div>

        <p className="dare-note">
          Complete this dare before the game continues. Your role has been swapped!
        </p>

        <button className="primary" onClick={onComplete} style={{ width: '100%', padding: '1rem' }}>
          ✓ Done with Dare
        </button>
      </div>
    </div>
  );
}

export default DarePopup;
