import React, { useMemo } from 'react';
import '../styles/endScreen.css';

function EndScreen({ roomData, onBackHome }) {
  const sortedPlayers = useMemo(() => {
    const players = roomData?.players || [];
    return [...players].sort((a, b) => b.points - a.points);
  }, [roomData?.players]);

  const winner = sortedPlayers[0];

  return (
    <div className="container">
      <div className="end-screen">
        <h1>🎉 Game Over!</h1>

        {winner && (
          <div className="winner-card">
            <p className="winner-label">Congratulations!</p>
            <h2 className="winner-name">{winner.name}</h2>
            <p className="winner-points">{winner.points} Points</p>
          </div>
        )}

        <div className="final-standings">
          <h3>Final Standings</h3>
          <div className="standings-list">
            {sortedPlayers.map((player, index) => (
              <div key={player.uid} className="standing-item">
                <span className="rank">#{index + 1}</span>
                <div className="player-info">
                  <span className="name">{player.name}</span>
                  <span className="role">{player.role}</span>
                </div>
                <span className="points-badge">{player.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="game-summary">
          <h3>Game Summary</h3>
          <ul>
            <li>✓ Total Players: <strong>{roomData?.players?.length || 0}</strong></li>
            <li>✓ Roles Found: <strong>{roomData?.currentRoleIndex || 0}/6</strong></li>
            <li>✓ Duration: <strong>Full Game</strong></li>
          </ul>
        </div>

        <button
          className="primary"
          onClick={onBackHome}
          style={{ width: '100%', padding: '1rem' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default EndScreen;
