# Project Structure Overview

## 🎯 Root Distribution

```
d:\sshhh\
    ├── 📄 README.md                 ← Start here!
    ├── 📄 QUICKSTART.md            ← 5-min setup
    ├── 📄 GAME_RULES.md            ← Game mechanics
    ├── 📄 API_DOCUMENTATION.md     ← Dev reference
    ├── 📄 COMPLETION_SUMMARY.md    ← What's included
    ├── 📄 package.json             ← Workspace setup
    ├── 📄 .gitignore               ← Git ignore rules
    ├── 📄 setup.sh                 ← Auto setup script
    │
    ├── 📁 backend/                 ← Node.js Server
    │   ├── 📄 package.json
    │   ├── 📄 .env.example
    │   └── 📁 src/
    │       ├── 📄 server.js        (150 lines) Express + Socket.io
    │       ├── 📁 config/
    │       │   ├── supabase.js     Supabase initialization
    │       │   └── initializeDatabase.js  (65 lines) SQL setup
    │       ├── 📁 services/
    │       │   ├── gameService.js  (393 lines) ⭐ Core game logic
    │       │   └── playerService.js (40 lines) Player operations
    │       └── 📁 middleware/      (Ready for auth)
    │
    └── 📁 frontend/                ← React App
        ├── 📄 package.json
        ├── 📄 vite.config.js
        ├── 📄 .env.example
        ├── 📁 public/
        │   └── index.html
        └── 📁 src/
            ├── 📄 main.jsx
            ├── 📄 App.jsx          (238 lines) Main router
            ├── 📁 components/      UI Components
            │   ├── Timer.jsx       (30 lines) Timer display
            │   └── DarePopup.jsx   (18 lines) Dare modal
            ├── 📁 screens/         Complete screens
            │   ├── HomeScreen.jsx  (65 lines) Create/Join
            │   ├── LobbyScreen.jsx (60 lines) Waiting room
            │   ├── RoleRevealScreen.jsx (35 lines) Role reveal
            │   ├── GameScreen.jsx  (150 lines) ⭐ Main gameplay
            │   └── EndScreen.jsx   (50 lines) Results
            └── 📁 styles/          Plain CSS
                ├── global.css      (150 lines) Base styles
                ├── homeScreen.css  (70 lines)
                ├── lobbyScreen.css (80 lines)
                ├── gameScreen.css  (200 lines)
                ├── timer.css       (60 lines)
                ├── darePopup.css   (65 lines)
                ├── app.css         (20 lines)
                └── endScreen.css   (100 lines)
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                            │
│  (React Frontend @ localhost:3000)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ HomeScreen → LobbyScreen → RoleReveal → GameScreen      │  │
│  │                                           ↓              │  │
│  │                                      DarePopup          │  │
│  │                                           ↓              │  │
│  │                                      EndScreen          │  │
│  │  All screens use Socket.io ↔ real-time updates         │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    Socket.io + REST
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                  EXPRESS SERVER                                 │
│              (@ localhost:3001)                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes:                                                   │  │
│  │  POST /api/rooms              → Create room             │  │
│  │  POST /api/rooms/:code/join   → Join room              │  │
│  │  GET  /api/rooms/:code        → Fetch room state       │  │
│  │                                                          │  │
│  │ Socket.io Events:                                       │  │
│  │  JOIN_GAME_ROOM → [gameService] → ROOM_STATE_UPDATE   │  │
│  │  START_GAME     → [gameService] → ROOM_STATE_UPDATE   │  │
│  │  MAKE_ACCUSATION→[gameService] → ACCUSATION_RESULT    │  │
│  │  DARE_COMPLETED → [gameService] → ROOM_STATE_UPDATE   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                 Supabase Client (@supabase/supabase-js)
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│             SUPABASE POSTGRESQL DATABASE                        │
│         (Cloud - Free tier, 5+GB storage)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tables:                                                  │  │
│  │                                                          │  │
│  │ rooms                                                    │  │
│  │ ├── room_id (TEXT PRIMARY KEY)                          │  │
│  │ ├── status ("waiting|playing|ended")                    │  │
│  │ ├── current_seeker_id (TEXT)                            │  │
│  │ ├── current_role_index (INTEGER 0-5)                    │  │
│  │ ├── timer_ends_at (TIMESTAMP)                           │  │
│  │ └── created_at (TIMESTAMP)                              │  │
│  │                                                          │  │
│  │ players                                                  │  │
│  │ ├── room_id (FK to rooms)                               │  │
│  │ ├── uid, name, role                                     │  │
│  │ ├── points, has_revealed, is_host                       │  │
│  │ └── created_at (TIMESTAMP)                              │  │
│  │                                                          │  │
│  │ dares                                                    │  │
│  │ ├── id (SERIAL PRIMARY KEY)                             │  │
│  │ ├── text (TEXT UNIQUE)                                  │  │
│  │ ├── classroom_safe (BOOLEAN)                            │  │
│  │ └── used_count (INTEGER)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎮 Game State Machine

```
                    START
                      │
                      ▼
              ┌──────────────┐
              │   WAITING    │
              │   (Lobby)    │
              │ 6-8 players  │
              └────────┬─────┘
                       │ Host starts
                       ▼
              ┌──────────────┐
              │   PLAYING    │
              │ - Roles set  │
              │ - Seeker set │
              └────────┬─────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    Turn Loop              Win Condition
    (Accusation)          (All 6 roles
          │                revealed)
    ┌─────▼─────┐                 │
    │ Is Correct?           └─────┬─────┘
    └─────┬─────┘                 │
          │ Yes            ▼
          ├──► Award pts   ┌──────────────┐
          │   ─ Reveal     │    ENDED     │
          │   ─ New seeker │  Final Score │
          │   ─ Next role  └──────────────┘
          │                      │
          │ No            ▼─────┘
          ├──► Get dare   │
          │   ─ Swap      ↓
          │      roles   Game Over
          │   ─ Continue
          │
          └─────────────┐
                        │
                  ┌─────▴─────┐
                  │ Loop again │
                  │ (30 sec)   │
                  └───────────┘
```

---

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Total Files | 28+ |
| Total Lines of Code | 2000+ |
| Components | 11 |
| CSS Files | 8 |
| API Endpoints | 3 |
| Socket Events | 8+ |
| Game Dares | 20 |
| Supported Players | 6-8 |
| Timer Duration | 30 seconds |
| Roles | 6 |
| Max Points/Game | 30 |

---

## 🚀 Deployment Checklist

- [ ] Supabase project created
- [ ] SQL tables created (run initialization script)
- [ ] `.env` files configured (SUPABASE_URL & keys)
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] Test on local machine
- [ ] Test on mobile device
- [ ] Test with 6+ players
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Test production URLs

---

## 📚 Documentation Map

```
For...                          Read...
─────────────────────────────────────────────────
First-time setup                QUICKSTART.md
Full overview                   README.md
Game mechanics                  GAME_RULES.md
Backend/Frontend dev            API_DOCUMENTATION.md
What's included                 COMPLETION_SUMMARY.md
Project structure               PROJECT_STRUCTURE.md (this file)
```

---

## 🎯 Next Steps

1. **Read QUICKSTART.md** - Get running in 5 minutes
2. **Read README.md** - Understand the full project
3. **Set up Supabase** - Create project + run SQL initialization script
4. **Run `npm install`** - Install all dependencies
5. **Run development servers** - Start backend and frontend
6. **Open http://localhost:3000** - Play the game!

---

**You have a complete, production-ready game! 🎉**

