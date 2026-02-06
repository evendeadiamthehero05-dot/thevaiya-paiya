const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { db } = require('./config/database');
const gameService = require('./services/gameService');

const app = express();
const server = http.createServer(app);
// CORS configuration for multiple environments
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

// Add production frontend URL if provided
if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
}

// Allow any deployed frontend in production (Netlify)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl requests, etc)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Netlify deployments
    if (origin.includes('netlify.app') || process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    // Check explicit whitelist
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
};

const io = socketIo(server, {
  cors: corsOptions,
});

// Middleware
app.use(cors());
app.use(express.json());

// REST API endpoints
app.post('/api/rooms', async (req, res) => {
  try {
    console.log('POST /api/rooms received:', req.body);
    const { playerName } = req.body;
    if (!playerName) {
      console.warn('Missing playerName in request');
      res.status(400).json({ error: 'playerName is required' });
      return;
    }
    console.log('Creating room for player:', playerName);
    const result = await gameService.createRoom(db, playerName);
    console.log('Room created successfully:', result);
    res.json({ roomId: result.roomId, player: result.player });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { playerName } = req.body;
    const player = await gameService.addPlayerToRoom(db, roomId, playerName);
    res.json({ player });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await gameService.getRoomData(db, roomId);
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join room with socket
  socket.on('JOIN_GAME_ROOM', async (data) => {
    const { roomId, playerId } = data;
    socket.join(roomId);
    console.log(`Player ${playerId} joined room ${roomId}`);

    // Fetch and emit current room state
    try {
      const room = await gameService.getRoomData(db, roomId);
      io.to(roomId).emit('ROOM_STATE_UPDATE', room);
    } catch (error) {
      console.error('Error fetching room state:', error);
    }
  });

  // Start game
  socket.on('START_GAME', async (data) => {
    const { roomId } = data;
    try {
      await gameService.startGame(db, roomId);
      const room = await gameService.getRoomData(db, roomId);
      io.to(roomId).emit('ROOM_STATE_UPDATE', room);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('ERROR', { message: error.message });
    }
  });

  // Make an accusation
  socket.on('MAKE_ACCUSATION', async (data) => {
    const { roomId, playerId, accusedPlayerId, reason } = data;
    try {
      const result = await gameService.processAccusation(
        db,
        roomId,
        playerId,
        accusedPlayerId,
        reason
      );

      // Emit result to all players in room
      io.to(roomId).emit('ACCUSATION_RESULT', result);

      // Update room state
      const room = await gameService.getRoomData(db, roomId);
      io.to(roomId).emit('ROOM_STATE_UPDATE', room);
    } catch (error) {
      console.error('Error processing accusation:', error);
      socket.emit('ERROR', { message: error.message });
    }
  });

  // Dare completed
  socket.on('DARE_COMPLETED', async (data) => {
    const { roomId, playerId } = data;
    try {
      const room = await gameService.getRoomData(db, roomId);
      io.to(roomId).emit('ROOM_STATE_UPDATE', room);
    } catch (error) {
      console.error('Error after dare completed:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS enabled for: Localhost, Netlify deployments`);
  if (process.env.FRONTEND_URL) console.log(`   Specific frontend: ${process.env.FRONTEND_URL}`);
  console.log('✅ Database ready for requests');
});

module.exports = { io, app };
