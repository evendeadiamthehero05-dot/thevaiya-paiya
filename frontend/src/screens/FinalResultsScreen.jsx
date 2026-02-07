import React, { useEffect, useState } from 'react';
import '../styles/finalResultsScreen.css';

function FinalResultsScreen({ roomData, playerId, onBackHome, onPlayAgain }) {
  const [confetti, setConfetti] = useState(true);
  
  // Find winner (highest points)
  const players = roomData?.players || [];
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const winner = sortedPlayers[0];
  const currentPlayerIsWinner = winner?.uid === playerId;

  // Calculate stats
  const totalGuesses = players.reduce((sum, p) => {
    const revealed = roomData?.players?.filter(pl => pl.hasRevealed)?.length || 0;
    return sum + revealed;
  }, 0);

  const accuracyPercent = players.length > 0 
    ? Math.round((sortedPlayers[0]?.points / (sortedPlayers[0]?.points + 10)) * 100)
    : 0;

  useEffect(() => {
    // Start confetti animation if user is winner
    if (currentPlayerIsWinner) {
      triggerConfetti();
    }
  }, [currentPlayerIsWinner]);

  const triggerConfetti = () => {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.delay = Math.random() * 0.5 + 's';
      confetti.style.animation = `fall ${2 + Math.random() * 1}s linear forwards`;
      document.querySelector('.final-results')?.appendChild(confetti);
    }
  };

  return (
    <div className="container">
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="final-results">
        {currentPlayerIsWinner && <div className="confetti-burst" />}

        <div className="results-header">
          {currentPlayerIsWinner ? (
            <>
              <h1 className="winner-title">🏆 YOU WIN! 🏆</h1>
              <p className="winner-subtitle">Legendary performance!</p>
            </>
          ) : (
            <>
              <h1 className="game-ended">Game Ended</h1>
              <p className="game-message">Here are the final results</p>
            </>
          )}
        </div>

        {/* Header Stats */}
        <div className="stats-summary">
          <div className="stat-card">
            <p className="stat-label">Total Guesses</p>
            <p className="stat-value">{totalGuesses}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg Accuracy</p>
            <p className="stat-value">{accuracyPercent}%</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Players</p>
            <p className="stat-value">{players.length}</p>
          </div>
        </div>

        {/* Rankings */}
        <div className="final-rankings">
          <h2>Final Rankings</h2>
          <div className="rankings-list">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.uid} 
                className={`ranking-item rank-${index + 1} ${player.uid === playerId ? 'current-player' : ''}`}
              >
                <div className="rank-badge">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                <div className="rank-info">
                  <span className="rank-name">
                    {player.name}
                    {player.uid === playerId && ' (You)'}
                  </span>
                  <span className="rank-role">{player.role}</span>
                </div>
                <div className="rank-points">
                  <span className="points-label">Points:</span>
                  <span className="points-value">{player.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Reveals */}
        <div className="role-reveals">
          <h2>All Roles Revealed</h2>
          <div className="roles-display">
            {players.map((player) => (
              <div key={player.uid} className="role-reveal-card">
                <p className="reveal-name">{player.name}</p>
                <p className="reveal-role">{player.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button 
            className="primary" 
            onClick={onPlayAgain}
            style={{ width: '100%', padding: '1rem', marginBottom: '0.5rem' }}
          >
            🔄 Play Again
          </button>
          <button 
            className="secondary" 
            onClick={onBackHome}
            style={{ width: '100%', padding: '1rem' }}
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinalResultsScreen;
