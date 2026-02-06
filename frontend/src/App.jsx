import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import RoleRevealScreen from './screens/RoleRevealScreen';
import GameScreen from './screens/GameScreen';
import DarePopup from './components/DarePopup';
import EndScreen from './screens/EndScreen';
import './styles/app.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  // State Management
  const [screen, setScreen] = useState('home'); // home | lobby | roleReveal | game | end
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [dare, setDare] = useState(null);
  const [error, setError] = useState(null);

  // Socket connection
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('ROOM_STATE_UPDATE', (data) => {
      setRoomData(data);
    });

    socketRef.current.on('ACCUSATION_RESULT', (result) => {
      if (!result.isCorrect) {
        setDare(result.dare);
      }
    });

    socketRef.current.on('ERROR', (data) => {
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Update current player when roomData changes
  useEffect(() => {
    if (roomData && playerId) {
      const player = roomData.players?.find((p) => p.uid === playerId);
      setCurrentPlayer(player);
    }
  }, [roomData, playerId]);

  // Handle create room
  const handleCreateRoom = async (name) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });

      const data = await response.json();
      setRoomId(data.roomId);
      setPlayerId(data.player?.uid || null);
      setPlayerName(name);

      // Fetch room data
      const roomResponse = await fetch(`${BACKEND_URL}/api/rooms/${data.roomId}`);
      const roomData = await roomResponse.json();
      setRoomData(roomData);

      // Join room via socket
      socketRef.current.emit('JOIN_GAME_ROOM', {
        roomId: data.roomId,
        playerId: data.player?.uid,
      });

      setScreen('lobby');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle join room
  const handleJoinRoom = async (code, name) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/rooms/${code.toUpperCase()}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName: name }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const data = await response.json();
      setRoomId(code.toUpperCase());
      setPlayerId(data.player.uid);
      setPlayerName(name);

      // Fetch room data
      const roomResponse = await fetch(
        `${BACKEND_URL}/api/rooms/${code.toUpperCase()}`
      );
      const roomData = await roomResponse.json();
      setRoomData(roomData);

      // Join room via socket
      socketRef.current.emit('JOIN_GAME_ROOM', {
        roomId: code.toUpperCase(),
        playerId: data.player.uid,
      });

      setScreen('lobby');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle start game
  const handleStartGame = () => {
    socketRef.current.emit('START_GAME', { roomId });
    setTimeout(() => setScreen('roleReveal'), 500);
  };

  // Handle accusation
  const handleAccusation = (accusedPlayerId, reason) => {
    socketRef.current.emit('MAKE_ACCUSATION', {
      roomId,
      playerId,
      accusedPlayerId,
      reason,
    });
  };

  // Handle dare completed
  const handleDareCompleted = () => {
    setDare(null);
    socketRef.current.emit('DARE_COMPLETED', { roomId, playerId });
  };

  // Handle screen transition
  const handleScreenTransition = (newScreen) => {
    setScreen(newScreen);
  };

  // Render appropriate screen
  const renderScreen = () => {
    if (error) {
      return (
        <div className="error-message">
          <p>{error}</p>
        </div>
      );
    }

    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        );
      case 'lobby':
        return (
          <LobbyScreen
            roomId={roomId}
            roomData={roomData}
            playerId={playerId}
            currentPlayer={currentPlayer}
            onStartGame={handleStartGame}
          />
        );
      case 'roleReveal':
        return (
          <RoleRevealScreen
            currentPlayer={currentPlayer}
            onContinue={() => setScreen('game')}
          />
        );
      case 'game':
        return (
          <GameScreen
            roomData={roomData}
            playerId={playerId}
            currentPlayer={currentPlayer}
            isSeeker={roomData?.currentSeekerId === playerId}
            onAccusation={handleAccusation}
            onGameEnd={() => setScreen('end')}
          />
        );
      case 'end':
        return (
          <EndScreen
            roomData={roomData}
            onBackHome={() => {
              setScreen('home');
              setRoomId(null);
              setPlayerId(null);
              setPlayerName(null);
              setRoomData(null);
              setCurrentPlayer(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
      {dare && <DarePopup dare={dare} onComplete={handleDareCompleted} />}
    </div>
  );
}

export default App;
