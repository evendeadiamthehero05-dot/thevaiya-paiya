import React, { useState, useEffect } from 'react';
import '../styles/readyConfirmationScreen.css';

function ReadyConfirmationScreen({ roomData, playerId, onReady, onCancel }) {
  const [isReady, setIsReady] = useState(false);
  const readyCount = roomData?.players?.filter(p => p.isReady)?.length || 0;
  const totalPlayers = roomData?.players?.length || 0;

  const handleReady = () => {
    setIsReady(true);
    onReady();
  };

  const handleCancel = () => {
    setIsReady(false);
    onCancel();
  };

  const currentPlayer = roomData?.players?.find(p => p.uid === playerId);

  return (
    <div className="container">
      <div className="ready-confirmation">
        <div className="ready-header">
          <h1>🎮 Everyone Ready?</h1>
          <p className="subtitle">Get ready to start the game!</p>
        </div>

        <div className="ready-info">
          <p className="ready-count">
            {readyCount} of {totalPlayers} players ready
          </p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(readyCount / totalPlayers) * 100}%` }}
            />
          </div>
        </div>

        <div className="players-ready">
          <h3>Players</h3>
          <ul className="ready-players-list">
            {roomData?.players?.map((player) => (
              <li key={player.uid} className={`ready-player ${player.isReady ? 'ready' : 'not-ready'}`}>
                <span className="player-status">{player.isReady ? '✅' : '⏳'}</span>
                <span className="player-name">{player.name}</span>
                {player.uid === playerId && <span className="you-badge">(You)</span>}
              </li>
            ))}
          </ul>
        </div>

        {!isReady ? (
          <button 
            className="primary" 
            onClick={handleReady}
            style={{ width: '100%', padding: '1rem', marginTop: '2rem' }}
          >
            ✓ I'm Ready!
          </button>
        ) : (
          <div className="ready-waiting">
            <p className="waiting-text">Waiting for everyone to be ready...</p>
            <div className="spinner" />
            <button 
              className="secondary" 
              onClick={handleCancel}
              style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}
            >
              Not Ready
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReadyConfirmationScreen;
