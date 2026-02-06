import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import RoleRevealScreen from './screens/RoleRevealScreen';
import GameScreen from './screens/GameScreen';
import DarePopup from './components/DarePopup';
import LoadingScreen from './components/LoadingScreen';
import EndScreen from './screens/EndScreen';
import ReadyConfirmationScreen from './screens/ReadyConfirmationScreen';
import FinalResultsScreen from './screens/FinalResultsScreen';
import ConnectionStatus from './components/ConnectionStatus';
import './styles/app.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  // State Management
  const [screen, setScreen] = useState('home'); // home | lobby | ready | roleReveal | game | endResults
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [dare, setDare] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingImage, setLoadingImage] = useState(null);
  const [loadingText, setLoadingText] = useState(null);

  // Socket connection
  const socketRef = useRef(null);
  const reconnectAttemptRef = useRef(0);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Socket event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to backend');
      setIsConnected(true);
      setIsReconnecting(false);
      reconnectAttemptRef.current = 0;
      
      // Rejoin room if in active game
      if (roomId && playerId) {
        socketRef.current.emit('JOIN_GAME_ROOM', { roomId, playerId });
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from backend');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('Connection error:', error);
      setIsReconnecting(true);
    });

    socketRef.current.on('ROOM_STATE_UPDATE', (data) => {
      setRoomData(data);
      // Hide loading once server marks game as playing
      if (data?.status === 'playing') {
        setLoadingVisible(false);
        setLoadingText(null);
        setLoadingImage(null);
      }
    });

    socketRef.current.on('ACCUSATION_RESULT', (result) => {
      if (!result.isCorrect) {
        setDare(result.dare);
      }
    });

    socketRef.current.on('ERROR', (data) => {
      setError(data.message);
      setTimeout(() => setError(null), 4000);
    });

    socketRef.current.on('GAME_ABORTED', (data) => {
      setError(data.message || 'Game ended - a player left');
      setTimeout(() => {
        setScreen('home');
        setRoomId(null);
        setPlayerId(null);
        setPlayerName(null);
        setRoomData(null);
        setCurrentPlayer(null);
        setPlayerReady(false);
        setError(null);
      }, 2500);
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

  // Auto-transition all players when game status changes to 'playing'
  useEffect(() => {
    if (roomData?.status === 'playing' && (screen === 'lobby' || screen === 'home')) {
      setScreen('roleReveal');
    }
  }, [roomData?.status, screen]);

  // Auto-transition to ready screen when exactly 6 players are present and all are ready
  useEffect(() => {
    if (roomData?.status === 'waiting' && roomData?.players?.length === 6) {
      const allReady = roomData.players.every(p => p.isReady);
      if (allReady && screen === 'lobby') {
        setScreen('roleReveal');
      }
    }
  }, [roomData?.status, roomData?.players, screen]);

  // Auto-transition to results when game ends
  useEffect(() => {
    if (roomData?.status === 'ended' && screen === 'game') {
      setScreen('endResults');
    }
  }, [roomData?.status, screen]);

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
      setPlayerReady(false);

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
      setError(err.message || 'Failed to create room');
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join room');
      }

      const data = await response.json();
      setRoomId(code.toUpperCase());
      setPlayerId(data.player.uid);
      setPlayerName(name);
      setPlayerReady(false);

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
      setError(err.message || 'Failed to join room');
    }
  };

  // Handle player ready
  const handlePlayerReady = () => {
    setPlayerReady(true);
    socketRef.current.emit('PLAYER_READY', { roomId, playerId });
  };

  // Handle player not ready
  const handlePlayerNotReady = () => {
    setPlayerReady(false);
    socketRef.current.emit('PLAYER_NOT_READY', { roomId, playerId });
  };
  // Handle start game
  const handleStartGame = () => {
    // Show loading with exact requested text while backend initializes roles
    setLoadingText("Game aada ready'a da punda?");
    setLoadingVisible(true);
    socketRef.current.emit('START_GAME', { roomId });
    // Wait briefly; roleReveal will also be triggered when ROOM_STATE_UPDATE arrives
    setTimeout(() => setScreen('roleReveal'), 800);
  };

  // Handle accusation
  const handleAccusation = (accusedPlayerId) => {
    socketRef.current.emit('MAKE_ACCUSATION', {
      roomId,
      playerId,
      accusedPlayerId,
    });
  };

  // Handle dare completed
  const handleDareCompleted = () => {
    setDare(null);
    socketRef.current.emit('DARE_COMPLETED', { roomId, playerId });
  };

  // Handle back to home
  const handleBackHome = () => {
    setScreen('home');
    setRoomId(null);
    setPlayerId(null);
    setPlayerName(null);
    setRoomData(null);
    setCurrentPlayer(null);
    setPlayerReady(false);
    setDare(null);
  };

  // Loading screen controls
  const showLoading = (imageUrl = null, text = null) => {
    setLoadingImage(imageUrl);
    setLoadingText(text);
    setLoadingVisible(true);
  };

  const hideLoading = () => {
    setLoadingVisible(false);
    setLoadingText(null);
    setLoadingImage(null);
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
            onBackHome={handleBackHome}
          />
        );
      case 'ready':
        return (
          <ReadyConfirmationScreen
            roomData={roomData}
            playerId={playerId}
            onReady={handlePlayerReady}
            onCancel={handlePlayerNotReady}
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
            onGameEnd={() => setScreen('endResults')}
            onBackHome={handleBackHome}
          />
        );
      case 'endResults':
        return (
          <FinalResultsScreen
            roomData={roomData}
            playerId={playerId}
            onBackHome={handleBackHome}
          />
        );
      case 'end':
        return (
          <EndScreen
            roomData={roomData}
            onBackHome={handleBackHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <ConnectionStatus isConnected={isConnected} isReconnecting={isReconnecting} />
      <LoadingScreen isVisible={loadingVisible} imageUrl={loadingImage} text={loadingText} />
      {renderScreen()}
      {dare && <DarePopup dare={dare} onComplete={handleDareCompleted} />}
    </div>
  );
}

export default App;
