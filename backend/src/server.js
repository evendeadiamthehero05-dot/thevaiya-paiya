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

// Store socket to room/player mapping
const socketToRoom = new Map();

// Helper: emit room state with connected flags
async function emitRoomState(roomId) {
  try {
    const room = await gameService.getRoomData(db, roomId);

    // Compute connected players for this room from socketToRoom map
    const connectedSet = new Set();
    for (const [, info] of socketToRoom.entries()) {
      if (info.roomId === roomId && info.playerId) connectedSet.add(info.playerId);
    }

    // Attach connected flag to players
    room.players = room.players.map((p) => ({
      ...p,
      connected: connectedSet.has(p.uid),
    }));

    // Emit a tailored ROOM_STATE_UPDATE to each connected socket in the room
    for (const [socketId, info] of socketToRoom.entries()) {
      if (info.roomId !== roomId) continue;

      try {
        const recipientPlayerId = info.playerId;

        // For privacy: only include full role data for (a) the recipient themselves,
        // (b) players whose role has been revealed, or (c) when the game has ended.
        const tailoredPlayers = room.players.map((p) => {
          const showRole = room.status === 'ended' || p.hasRevealed || p.uid === recipientPlayerId;
          return {
            uid: p.uid,
            name: p.name,
            role: showRole ? p.role : null,
            points: p.points,
            hasRevealed: p.hasRevealed,
            isHost: p.isHost,
            connected: p.connected,
          };
        });

        const tailoredRoom = {
          ...room,
          players: tailoredPlayers,
        };

        io.to(socketId).emit('ROOM_STATE_UPDATE', tailoredRoom);
      } catch (err) {
        console.error('Error emitting tailored room state to socket', socketId, err);
      }
    }
  } catch (err) {
    console.error('Error emitting room state:', err);
  }
}

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
    
    // Store socket-to-room mapping
    socketToRoom.set(socket.id, { roomId, playerId });
    
    console.log(`Player ${playerId} joined room ${roomId}`);

    // Fetch and emit current room state
    try {
      await emitRoomState(roomId);
    } catch (error) {
      console.error('Error fetching room state:', error);
    }
  });

  // Start game
  socket.on('START_GAME', async (data) => {
    const { roomId } = data;
    try {
      await gameService.startGame(db, roomId);
      await emitRoomState(roomId);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('ERROR', { message: error.message });
    }
  });

  // Make an accusation
  socket.on('MAKE_ACCUSATION', async (data) => {
    const { roomId, playerId, accusedPlayerId } = data;
    try {
      const result = await gameService.processAccusation(
        db,
        roomId,
        playerId,
        accusedPlayerId
      );

      // Emit result to all players in room
      io.to(roomId).emit('ACCUSATION_RESULT', result);

      // Update room state (including connected flags)
      await emitRoomState(roomId);
    } catch (error) {
      console.error('Error processing accusation:', error);
      socket.emit('ERROR', { message: error.message });
    }
  });

  // Dare completed
  socket.on('DARE_COMPLETED', async (data) => {
    const { roomId, playerId } = data;
    try {
      await emitRoomState(roomId);
    } catch (error) {
      console.error('Error after dare completed:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Get room and player info
    const socketInfo = socketToRoom.get(socket.id);
    
    if (socketInfo) {
      const { roomId, playerId } = socketInfo;
      
      try {
        // Check if room exists and game is active
        const room = await gameService.getRoomData(db, roomId);
        
        if (room && (room.status === 'playing' || room.status === 'waiting')) {
          console.log(`🚨 Player ${playerId} disconnected from active game in room ${roomId}`);
          
          // End the game for everyone
          await new Promise((resolve) => {
            db.run(
              'UPDATE rooms SET status = ? WHERE room_id = ?',
              ['aborted', roomId],
              (err) => {
                if (!err) {
                  console.log(`Game aborted in room ${roomId}`);
                }
                resolve();
              }
            );
          });
          
          // Notify all players in room that game was aborted
          io.to(roomId).emit('GAME_ABORTED', {
            reason: `${room.players?.find(p => p.uid === playerId)?.name || 'A player'} left the game`,
            message: 'Game ended because a player disconnected',
          });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
      
      // Clean up socket mapping
      socketToRoom.delete(socket.id);
    }
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
