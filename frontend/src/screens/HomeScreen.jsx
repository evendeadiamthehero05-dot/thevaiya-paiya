import React, { useState } from 'react';
import '../styles/homeScreen.css';

function HomeScreen({ onCreateRoom, onJoinRoom }) {
  const [mode, setMode] = useState(null); // null | create | join
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateClick = () => {
    setMode('create');
  };

  const handleJoinClick = () => {
    setMode('join');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName);
      setPlayerName('');
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode, playerName);
      setPlayerName('');
      setRoomCode('');
    }
  };

  if (!mode) {
    return (
      <div className="container">
        <div className="home-screen">
          <h1>Thevaiya paiya?</h1>
          <p className="subtitle">🎭 Yelndhirichu ukkaaravey vakkila, idhula ... see more</p>

          <div className="button-group">
            <button className="primary" onClick={handleCreateClick}>
              Create Room
            </button>
            <button className="secondary" onClick={handleJoinClick}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="container">
        <div className="home-screen">
          <h2>Create a Room</h2>
          <p>Enter your name to start a new game</p>

          <form onSubmit={handleCreateSubmit} className="form">
            <input
              type="text"
              placeholder="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength="20"
              autoFocus
            />
            <button type="submit" className="primary" disabled={!playerName.trim()}>
              Create
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setMode(null);
                setPlayerName('');
              }}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="container">
        <div className="home-screen">
          <h2>Join a Room</h2>
          <p>Enter room code and your name</p>

          <form onSubmit={handleJoinSubmit} className="form">
            <input
              type="text"
              placeholder="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength="6"
              autoFocus
            />
            <input
              type="text"
              placeholder="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength="20"
            />
            <button
              type="submit"
              className="primary"
              disabled={!playerName.trim() || !roomCode.trim()}
            >
              Join
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setMode(null);
                setPlayerName('');
                setRoomCode('');
              }}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default HomeScreen;
