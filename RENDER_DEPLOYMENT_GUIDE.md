# Render Deployment Guide

This guide explains how to deploy both the frontend and backend of Thevaiya Paiya to Render.com.

## Files Modified for Render Deployment

### 1. Frontend Package.json (`frontend/package.json`)
- **Added**: `"start": "vite preview --port 5173"` script
- **Why**: Render requires a start command. This serves the built frontend on port 5173
- **Fixed**: The error `error Command "start" not found`

### 2. Frontend Vite Config (`frontend/vite.config.js`)
- **Changed**: `base: '/thevaiya-paiya/'` → `base: '/'`
- **Why**: When using Render, the frontend is served from the root of its domain (not a subdirectory like GitHub Pages)
- **Changed**: Server port from `3000` → `5173` (standard Vite port)

### 3. Render Configuration (`render.yaml`)
- **Added**: Frontend service configuration
- **Current setup**:
  - Frontend: Node.js runtime, builds with `npm run build`, starts with `npm start`
  - Backend: Docker runtime (unchanged)

## Environment Variables for Render

### Frontend (`VITE_BACKEND_URL`)
- Set to: `https://thevaiya-paiya-backend.onrender.com`
- Accessible in frontend code via: `import.meta.env.VITE_BACKEND_URL`
- Fallback (local dev): `http://localhost:3001`

### Backend
- `FRONTEND_URL`: `https://thevaiya-paiya-frontend.onrender.com`
- `CORS_ORIGIN`: `https://thevaiya-paiya-frontend.onrender.com`
- Both CORS environment variables are read by the backend for proper cross-origin requests

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Render deployment for both frontend and backend"
   git push
   ```

2. **Create Render Account** (if not already done):
   - Go to https://render.com

3. **Deploy via Blueprint**:
   - In Render dashboard, click "New +"
   - Select "Blueprint"
   - Connect your GitHub repository
   - Select the branch to deploy
   - Render will automatically detect and deploy both services from `render.yaml`

4. **Note the Domain Names**:
   - After deployment, Render will assign domain names like:
     - Frontend: `thevaiya-paiya-frontend.onrender.com`
     - Backend: `thevaiya-paiya-backend.onrender.com`
   - You may customize these in Render dashboard settings

5. **Update Environment Variables** (if names differ):
   - If your domain names are different, update:
     - Frontend's `VITE_BACKEND_URL` environment variable
     - Backend's `FRONTEND_URL` and `CORS_ORIGIN` variables
   - In Render dashboard → Service → Environment section

## What the Build Process Does

1. **Frontend**:
   - Installs dependencies: `npm install`
   - Builds: `vite build` (creates `dist` folder)
   - Starts: `vite preview --port 5173` (serves the built files)

2. **Backend**:
   - Docker builds the image
   - Runs the Node.js server on port 3001
   - Connects to database based on environment configuration

## Troubleshooting

- **Frontend shows blank page**: Check that `VITE_BACKEND_URL` is correctly set in Render environment variables
- **Cannot connect to backend**: Verify `CORS_ORIGIN` in backend environment variables matches your frontend domain
- **Database issues**: Check database connection strings in backend environment

## CSS Warnings During Build

The build shows some CSS syntax warnings when minifying. These are non-critical and don't affect functionality. They're related to how the CSS is being parsed during the minification process.
