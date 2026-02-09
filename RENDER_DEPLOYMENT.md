# Render Deployment Guide

## Overview
This guide covers deploying the Thevaiya Paiya backend to Render while the frontend is hosted on GitHub Pages.

## Deployment Architecture
```
GitHub Pages (Frontend)
  ↓ (HTTP requests to)
Render (Backend API + WebSocket)
```

## Step-by-Step Deployment

### 1. Connect GitHub Repository to Render

1. Go to [render.com](https://render.com)
2. Sign in/Sign up with GitHub
3. Click **"New"** and select **"Web Service"**
4. Select your `thevaiya-paiya` repository
5. Configure:
   - **Name**: `thevaiya-paiya-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` or `master`
   - **Runtime**: `Docker`
   - **Build Command**: Leave empty (Docker handles it)
   - **Start Command**: Leave empty (Docker handles it)

### 2. Configure Environment Variables

In the Render dashboard, go to **Environment** and add:

```
NODE_ENV = production
PORT = 3001
FRONTEND_URL = https://thevaiya-paiya.github.io/thevaiya-paiya
CORS_ORIGIN = https://thevaiya-paiya.github.io
```

**Note**: If using a custom domain, update `FRONTEND_URL` accordingly.

### 3. Deploy Using render.yaml

Alternatively, use the `render.yaml` file for Infrastructure as Code:

```bash
# Push to GitHub
git add .
git commit -m "Add Render deployment config"
git push origin main

# Render will auto-detect render.yaml and deploy
```

### 4. Get Your Backend URL

After deployment completes:
1. Go to your service dashboard on Render
2. Copy the service URL (should look like `https://thevaiya-paiya-xxxx.onrender.com`)
3. This is your backend URL for the frontend to connect to

## Configure Frontend to Use Render Backend

### Option A: Use Environment Variables

1. Create/update `frontend/.env.production.local`:
```
VITE_API_URL=https://thevaiya-paiya-xxxx.onrender.com
VITE_SOCKET_URL=https://thevaiya-paiya-xxxx.onrender.com
```

2. Update frontend code to use these:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Use in API calls
axios.get(`${API_URL}/api/rooms`);

// Use in Socket.io
io(SOCKET_URL);
```

### Option B: Hardcode for Simple Setup

```javascript
const API_URL = 'https://thevaiya-paiya-xxxx.onrender.com';
const SOCKET_URL = 'https://thevaiya-paiya-xxxx.onrender.com';
```

## Database Setup (Optional)

If you need persistent data storage:

### Using Render PostgreSQL Database
1. In Render dashboard, click **"New"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `thevaiya-paiya-db`
   - **PostgreSQL Version**: Latest
   - **Region**: Same as backend
3. Note the connection string

### Update Backend to Use PostgreSQL
Currently, the backend uses SQLite. To use PostgreSQL:

1. Install PostgreSQL adapter:
```bash
npm install --save pg
```

2. Update `backend/src/config/database.js` to use PostgreSQL
3. Add database connection string to Render environment

## Monitoring & Troubleshooting

### Check Logs
1. Go to Render dashboard
2. Select your service
3. Click **"Logs"** tab
4. Watch for deployment or runtime errors

### Common Issues

**Issue**: 503 Service Unavailable
- **Cause**: Backend still building or crashed
- **Fix**: Check logs, wait for build to complete

**Issue**: CORS errors in browser console
- **Cause**: Frontend URL not in CORS whitelist
- **Fix**: Update `FRONTEND_URL` and `CORS_ORIGIN` in Render environment

**Issue**: Connection refused to `localhost:3001`
- **Cause**: Using development API URL in production
- **Fix**: Update frontend to use Render backend URL (not localhost)

**Issue**: WebSocket connection fails
- **Cause**: Socket.io CORS not configured properly
- **Fix**: Ensure `FRONTEND_URL` matches exactly (including https://)

### Restart Service
If issues occur:
1. Go to service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Cold Start
Render free tier services spin down after 15 minutes of inactivity. First request may take 30+ seconds.

## Scale & Optimization

### For Production Use
Renderer free tier is suitable for small games. For more players:

1. **Upgrade to Paid Plan**: Better performance and uptime
2. **Use WebSocket**: Already configured with Socket.io
3. **Database**: Move to PostgreSQL for persistence
4. **Caching**: Implement Redis for session management

## Deployment Checklist

- [ ] Repository connected to Render
- [ ] `render.yaml` configured correctly
- [ ] Backend environment variables set
- [ ] Frontend can reach backend URL
- [ ] CORS errors resolved
- [ ] Database initialized (if using PostgreSQL)
- [ ] Test creating room on GitHub Pages
- [ ] Test game functionality
- [ ] Monitor logs for errors

## Environment Variables Reference

### Backend (.env or Render)
| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3001` | Default port |
| `FRONTEND_URL` | `https://yourdomain.com` | For CORS |
| `CORS_ORIGIN` | `https://yourdomain.com` | GitHub Pages origin |
| `DATABASE_URL` | Postgres string | Optional, if using DB |

## Useful Render Resources
- [Render Docs](https://render.com/docs)
- [Docker Deployment](https://render.com/docs/deploy-docker)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Web Services](https://render.com/docs/web-services)
