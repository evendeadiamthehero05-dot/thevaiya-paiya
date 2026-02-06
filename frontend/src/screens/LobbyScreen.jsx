import React, { useState, useEffect } from 'react';
import '../styles/lobbyScreen.css';

function LobbyScreen({ roomId, roomData, playerId, currentPlayer, onStartGame }) {
  const [isHost, setIsHost] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    if (currentPlayer) {
      setIsHost(currentPlayer.isHost);
    }
    if (roomData?.players) {
      setPlayerCount(roomData.players.length);
    }
  }, [roomData, currentPlayer]);

  const isReady = playerCount >= 6 && playerCount <= 8;

  return (
    <div className="container">
      <div className="lobby-screen">
        <h2>Waiting Room</h2>

        <div className="room-info">
          <p className="room-code">Room Code: <strong>{roomId}</strong></p>
          <p className="player-count">
            Players: <strong>{playerCount}/8</strong>
          </p>
        </div>

        {playerCount < 6 && (
          <p className="warning">⏳ Waiting for at least 6 players to start...</p>
        )}

        <div className="players-list">
          <h3>Players</h3>
          {roomData?.players && roomData.players.length > 0 ? (
            <ul>
              {roomData.players.map((player) => (
                <li key={player.uid} className={player.uid === playerId ? 'current-player' : ''}>
                  <span className="player-name">{player.name}</span>
                  {player.isHost && <span className="host-badge">Host</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-players">No players yet</p>
          )}
        </div>

        {isHost && (
          <button
            className="primary"
            onClick={onStartGame}
            disabled={!isReady}
            style={{ width: '100%', padding: '1rem' }}
          >
            {isReady ? 'Start Game' : 'Waiting for players...'}
          </button>
        )}

        {!isHost && (
          <p className="waiting-text">Waiting for host to start the game...</p>
        )}
      </div>
    </div>
  );
}

export default LobbyScreen;
