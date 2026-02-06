# API & Socket.io Documentation

## 🔌 Socket.io Events Reference

All real-time communication uses Socket.io with namespace `/`.

### Client Events (Frontend → Backend)

#### `JOIN_GAME_ROOM`
Registers player in a room and subscribes to updates.

**Payload:**
```javascript
{
  roomId: "ABC123",        // 6-char room code
  playerId: "uuid-xxx"    // Player's unique ID
}
```

**Server Response:**
Emits `ROOM_STATE_UPDATE` with current room data

**Error Handling:**
- `ERROR` event if room doesn't exist
- `ERROR` event if game already started

---

#### `START_GAME`
Starts the game (host only). Assigns roles and selects first seeker.

**Payload:**
```javascript
{
  roomId: "ABC123"
}
```

**Validation:**
- Must be room host
- 6 players required
- Room status must be "waiting"

**Server Response:**
Emits `ROOM_STATE_UPDATE` with:
- `status: "playing"`
- `currentSeekerId` set to Girlfriend player
- `currentRoleIndex: 0`
- `timerEndsAt` timestamp

---

#### `MAKE_ACCUSATION`
Submit an accusation. Only seeker can call this.

**Payload:**
```javascript
{
  roomId: "ABC123",           // Game room
  playerId: "uuid-xxx",       // Seeker's ID
  accusedPlayerId: "uuid-yyy", // Target player
  reason: "They're too flirty" // 1-200 char text
}
```

**Validation:**
- `playerId` must equal `roomData.currentSeekerId`
- `accusedPlayerId` must be valid, different, unrevealed
- `accusedPlayerId` ≠ `roomData.lastAccusedPlayer`
- `reason` must be 1-200 characters

**Server Response:**
Emits `ACCUSATION_RESULT`:
```javascript
// Correct Accusation
{
  isCorrect: true,
  newSeekerId: "uuid-yyy",    // New seeker
  nextRole: "Fling",          // Next role to find
  pointsEarned: 8,            // Points to seeker
  gameEnded: false
}

// Wrong Accusation
{
  isCorrect: false,
  dare: {
    id: "dare_5",
    text: "Sing backwards" 
  },
  newSeekerId: "uuid-xxx"     // Same seeker (role changed)
}

// Game Ended
{
  isCorrect: true,
  newSeekerId: null,
  nextRole: null,
  pointsEarned: 0,
  gameEnded: true
}
```

Then emits `ROOM_STATE_UPDATE` with updated game state.

---

#### `DARE_COMPLETED`
Player signals completion of dare. Unblocks game.

**Payload:**
```javascript
{
  roomId: "ABC123",
  playerId: "uuid-xxx"
}
```

**Server Response:**
Emits `ROOM_STATE_UPDATE` with latest room state.

---

### Server Events (Backend → Frontend)

#### `ROOM_STATE_UPDATE`
Complete room state broadcast to all players in room.

**Payload:**
```javascript
{
  roomId: "ABC123",
  status: "waiting" | "playing" | "ended",
  currentSeekerId: "uuid-xxx",
  currentRoleIndex: 0,              // 0-5
  lastAccusedPlayer: "uuid-yyy" || null,
  timerEndsAt: Timestamp,
  createdAt: Timestamp,
  players: [
    {
      uid: "uuid-xxx",
      name: "Alice",
      role: "Girlfriend" || null,   // null if hidden
      points: 10,
      hasRevealed: false,
      isHost: true
    },
    // ... more players
  ]
}
```

**Sent When:**
- Player joins room
- Game starts
- Accusation resolved
- Dare completed
- Any state change

---

#### `ACCUSATION_RESULT`
Result of accusation (correct/wrong/game over).

**Payload:**
```javascript
{
  isCorrect: boolean,
  dare?: {                    // Only if wrong
    id: string,
    text: string
  },
  newSeekerId: string,
  nextRole?: string,
  pointsEarned?: number,
  gameEnded?: boolean
}
```

---

#### `ERROR`
Sent when invalid action attempted.

**Payload:**
```javascript
{
  message: "Error description"
}
```

**Examples:**
- "Only the current seeker can make accusations"
- "Cannot accuse the same player consecutively"
- "Room not found"
- "Player not found"

---

## 🌐 REST API Endpoints

### Create Room
**POST** `/api/rooms`

**Request:**
```javascript
{
  playerName: "Alice"
}
```

**Response:**
```javascript
{
  roomId: "ABC123"
}
```

**Errors:**
- `500`: Database error (Supabase connection issue)

---

### Join Room
**POST** `/api/rooms/:roomId/join`

**Request:**
```javascript
{
  playerName: "Bob"
}
```

**Response:**
```javascript
{
  player: {
    uid: "uuid-xxx",
    name: "Bob"
  }
}
```

**Errors:**
- `404`: Room not found
- `400`: Game already started
-- `400`: Room full (6 players max)

---

### Get Room
**GET** `/api/rooms/:roomId`

**Response:**
```javascript
{
  roomId: "ABC123",
  status: "waiting",
  currentSeekerId: "uuid-xxx",
  currentRoleIndex: 0,
  // ... full room data (same as ROOM_STATE_UPDATE)
  players: [...]
}
```

**Errors:**
- `404`: Room not found

---

## 🔐 Authorization

### Client → Server
- Socket connections require `playerId` in JOIN_GAME_ROOM
- Backend validates `playerId` against Firestore player list
- All accusations validated against `currentSeekerId`

### Private Data Protection
```javascript
// Sent to all players
{
  uid: "uuid-xxx",
  name: "Alice",
  points: 10,
  hasRevealed: true,
  isHost: false
}

// NEVER sent to other players before reveal
{
  role: "Girlfriend"  // ← Only visible after revealed
}
```

---

## 📊 Firestore Queries

### Get Room
```javascript
db.collection('rooms').doc(roomId).get()
```

### Get Players in Room
```javascript
db.collection('rooms')
  .doc(roomId)
  .collection('players')
  .get()
```

### Get Single Player
```javascript
db.collection('rooms')
  .doc(roomId)
  .collection('players')
  .doc(playerId)
  .get()
```

### Get Dares
```javascript
db.collection('dares')
  .where('classroomSafe', '==', true)
  .orderBy('usedCount', 'asc')
  .limit(5)
  .get()
```

---

## 🔄 Game Flow Sequence Diagram

```
[Client]                          [Backend]
    |                                |
    |--1. JOIN_GAME_ROOM ---------->|
    |<--ROOM_STATE_UPDATE-----------|
    |                          (waiting state)
    |
    |--2. START_GAME ---------->|
    |<--ROOM_STATE_UPDATE------| (playing, assign roles)
    |
    |--3. MAKE_ACCUSATION ----->|
    |<--ACCUSATION_RESULT------|
    |<--ROOM_STATE_UPDATE------|
    |
    |  [If Wrong: Show Dare Popup]
    |
    |--4. DARE_COMPLETED ----->|
    |<--ROOM_STATE_UPDATE------|
    |
    | [Loop back to step 3...]
    |
    | [When all roles revealed]
    |<--ROOM_STATE_UPDATE------| (ended state)
    |        (show end screen)
```

---

## 🧪 Testing Socket Events

### Using Socket.io Test Client

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

// Connect
socket.on('connect', () => {
  console.log('Connected!');
  
  // Join room
  socket.emit('JOIN_GAME_ROOM', {
    roomId: 'ABC123',
    playerId: 'test-player-1'
  });
});

// Listen for updates
socket.on('ROOM_STATE_UPDATE', (roomData) => {
  console.log('Room updated:', roomData);
});

socket.on('ACCUSATION_RESULT', (result) => {
  console.log('Accusation result:', result);
});

socket.on('ERROR', (error) => {
  console.error('Error:', error);
});
```

---

## ⚙️ Configuration Constants

Backend values (auto-imported in frontend):
```javascript
// gameService.js
ROLES = ['Girlfriend', 'Fling', 'Side Chick', 'Ex', "Ex's Ex", 'Lover']

ROLE_POINTS = {
  'Girlfriend': 10,
  'Fling': 8,
  'Side Chick': 6,
  'Ex': 4,
  "Ex's Ex": 2,
  'Lover': 0
}

TIMER_DURATION = 30 // seconds
```

---

## 🚀 Rate Limiting Recommendations

Add if needed:
```javascript
// Prevent accusation spam
const accusationLimiter = rateLimit({
  windowMs: 1 * 1000,    // 1 second
  max: 1                 // 1 request per second
});

app.post('/api/rooms/*/accuse', accusationLimiter, ...);
```

---

## 📝 Logging

Enable detailed logs:
```bash
# Backend
DEBUG_SOCKETS=true npm run dev

# Frontend (console logs)
localStorage.setItem('debug', 'socket.io*');
```

---

**Version**: 1.0  
**Last Updated**: Feb 2026
