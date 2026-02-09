# Environment Variables Configuration

## Backend Environment (render.yaml / .env)

```bash
# Node Environment
NODE_ENV=production
PORT=3001

# CORS Configuration for GitHub Pages Frontend
FRONTEND_URL=https://thevaiya-paiya.github.io/thevaiya-paiya
CORS_ORIGIN=https://thevaiya-paiya.github.io

# Optional: Database Connection
DATABASE_URL=postgresql://user:password@host:port/database
```

## Frontend Environment (frontend/.env.production.local)

```bash
# Backend API Configuration
VITE_API_URL=https://thevaiya-paiya-xxxx.onrender.com
VITE_SOCKET_URL=https://thevaiya-paiya-xxxx.onrender.com
```

## Frontend Environment (frontend/.env.development.local)

```bash
# Local Development
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## How to Set Environment Variables

### Method 1: Render Dashboard (Recommended)

1. Go to your service on Render
2. Click **Settings** → **Environment**
3. Add variables one by one:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `FRONTEND_URL` = `https://thevaiya-paiya.github.io/thevaiya-paiya`
   - `CORS_ORIGIN` = `https://thevaiya-paiya.github.io`

### Method 2: render.yaml

Already configured in `render.yaml` - Render reads this automatically on deployment.

### Method 3: Local .env Files

For local development:

1. Create `backend/.env`:
```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

2. Create `frontend/.env.development.local`:
```bash
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

**Important**: Never commit `.env` files. Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

## Usage in Frontend Code

```javascript
// Access environment variables
const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Example: API request
import axios from 'axios';
const response = await axios.get(`${API_URL}/api/rooms`);

// Example: Socket.io connection
import io from 'socket.io-client';
const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## Usage in Backend Code

```javascript
// Access environment variables
const port = process.env.PORT || 3001;
const env = process.env.NODE_ENV || 'development';
const frontendUrl = process.env.FRONTEND_URL;

console.log(`Server running on port ${port} in ${env} mode`);
```

## Deployment Flow

```
┌─────────────────┐
│ Local Development
│ .env.local      │
└────────┬────────┘
         │
    npm run dev
         │
         ↓
┌─────────────────┐
│ GitHub (main)   │
│ render.yaml     │
└────────┬────────┘
         │
    git push
         │
         ↓
┌─────────────────┐
│ Render Build    │
│ reads render.yaml
│ sets env vars   │
└────────┬────────┘
         │
    npm run build
         │
         ↓
┌─────────────────┐
│ Render Deploys  │
│ Service URL:
│ https://xxx     │
└─────────────────┘
```

## Security Best Practices

⚠️ **Never commit sensitive data**:
- API keys
- Database credentials
- Secret tokens
- Database URLs

✅ **Do this instead**:
- Use `.gitignore` for local `.env` files
- Store secrets in Render's Environment settings
- Use GitHub Secrets for Actions (if needed)
- Use unique secrets per environment (dev/prod)

## Updating Environment Variables

### On Render
1. Go to service settings
2. Click **Environment**
3. Edit a variable
4. Click **Save**
5. Service auto-redeploys with new values

### Locally
1. Update `.env.local` files
2. Restart dev server (`npm run dev`)
3. Variables reload automatically

## Troubleshooting

**Frontend can't reach backend**
- Check `VITE_API_URL` matches Render service URL
- Ensure `FRONTEND_URL` is set in Render environment
- Check browser console for CORS errors

**Environment variables not loading**
- Confirm file names are correct (`.env.production.local`, etc.)
- Restart dev server or redeploy
- Check that variables are actually set in Render dashboard

**Mixed content error (HTTP/HTTPS)**
- All URLs must use HTTPS in production
- Render automatically provides HTTPS
- Update GitHub Pages custom domain if needed
