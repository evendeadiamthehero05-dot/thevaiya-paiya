# Troubleshooting Guide

## 🔧 Common Issues & Solutions

### Backend Issues

#### "Cannot find module '@supabase/supabase-js'"
**Symptom**: Error when starting backend
```
Error: Cannot find module '@supabase/supabase-js'
```

**Solution**:
```bash
cd backend
npm install
```

---

#### "Invalid API Key" or SUPABASE_URL error
**Symptom**: Supabase connection fails on startup
```
Error: Invalid URL / Invalid API key
```

**Solution**:
1. Check `backend/.env` has correct variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. Verify keys copied from Supabase Dashboard:
   - Go to **Settings > API**
   - Use **Service Role Secret Key** (not anon key!)
3. Ensure no extra spaces in `.env` file

---

#### "ECONNREFUSED: Connection refused"
**Symptom**: Cannot connect to backend from frontend
```
ERROR: connect ECONNREFUSED 127.0.0.1:3001
```

**Solution**:
1. Verify backend is running: `npm run dev` in backend folder
2. Check port 3001 is not in use:
   - **Mac/Linux**: `lsof -i :3001`
   - **Windows**: `netstat -ano | findstr :3001`
3. Verify `VITE_BACKEND_URL` in frontend config
4. If using custom network: update URL to your machine's IP

---

#### "Room not found" error
**Symptom**: User can't join room
```
ERROR: Room not found
```

**Solution**:
1. Verify room code is correct (6 uppercase letters)
2. Check Supabase `rooms` table exists:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT COUNT(*) FROM rooms;`
3. If empty, initialize database with SQL script in QUICKSTART.md
4. Verify Supabase connection in backend:
   - Check `.env` has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   - Look for connection errors in backend console

---

#### "No dares available"
**Symptom**: Wrong accusation triggers error instead of dare
```
ERROR: No dares available
```

**Solution**:
```bash
# Verify dares in Supabase SQL Editor:
SELECT COUNT(*) FROM dares;

# If empty (0 rows), run the SQL initialization script:
# See QUICKSTART.md Step 2 for full SQL script
INSERT INTO dares (text, classroom_safe, used_count) VALUES
('Sing the national anthem', true, 0),
('Do your best celebrity impression', true, 0),
... (20 total dares)
```

---

### Frontend Issues

#### "Cannot GET /api/rooms"
**Symptom**: Proxy not working
```
404 - Cannot GET /api/rooms
```

**Solution**:
1. Check `vite.config.js` has correct proxy:
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:3001',
       changeOrigin: true,
     },
   }
   ```
2. Restart frontend dev server
3. Check backend is running on port 3001

---

#### Socket.io not connecting
**Symptom**: Real-time updates not working, socket events not firing
```
Console: WebSocket connection to... failed
```

**Solution**:
1. Verify backend is running
2. Check browser console for CORS errors
3. Verify `VITE_BACKEND_URL` matches backend URL
4. Clear browser cache:
   - Open DevTools (F12)
   - Right-click reload button → "Empty cache and hard refresh"
5. Check backend has CORS enabled:
   ```javascript
   const io = socketIo(server, {
     cors: {
       origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     },
   });
   ```

---

#### Timer not showing
**Symptom**: Timer component missing or not updating
```
Accusation panel visible but no 30-second timer
```

**Solution**:
1. Verify you ARE the current seeker
2. Check `roomData.currentSeekerId === playerId`
3. Verify socket updates are arriving:
   - Open DevTools → Network → WS (WebSocket)
   - Look for `ROOM_STATE_UPDATE` messages
4. Check Timer component renders in GameScreen

---

#### Dare popup doesn't appear
**Symptom**: Wrong accusation but no dare shown
```
Roles swap but dare not displayed
```

**Solution**:
1. Check Supabase has dares:
   - SQL Editor: `SELECT COUNT(*) FROM dares WHERE classroom_safe = true;`
   - Should return 20
2. Verify `ACCUSATION_RESULT` socket event is received:
   - DevTools → Network → WS
   - Look for `dare` object in response
3. If empty, run the SQL INSERT dares script from QUICKSTART.md
4. Clear cache and reload

---

#### Role not showing after reveal
**Symptom**: Accusation succeeds but role doesn't display
```
Player revealed but role field shows blank
```

**Solution**:
1. Check Supabase `players` table:
   - SQL Editor: `SELECT * FROM players WHERE room_id = 'ROOM_CODE';`
   - Verify `has_revealed = true` and `role` is not null
2. Verify role was assigned correctly in game start
3. Check ROOM_STATE_UPDATE includes updated player data
4. Look for:
   ```json
   {
     "uid": "...",
     "role": "Girlfriend",
     "hasRevealed": true
   }
   ```

---

### Network & Deployment Issues

#### "Lobby screen freezes after joining"
**Symptom**: Room data not updating in real-time
```
Player count stuck at same number
```

**Solution**:
1. Verify Socket.io connection:
   ```javascript
   // In browser console:
   console.log(socketRef.current.connected)  // Should be true
   ```
2. Check backend is broadcasting ROOM_STATE_UPDATE
3. Restart both servers
4. Check internet connection/WiFi

---

#### Testing on mobile (local network)
**Issue**: Mobile can't connect to localhost:3000

**Solution A - Using ngrok (easiest)**:
```bash
npm install -g ngrok
ngrok http 3000
# Frontend URL: https://xxxxx.ngrok.io
# Backend proxy to: http://YOUR_COMPUTER_IP:3001
```

**Solution B - Using local IP**:
```bash
# Find your computer's local IP:
ipconfig getifaddr en0  # Mac
ipconfig                # Windows (IPv4 Address)

# Access from mobile:
http://192.168.1.100:3000  # Use your actual IP
```

---

#### "Cannot read property 'emit' of null" socket error
**Symptom**: Socket event fails
```
TypeError: Cannot read property 'emit' of null
```

**Solution**:
1. Wait for socket to connect before emitting:
   ```javascript
   socketRef.current.on('connect', () => {
     socketRef.current.emit('JOIN_GAME_ROOM', {...});
   });
   ```
2. Check socket is initialized in useEffect
3. Verify no race conditions on page load

---

### Data Issues

#### "Points not updating"
**Symptom**: Seeker gets 0 points on correct accusation
```
Player points: 0 after finding Girlfriend (should be 10)
```

**Solution**:
1. Check correct accusation path in gameService.js
2. Verify ROLE_POINTS has all roles
3. Check backend console for accusation logs
4. Verify Supabase player document updated:
   - SQL Editor: `SELECT uid, points FROM players WHERE room_id = 'ROOM_CODE';`
   - Check `points` field increased for seeker

---

#### "Role shows as null"
**Symptom**: Player sees null instead of role name
```
Your role is: null
```

**Solution**:
1. Verify game actually started (status === 'playing')
2. Check roles were assigned in startGame:
   ```javascript
   // Backend logs should show:
   "Game started in room ABC123, Girlfriend is player-id"
   ```
3. Verify currentPlayer not null before rendering
4. Check player role loaded from roomData

---

### Performance Issues

#### "Game lags with 8 players"
**Symptom**: UI updates slowly, timer stutters
```
Frame rate drops, socket updates delayed
```

**Solution**:
1. Check network latency (DevTools → Network tab)
2. Reduce unnecessary re-renders in React
3. Verify Firestore not throttling
4. Check browser has enough memory (DevTools → Memory)
5. Try different WiFi network

---

#### "Frontend takes forever to start"
**Symptom**: `npm run dev` takes 30+ seconds
```
Vite build process slow
```

**Solution**:
1. Verify Node.js version 16+ installed
2. Clear node_modules cache:
   ```bash
   rm -rf node_modules
   npm cache clean --force
   npm install
   ```
3. Use faster disk (SSD > HDD)
4. Close other applications

---

## 🔍 Debugging Tips

### Enable detailed logging

**Backend**:
```javascript
// In server.js
socket.on('MAKE_ACCUSATION', (data) => {
  console.log('[DEBUG] Accusation:', data);
  // ... rest of code
});
```

**Frontend**:
```javascript
// In browser console
localStorage.setItem('debug', 'socket.io*');
// Reload page
```

### Check Supabase in real-time

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** for direct queries or **Table Editor** for visual view
4. Watch tables update in real-time as game progresses:
   - Check `rooms` table for status changes
   - Check `players` table for role assignments and points
   - Check `dares` table for used_count increments
5. Example queries:
   ```sql
   SELECT * FROM rooms WHERE room_id = 'ABC123';
   SELECT * FROM players WHERE room_id = 'ABC123';
   SELECT * FROM dares LIMIT 5;
   ```

### Network inspection

1. Open DevTools (F12)
2. Go to Network tab
3. Filter "XHR" for REST calls, "WS" for WebSocket
4. Click requests to see payload/response
5. Check WebSocket messages in real-time

---

## 📞 When All Else Fails

1. **Restart both servers** (kill and restart)
2. **Clear browser cache** (Ctrl+Shift+Del)
3. **Clear node_modules** and reinstall:
   ```bashSupabase credentials** in `.env`:
   - SUPABASE_URL starts with `https://`
   - SUPABASE_SERVICE_ROLE_KEY is not empty (copy from Settings > API)
6. **Check browser console** for errors (F12)
7. **Check backend console** for errors
8. **Re-read QUICKSTART.md** - might have missed a step
9. **Test Supabase connection**:
   ```bash
   # In backend folder, run:
   node -e "const { createClient } = require('@supabase/supabase-js'); 
   const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); 
   db.from('dares').select('COUNT()').then(r => console.log(r));"
   ```
4. **Check Node version**:
   ```bash
   node --version  # Should be 16+
   ```
5. **Verify Firebase credentials** in `.env`
6. **Check browser console** for errors (F12)
7. **Check backend console** for errors
8. **Re-read QUICKSTART.md** - might have missed a step

---

**Version**: 1.0  
**Last Updated**: Feb 2026

