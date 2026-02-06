# 📖 Documentation Index

Start here! This guide helps you navigate all documentation.

## 🚀 Quick Navigation

### I want to START PLAYING NOW
→ Read: [QUICKSTART.md](./QUICKSTART.md) (5 minutes)

### I want to UNDERSTAND THE PROJECT  
→ Read: [README.md](./README.md) (10 minutes)

### I want to LEARN THE GAME RULES
→ Read: [GAME_RULES.md](./GAME_RULES.md) (detailed rules)

### I want to DEVELOP & EXTEND
→ Read: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (dev reference)

### Something is BROKEN
→ Read: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (fixes)

### I want to see PROJECT STRUCTURE
→ Read: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) (architecture)

### I want to know WHAT'S INCLUDED
→ Read: [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) (features)

---

## 📚 Document Descriptions

| Document | Purpose | Time | Level |
|----------|---------|------|-------|
| **QUICKSTART.md** | 5-step setup guide | 5 min | Beginner |
| **README.md** | Full project documentation | 15 min | All |
| **GAME_RULES.md** | Detailed game mechanics | 10 min | Players |
| **API_DOCUMENTATION.md** | Socket & REST API reference | 20 min | Developer |
| **PROJECT_STRUCTURE.md** | Code organization & data flow | 10 min | Developer |
| **COMPLETION_SUMMARY.md** | What's implemented | 5 min | All |
| **TROUBLESHOOTING.md** | Common issues & fixes | Variable | All |
| **This file** | Documentation navigation | 2 min | All |

---

## 🎯 By Use Case

### 👤 I'm a Player
1. Read [QUICKSTART.md](./QUICKSTART.md) - Setup
2. Read [GAME_RULES.md](./GAME_RULES.md) - Learn rules
3. Start playing!

### 👨‍💻 I'm a Developer (Backend)
1. Read [README.md](./README.md) - Overview
2. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API ref
3. Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture
4. Explore `backend/src/services/gameService.js`
5. Start coding!

### 🎨 I'm a Developer (Frontend)
1. Read [README.md](./README.md) - Overview
2. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Socket events
3. Read [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architecture
4. Explore `frontend/src/screens/GameScreen.jsx`
5. Start coding!

### 🚀 I want to Deploy
1. Read [README.md](./README.md) - Full context
2. Check Deployment section in README.md
3. Follow cloud provider guides

### 🐛 Something's not working
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Try the recommended fix
3. Still stuck? Check browser console (F12)

---

## 🗺️ Reading Paths

### Path 1: Just Want to Play (15 min)
```
QUICKSTART.md → Start servers → Play!
```

### Path 2: Understand Everything (30 min)
```
README.md → GAME_RULES.md → PROJECT_STRUCTURE.md → Play!
```

### Path 3: Backend Development (1 hour)
```
README.md 
  → PROJECT_STRUCTURE.md 
  → API_DOCUMENTATION.md 
  → backend/src/services/gameService.js
  → Start coding
```

### Path 4: Full Stack Setup (2 hours)
```
README.md 
  → QUICKSTART.md (setup)
  → API_DOCUMENTATION.md (api ref)
  → PROJECT_STRUCTURE.md (architecture)
  → Explore code
  → Run & test
  → Start developing
```

---

## 🔑 Key Information At a Glance

### What is this?
- **Who's The Real One?** - Mobile-first, real-time social deduction game
- **Players**: 6-8 per room
- **Roles**: 6 in fixed sequence
- **Duration**: 15-25 minutes per game

### How does it work?
- Seeker accuses another player
- Correct? Role revealed, points awarded, next seeker
- Wrong? Dare executed, roles swapped, continue

### What do I need?
- Node.js 16+
- Firebase project
- ~20 minutes setup time
- 6-8 friends to play

### When can I play?
- After 5-minute QUICKSTART.md setup
- Or 20 minutes if doing full configuration

---

## 📋 File Checklist

Headers in each document:
```
✅ QUICKSTART.md ........... Setup in 5 steps
✅ README.md ............... Full documentation  
✅ GAME_RULES.md ........... Game mechanics
✅ API_DOCUMENTATION.md .... Socket & REST API
✅ PROJECT_STRUCTURE.md .... Code organization
✅ COMPLETION_SUMMARY.md ... What's included
✅ TROUBLESHOOTING.md ...... Common issues
✅ INDEX.md (this file) .... Navigation guide
```

Plus 28+ code files in backend and frontend directories.

---

## 🎓 Learning Resources

### For Players
- Read **GAME_RULES.md** thoroughly
- Play a test game
- Learn from mistakes

### For Developers
- Study **gameService.js** (core logic)
- Learn **Socket.io** real-time patterns
- Understand Firestore document structure
- Review React component lifecycle

### Best Practices in Code
- Check comments in source files
- See how game state flows
- Notice validation at backend
- Review error handling

---

## ⚡ Quick Commands

```bash
# Setup
npm install -w backend && npm install -w frontend

# Initialize database  
cd backend && node src/config/initializeDatabase.js

# Run development
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev

# Build production
npm run build -w frontend && npm run build -w backend
```

---

## 🆘 Need Help?

1. **Can't get started?** → [QUICKSTART.md](./QUICKSTART.md)
2. **Something broken?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. **Want to develop?** → [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. **Understanding code?** → [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
5. **Learning rules?** → [GAME_RULES.md](./GAME_RULES.md)

---

## 🎉 You're All Set!

Pick a document from the top based on what you want to do, and start reading. Everything you need is here.

**Recommended first step**: Open [QUICKSTART.md](./QUICKSTART.md) now! 🚀

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: ✅ Complete & Ready
