# Deployment Guide

Deploy **Who's the Real One** game online for multiplayer testing with friends.

## Frontend: Deploy to Netlify

### Prerequisites
- GitHub account with your repo pushed
- Netlify account (free, login via GitHub)

### Steps

1. **Connect GitHub to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git" → Connect to GitHub
   - Authorize and select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: Set in Netlify dashboard (Settings → Environment)

3. **Set Environment Variable in Netlify**
   - Go to: **Site settings** → **Build & deploy** → **Environment**
   - Click "Edit variables" and add:
     ```
     VITE_BACKEND_URL = https://your-backend-url.onrender.com
     ```
     *(You'll get this URL after deploying backend)*

4. **Deploy**
   - Push to GitHub → Netlify auto-deploys
   - Your site will be at: `https://your-site-name.netlify.app`

---

## Backend: Deploy to Render

Render has a generous free tier perfect for this game.

### Prerequisites
- GitHub account with your repo pushed
- Render account (free, login via GitHub at [render.com](https://render.com))

### Steps

1. **Create New Web Service on Render**
   - Go to [render.com/dashboard](https://render.com/dashboard)
   - Click "Create +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `whos-the-real-backend` (or similar)
   - **Environment**: `Node`
   - **Build command**: Leave empty (auto-detected)
   - **Start command**: `node src/server.js`
   - **Plan**: `Free` (sufficient for testing)

3. **Set Environment Variables**
   - Scroll to "Environment Variables" section
   - Add:
     ```
     NODE_ENV = production
     PORT = 3001
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Copy the service URL (e.g., `https://whos-the-real-backend.onrender.com`)

5. **Update Netlify with Backend URL**
   - Go back to Netlify site settings
   - Update `VITE_BACKEND_URL` to your Render backend URL
   - Trigger a redeploy (push to GitHub or manually)

---

## Testing with Friends 🎮

1. **Share your Netlify URL**: `https://your-site-name.netlify.app`
2. Each friend opens the link in their browser
3. **First player**: Click "Create a Room" → Get room code
4. **Other players**: Click "Join Room" → Enter room code
5. **Start game** once 6-8 players are in the lobby

---

## Troubleshooting

### "Backend not responding" error
- Check Render service is running (green status on dashboard)
- Verify `VITE_BACKEND_URL` in Netlify matches your Render URL exactly (no trailing slash)
- Check Render logs for errors: Service dashboard → Logs tab

### Players can't join room
- Ensure room code is uppercase
- Check 6-8 players are in the lobby (requirement)
- Wait a few seconds after joining

### Socket connection errors
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private mode
- Check browser console for CORS errors

---

## Local Testing Before Deployment

Verify everything works locally first:

```bash
# Terminal 1: Backend
cd d:\sshhh\backend
node src/server.js
# Should log: "🎮 Server running on port 3001"

# Terminal 2: Frontend  
cd d:\sshhh\frontend
npm run dev
# Should log: "➜  Local:   http://localhost:5173/"

# Test in browser
open http://localhost:5173
```

Once working locally, deploy to Netlify + Render.

---

## Cost & Limits

- **Netlify Free**: Unlimited deployments, ample bandwidth, perfect for your game
- **Render Free**: 750 hours/month (always-free tier), auto-sleeps after 15 min inactivity
  - ℹ️ First request after sleep takes 10-30 seconds (cold start)
  - Upgrade to paid if you want instant responses

---

## Support

If you hit issues:
1. Check Render/Netlify dashboards for service status
2. Review build logs in Netlify: **Deploys** tab
3. Review runtime logs in Render: **Logs** tab
4. Clear browser cache and retry

Happy gaming! 🎉
