# 🚀 Quick Deployment Checklist

Use this to deploy your game for testing with friends.

## ✅ Pre-Deployment Checklist

- [ ] Both servers run locally without errors
- [ ] Room creation works (test with `test_game_flow.js`)
- [ ] Frontend connects to backend
- [ ] Code pushed to GitHub

---

## 📋 Deployment Steps

### 1️⃣ Deploy Backend (Render)

- [ ] Go to [render.com](https://render.com)
- [ ] Sign up/Login with GitHub
- [ ] Create "New" → "Web Service"
- [ ] Connect your GitHub repo
- [ ] Set these configs:
  - Name: `whos-the-real-backend`
  - Environment: `Node`
  - Start command: `node src/server.js`
  - Plan: **Free** ✓
- [ ] Deploy (takes 3-5 min)
- [ ] **Copy your backend URL** (looks like: `https://whos-the-real-backend.onrender.com`)

### 2️⃣ Deploy Frontend (Netlify)

- [ ] Go to [netlify.com](https://netlify.com)
- [ ] Sign up/Login with GitHub
- [ ] "Add new site" → "Import an existing project"
- [ ] Select your GitHub repo
- [ ] Configure build:
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] Click "Deploy site" (takes 1-2 min)
- [ ] Go to **Site settings** → **Build & deploy** → **Environment**
- [ ] Add environment variable:
  ```
  VITE_BACKEND_URL = [paste your render URL here]
  ```
- [ ] Trigger redeploy (push to GitHub or manual redeploy)
- [ ] **Copy your frontend URL** (looks like: `https://your-site.netlify.app`)

---

## ✅ After Deployment

**Share this URL with friends:**
```
https://your-site.netlify.app
```

Each friend:
1. Opens the link
2. First player: "Create Room" → Share code with others
3. Others: "Join Room" → Enter code
4. Once 6 players: "Start Game"

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Backend not connecting" | Check `VITE_BACKEND_URL` in Netlify exactly matches Render URL (copy-paste!) |
| Render says "Build failed" | Check logs on Render dashboard. Run `npm install` locally to verify. |
| Netlify says "Build failed" | Run `npm run build` locally to test. Check `dist/` folder exists. |
| Socket errors in console | Check browser console → fix CORS issues → clear cache and reload |
| Render service sleeping | First request after inactivity takes 10-30sec (normal). Keep it running by visiting regularly. |

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup and troubleshooting.
