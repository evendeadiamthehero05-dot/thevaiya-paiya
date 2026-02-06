# Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend (new terminal)
cd frontend && npm install
```

### Step 2: Set Up Supabase (Free PostgreSQL)
1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Create a new project (choose a region close to you)
3. Go to **SQL Editor** and run the initialization script:

```sql
-- Create tables
CREATE TABLE rooms (
  room_id TEXT PRIMARY KEY,
  status TEXT CHECK(status IN ('waiting', 'playing', 'ended')) DEFAULT 'waiting',
  current_seeker_id TEXT,
  current_role_index INTEGER DEFAULT 0,
  last_accused_player TEXT,
  timer_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(room_id),
  uid TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  points INTEGER DEFAULT 0,
  has_revealed BOOLEAN DEFAULT false,
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, uid)
);

CREATE TABLE dares (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL UNIQUE,
  classroom_safe BOOLEAN DEFAULT true,
  used_count INTEGER DEFAULT 0
);

-- Insert 20 classroom-safe dares
INSERT INTO dares (text, classroom_safe, used_count) VALUES
('Sing the national anthem', true, 0),
('Do your best celebrity impression', true, 0),
('Tell a joke', true, 0),
('Do 10 pushups', true, 0),
('Speak in a British accent for 30 seconds', true, 0),
('Say the alphabet backwards', true, 0),
('Do a dance', true, 0),
('High-five everyone in the room', true, 0),
('Compliment the person to your left', true, 0),
('Say everything backwards for 30 seconds', true, 0),
('Pretend to be a dinosaur', true, 0),
('Read a text message in a funny voice', true, 0),
('Stand on one leg and sing', true, 0),
('Do your best animal impression', true, 0),
('Recite a tongue twister fast', true, 0),
('Describe your day using only emojis', true, 0),
('Do a handstand (or try!)', true, 0),
('Narrate your next action like a sports commentator', true, 0),
('Do your best robot impression', true, 0),
('Sing ''Happy Birthday'' loudly', true, 0);

-- Create indexes for performance
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_dares_classroom_safe ON dares(classroom_safe);
```

4. Copy your API credentials from **Settings > API**:
   - `Project URL` → `SUPABASE_URL`
   - `Service Role Secret Key` → `SUPABASE_SERVICE_ROLE_KEY` (keep this private!)

### Step 3: Configure Environment
Create `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-super-secret-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 5: Play!
Open **http://localhost:3000** on your phone or browser.

---

## 🎮 How to Play

1. **Create a Room**: Player 1 creates room, gets room code
2. **Join Room**: Players 2-8 join with code
3. **Start Game**: Host starts when 6-8 players ready
4. **Your Role**: You'll see your secret role (DON'T TELL!)
5. **Gameplay**:
   - Seeker accuses someone of being the current role
   - Wrong? Do a dare and swap roles
   - Right? Role revealed, seeker transfers, next role!
6. **Win**: Find all 6 roles!

---

## 📱 Testing on Mobile

### Option A: Local Network
```bash
# Get your machine's local IP
ipconfig getifaddr en0  # Mac
ipconfig              # Windows (look for IPv4)

# In frontend vite.config.js, change port or use:
# http://YOUR_IP:3000
```

### Option B: Chrome DevTools
1. Open DevTools (F12)
2. Click device icon (top-left)
3. Select "iPhone" or "iPad"
4. Test responsiveness

### Option C: Ngrok Tunnel
```bash
npm install -g ngrok
ngrok http 3000
# Share the URL with friends!
```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Cannot find module '@supabase/supabase-js'" | Run `npm install` in backend folder |
| "ECONNREFUSED connection" | Check backend is running on port 3001 |
| "Invalid API Key" or "CORS error" | Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env` |
| Dares table is empty | Run the SQL initialization script again in Supabase SQL Editor |
| UI doesn't update | Clear browser cache, restart both servers |
| Socket not connecting | Verify `VITE_BACKEND_URL` in frontend config |

---

## 📞 Need Help?

- Check main [README.md](../README.md) for full documentation
- Verify all `.env` variables are set correctly
- Run `node -v` to confirm Node 16+ installed
- Check browser console for errors (F12)

Happy gaming! 🎭
