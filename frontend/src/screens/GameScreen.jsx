import React, { useState, useEffect } from 'react';
import Timer from '../components/Timer';
import '../styles/gameScreen.css';

function GameScreen({
  roomData,
  playerId,
  currentPlayer,
  isSeeker,
  onAccusation,
  onGameEnd,
  onBackHome,
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [roleUpdated, setRoleUpdated] = useState(false);
  const [lastRole, setLastRole] = useState(currentPlayer?.role);

  // Check if game has ended
  useEffect(() => {
    if (roomData?.status === 'ended') {
      onGameEnd();
    }
  }, [roomData?.status, onGameEnd]);

  // Detect role change and trigger animation
  useEffect(() => {
    if (currentPlayer?.role && currentPlayer.role !== lastRole) {
      setRoleUpdated(true);
      setLastRole(currentPlayer.role);
      // Clear animation after 1 second
      const timer = setTimeout(() => setRoleUpdated(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer?.role, lastRole]);

  // Reset timer when seeker changes
  useEffect(() => {
    setTimerKey((k) => k + 1);
  }, [roomData?.currentSeekerId]);

  const handleAccusation = () => {
    if (selectedPlayer) {
      onAccusation(selectedPlayer);
      setSelectedPlayer(null);
    }
  };

  const handleTimerExpire = () => {
    // Auto-submit accusation when timer expires
    if (selectedPlayer) {
      handleAccusation();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Enter key submits accusation
      if (e.key === 'Enter' && isSeeker && selectedPlayer) {
        e.preventDefault();
        handleAccusation();
      }
      // Escape cancels selection
      if (e.key === 'Escape' && isSeeker) {
        e.preventDefault();
        setSelectedPlayer(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSeeker, selectedPlayer]);

  // Get next role to find (safe coercion)
  const ROLES = ['Girlfriend', 'Fling', 'Side Chick', 'Ex', "Ex's Ex", 'Lover'];
  let nextRole = null;
  if (roomData?.currentRoleIndex !== undefined && roomData?.currentRoleIndex !== null) {
    const idx = Number(roomData.currentRoleIndex);
    if (Number.isFinite(idx) && idx >= 0 && idx < ROLES.length) nextRole = ROLES[idx];
  }

  // Get revealed roles
  const revealedRoles = roomData?.players
    ?.filter((p) => p.hasRevealed)
    .map((p) => ({ role: p.role, name: p.name })) || [];

  // Get other players (not self, not revealed yet)
  const otherUnrevealedPlayers = roomData?.players?.filter(
    (p) => p.uid !== playerId && !p.hasRevealed
  ) || [];

  // Get current seeker
  const currentSeeker = roomData?.players?.find(
    (p) => p.uid === roomData.currentSeekerId
  );

  return (
    <div className="container">
      <div className="game-screen">
        <div className="game-header">
          <div className="game-status">
            {isSeeker ? (
              <>
                <h2>Find the {nextRole}</h2>
                <p className="seeker-badge">🔍 You are the Seeker!</p>
              </>
            ) : (
              <>
                <h2>Find the next role</h2>
                <p className="player-info">{currentSeeker?.name} is searching...</p>
              </>
            )}
            {currentPlayer && (
              <div className={`your-role-display ${roleUpdated ? 'updated' : ''}`}>
                <p className="role-label">Your Role:</p>
                <p className="role-value">{currentPlayer.role}</p>
              </div>
            )}
          </div>

          {isSeeker && (
            <Timer
              key={timerKey}
              duration={30}
              onExpire={handleTimerExpire}
            />
          )}
        </div>

        {revealedRoles.length > 0 && (
          <div className="revealed-roles">
            <h3>Revealed Roles</h3>
            <div className="roles-grid">
              {revealedRoles.map((item, idx) => (
                <div key={idx} className="revealed-role">
                  <span className="role-badge">{item.role}</span>
                  <span className="role-player">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Progression Tracker */}
        <div className="role-tracker">
          <h3>Game Progress</h3>
          <div className="tracker-roles">
            {ROLES.map((role, idx) => {
              const isFound = revealedRoles.some(r => r.role === role);
              const isCurrent = idx === roomData?.currentRoleIndex;
              return (
                <div 
                  key={role} 
                  className={`tracker-role ${isFound ? 'found' : ''} ${isCurrent ? 'current' : ''}`}
                  title={role}
                >
                  {isFound ? '✓' : idx === roomData?.currentRoleIndex ? '→' : ''}
                  <span>{role}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isSeeker && (
          <div className="accusation-panel">
            <h3>Make Your Accusation</h3>

            <div className="players-select">
              <label>Select a Player:</label>
              <div className="player-buttons">
                {otherUnrevealedPlayers.map((player) => (
                  <button
                    key={player.uid}
                    className={`player-button ${
                      selectedPlayer === player.uid ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedPlayer(player.uid)}
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason input removed — reason is optional now */}

            <button
              className="primary"
              onClick={handleAccusation}
              disabled={!selectedPlayer}
              style={{ width: '100%', padding: '1rem' }}
            >
              Make Accusation
            </button>
          </div>
        )}

        {!isSeeker && (
          <div className="waiting-panel">
            <div className="waiting-content">
              <p className="waiting-text">
                Waiting for {currentSeeker?.name} to make an accusation...
              </p>
              <div className="spinner" />
            </div>

            <div className="player-roster">
              <h4>Players in Game</h4>
              <div className="roster-list">
                {roomData?.players?.map((player) => (
                  <div key={player.uid} className="roster-item">
                    <span className="roster-name">{player.name}</span>
                    {player.uid === roomData.currentSeekerId && (
                      <span className="seeker-tag">🔍 Seeker</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="game-info">
          <h3>Current Points</h3>
          <div className="points-list">
            {roomData?.players
              ?.sort((a, b) => b.points - a.points)
              .map((player) => (
                <div key={player.uid} className="points-item">
                  <span className={`conn-dot ${player.connected ? 'online' : 'offline'}`} />
                  <span className="player-info-name">{player.name}</span>
                  <span className="points-value">{player.points} pts</span>
                </div>
              ))}
          </div>
        </div>

        <button
          className="exit-button"
          onClick={onBackHome}
          title="Exit the game and go back to home"
        >
          ✕ Exit
        </button>
      </div>
    </div>
  );
}

export default GameScreen;
