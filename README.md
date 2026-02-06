# Thevaiya paiya? 🎭

A mobile-first, real-time online social deduction game built with React, Node.js, and **Supabase** (free PostgreSQL database).Players take turns identifying roles in a fixed sequence, with role swaps and dares keeping gameplay dynamic and engaging.

**FREE FOREVER** – No credit card required, fully open source, Supabase has a generous free tier.

## 🎮 Game Overview

**Players:** 6-8 per room  
**Roles:** Girlfriend, Fling, Side Chick, Ex, Ex's Ex, Lover  
**Mechanics:** Accusation → Role reveal or Role swap + Dare  
**Duration:** ~15-25 minutes  
**Cost:** Completely FREE (Supabase free tier)

### Core Gameplay
1. **Setup**: Players join a private room and are assigned secret roles
2. **Start**: Girlfriend is auto-detected and becomes the first Seeker
3. **Turns**: Seeker accuses another player of being the current role
   - **Correct**: Role is revealed, points awarded, seeker role transfers
   - **Wrong**: Dares applied, roles swap, turn continues
4. **Timer**: 30 seconds per accusation
5. **End**: All 6 roles found = Game over

## 🏗️ Architecture

### Frontend (`frontend/`)
- **React 18** with Vite
- **Socket.io-client** for real-time updates
- **Plain CSS** (mobile-first design)
- **No external UI libraries** (clean, minimal interface)

### Backend (`backend/`)
- **Express.js** + **Socket.io** (real-time game logic)
- **Supabase** PostgreSQL (free, unlimited queries)
- **Node.js** environment

### Database (Supabase PostgreSQL Tables)
- **rooms**: Game state, current seeker, role index
- **players**: Player data, roles, points (connected to rooms)
- **dares**: Dare prompts (classroom-safe, usage tracking)

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Supabase project (free tier at [supabase.com](https://supabase.com))

### 1. Clone & Install

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

### 2. Supabase Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com) (free forever tier)
2. In your project, go to SQL Editor
3. Run the initialization script (provided below)
4. Copy your API keys from Project Settings → API

### 3. Environment Variables

**Backend** (`backend/.env`):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # From API Settings → Service Role Secret Key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env` or `vite.config.js`):
```
VITE_BACKEND_URL=http://localhost:3001

### 4. Initialize Firestore Database
Supabase Tables

1. In Supabase Dashboard → SQL Editor, run this script:

```sql
-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  room_id TEXT PRIMARY KEY,
  status TEXT CHECK (status IN ('waiting', 'playing', 'ended')),
  current_seeker_id TEXT,
  current_role_index INTEGER,
  last_accused_player TEXT,
  timer_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  points INTEGER DEFAULT 0,
  has_revealed BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, uid)
);

-- Create dares table
CREATE TABLE IF NOT EXISTS dares (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  classroom_safe BOOLEAN DEFAULT TRUE,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert dares
INSERT INTO dares (text, classroom_safe, used_count) VALUES
('Sing the alphabet backwards', true, 0),
('Do your best impression of a famous person', true, 0),
('Tell a funny joke', true, 0),
('Do 10 pushups', true, 0),
('Speak in an accent for 1 minute', true, 0),
('Describe your room without laughing', true, 0),
('Do a silly dance for 15 seconds', true, 0),
('Tell us your most embarrassing story', true, 0),
('Pretend to be a phone operator', true, 0),
('Recite a poem or song lyric backwards', true, 0),
('Do an animal impression for 20 seconds', true, 0),
('Hug the nearest person', true, 0),
('Compliment three people in the room', true, 0),
('Do your best celebrity walk', true, 0),
('Say a tongue twister 3 times fast', true, 0),
('Tell a terrible pun', true, 0),
('Do 20 jumping jacks', true, 0),
('Speak only in questions for 1 minute', true, 0),
('Pretend to be a news reporter', true, 0),
('Do a handstand against the wall', true, 0);

-- Create indexes for performance
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_dares_classroom_safe ON dares(classroom_safe);
```

2. Then run the Node initialization (optional, for development):
```bash
cd backend
npm run init-db
```
### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 6. Access the Game

Open [http://localhost:3000](http://localhost:3000) on your mobile phone or browser.

## 📱 Game Screens

### 1. Home Screen
- Create a new room
- Join existing room with code
- Game info & rules

### 2. Lobby (Waiting Room)
- Room code display
- Player list with host badge
- Start button (host only, requires 6-8 players)

### 3. Role Reveal
- Secret role card (animated)
- Confirm button to continue

### 4. Game Screen
- **For Seeker**: 
  - Select opponent player
  - Input accusation reasoning
  - 30-second timer
  - Points leaderboard
- **For Other Players**:
  - Watch current seeker's turn
  - Points leaderboard

### 5. Dare Popup
- Full-screen dare blocking UI
- Shows only to who made wrong guess
- "Done" button to continue game

### 6. End Screen
- Winner highlighted
- Final standings with roles
- Game summary statistics

## 🔐 Anti-Cheat Security

✅ **Backend Validation**: Only seeker can accuse (socket validation)  
✅ **Role Privacy**: Roles never sent to non-owners in full  
✅ **Dare Blocking**: Prevents UI interaction until dare complete  
✅ **Consecutive Accusation Prevention**: Can't accuse same player twice  
✅ **Timer Enforcement**: Server-side expiry handling  

## 📊 Data Model

### Rooms Table (PostgreSQL)
```sql
CREATE TABLE rooms (
  room_id TEXT PRIMARY KEY,
  status TEXT CHECK(status IN ('waiting', 'playing', 'ended')), -- default: 'waiting'
  current_seeker_id TEXT,                    -- uid of the current seeker
  current_role_index INTEGER DEFAULT 0,      -- 0-5 index of role to find
  last_accused_player TEXT,                  -- uid of last accused player
  timer_ends_at TIMESTAMP,                   -- when timer expires
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Players Table (PostgreSQL)
```sql
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(room_id),
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,                                 -- null until game starts
  points INTEGER DEFAULT 0,
  has_revealed BOOLEAN DEFAULT false,        -- true after correct accusation
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, uid)
);
```

### Dares Table (PostgreSQL)
```sql
CREATE TABLE dares (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL UNIQUE,
  classroom_safe BOOLEAN DEFAULT true,
  used_count INTEGER DEFAULT 0               -- for least-used preference
);
```

## 🎯 Game Rules Implementation

### Role Sequence
```
1. Girlfriend (10 pts) ← Seeker starts here
2. Fling (8 pts)
3. Side Chick (6 pts)
4. Ex (4 pts)
5. Ex's Ex (2 pts)
6. Lover (0 pts)
```

### Accusation Flow
```
Seeker → Accuses Player → Backend Validation
├─ CORRECT: 
│   ├ Award points to seeker
│   ├ Reveal player's role
│   ├ Transfer seeker to accused
│   ├ Move to next role
│   └ Reset timer
│
└─ WRONG:
    ├ Pull random dare from database
    ├ Swap roles between seeker and accused
    ├ Show dare (seeker only)
    ├ Keep same seeker/role index
    └ Reset timer (after dare)
```

### Timer Logic
- 30 seconds per seeker turn
- Shown only to seeker
- Expiry = auto-accusation on first available player
- No game pause during dare

## 🧱 Code Structure

```
who-the-real-one/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js          # Firebase initialization
│   │   │   └── initializeDatabase.js # Seed dares
│   │   ├── servsupabase.js          # Supa
│   │   │   ├── gameService.js       # Core game logic
│   │   │   └── playerService.js     # Player operations
│   │   ├── middleware/              # Auth, validation
│   │   └── server.js                # Express + Socket.io
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Timer.jsx            # Game timer
    │   │   └── DarePopup.jsx        # Dare display
    │   ├── screens/
    │   │   ├── HomeScreen.jsx       # Create/Join
    │   │   ├── LobbyScreen.jsx      # Waiting room
    │   │   ├── RoleRevealScreen.jsx # Role reveal
    │   │   ├── GameScreen.jsx       # Main gameplay
    │   │   └── EndScreen.jsx        # Results
    │   ├── services/
    │   │   └── api.js               # Fetch calls
    │   ├── styles/
    │   │   ├── global.css           # Base styles
    │   │   ├── homeScreen.css
    │   │   ├── lobbyScreen.css
    │   │   ├── gameScreen.css
    │   │   ├── timer.css
    │   │   ├── darePopup.css
    │   │   └── endScreen.css
    │   ├── App.jsx                  # Main router
    │   └── main.jsx                 # Entry point
    ├── public/
    │   └── index.html
    ├── vite.config.js
    └── package.json
```

## 🔌 Socket.io Events

### Client → Server
- `JOIN_GAME_ROOM`: { roomId, playerId }
- `START_GAME`: { roomId }
- `MAKE_ACCUSATION`: { roomId, playerId, accusedPlayerId, reason }
- `DARE_COMPLETED`: { roomId, playerId }

### Server → Client
- `ROOM_STATE_UPDATE`: Complete room data
- `ACCUSATION_RESULT`: { isCorrect, dare?, newSeekerId? }
- `ERROR`: { message }

## 🛠️ Development Notes

### Adding New Dares
Edit `backend/src/config/initializeDatabase.js`:
```javascript
const dares = [
  { text: 'Your dare here', classroomSafe: true, usedCount: 0 },
  // ...
];
```

Then re-run the initialization script.

### Mobile Testing
- Use Chrome DevTools device emulation
- Test on actual phone: `npm run build` + host on local network
- Or use: `ngrok http 3000` to expose locally

### Debugging Socket Events
Enable logging in `backend/src/server.js`:
```javascript
if (process.env.DEBUG_SOCKETS === 'true') {
  console.log(`[Socket] Event: ${eventName}`, data);
}
```

## 📱 Mobile-First Considerations

- **Viewport Meta**: Set in `public/index.html`
- **Touch-Friendly**: Large buttons (1rem+ padding)
- **Viewport Units**: Used for responsive layouts
- **No Horizontal Scrolling**: All content fits in viewport width
- **Safe Areas**: Padding on all edges for notches/home indicators
- **Gesture Support**: Tap events only (no hover states)

## 🎨 Styling

- **Color Scheme**:
  - Primary: `#00d4ff` (Cyan)
  - Secondary: `#7b2cbf` (Purple)
  - Danger: `#ff4757` (Red)
  - Success: `#4caf50` (Green)

- **No Tailwind**: All styles in plain CSS files
- **Animations**: Smooth transitions, no jarring movements
- **Accessibility**: Color contrasts meet WCAG AA standards

## 🐛 Troubleshooting

### "Room not found" error
- Verify room code is correct (6 uppercase letters)
- Check Firestore has `rooms` collection
- Ensure database is initialized

### Timer not displaying
- Check Socket.io connection is established
- Verify `currentSeekerId` matches `playerId`
- Browser DevTools → Network tab → check WebSocket

### Dares not showing
- Run `initializeDatabase.js` again
- Check Firestore `dares` collection exists
- Verify `classroomSafe: true` filter in query

### Real-time updates not working
- Verify backend server is running
- Check frontend `.env` has correct `VITE_BACKEND_URL`
- Clear browser cache and restart

## 📜 License

MIT

## 👥 Contributing

Feel free to fork, customize, and improve!

---

**Enjoy the game! 🎉**
