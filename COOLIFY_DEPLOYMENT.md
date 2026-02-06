# Coolify Backend Deployment Guide

## Overview
This guide explains how to deploy the Thevaiya Paiya backend on **Coolify**.

## Prerequisites
- Coolify instance running and accessible
- GitHub repository connected to Coolify (or Docker image ready)
- Custom domain or Coolify subdomain configured

## Deployment Steps

### 1. Create a New Service on Coolify
1. Log in to your Coolify dashboard
2. Click **"New Resource"** → **"New Service"**
3. Choose **"Docker Compose"** or **"Dockerfile"**

### 2. Configure Service Settings

#### Using Dockerfile (Recommended)
- **Repository/Source**: Point to your GitHub repo or upload code
- **Dockerfile Path**: `backend/Dockerfile`
- **Build Command**: Pre-configured in Dockerfile
- **Startup Command**: Pre-configured in Dockerfile

#### Service Configuration
- **Service Name**: `thevaiya-paiya-backend`
- **Port**: `3001` (default, configurable)
- **Auto Deploy**: Enable to auto-deploy on git push

### 3. Set Environment Variables

Add these variables in the Coolify dashboard (Service Settings → Environment Variables):

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_PATH=/data/game.db
```

**Optional (if using Supabase or Firebase):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FIREBASE_CONFIG=your_firebase_config
```

### 4. Configure Persistent Storage (Database)

For SQLite database persistence:
1. In Coolify, add a **Volume** mount:
   - **Mount Path**: `/data`
   - **Persist**: Yes

Or use a Postgres/MySQL database instead of SQLite.

### 5. Set Up Domain/Networking

1. Configure your custom domain or use Coolify's proxy
2. Update `FRONTEND_URL` environment variable to match your frontend deployment
3. Ensure CORS is properly configured in backend (localhost origins removed in production)

### 6. Deploy

1. Click **"Deploy"** button
2. Monitor logs in the Coolify dashboard
3. Verify service is running: `https://your-backend-domain/health` (if endpoint exists)

## Docker Compose Alternative

If you prefer Docker Compose (for Coolify's Docker Compose feature):

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      FRONTEND_URL: ${FRONTEND_URL}
      DATABASE_PATH: /data/game.db
    volumes:
      - backend-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  backend-data:
```

Save as `docker-compose.yml` in root directory.

## Connecting Frontend to Backend

Update your frontend environment variables:

```
VITE_BACKEND_URL=https://your-backend-domain.coolify.io
```

Or, if using a custom domain:

```
VITE_BACKEND_URL=https://api.your-domain.com
```

## Troubleshooting

### Port Already in Use
- Check if another service is using port 3001
- Modify in Coolify dashboard → change port binding

### Database Not Persisting
- Ensure volume mount is configured correctly
- Check Coolify storage settings

### CORS Errors
- Update `FRONTEND_URL` environment variable
- Verify frontend domain is correctly set

### Connection Timeout
- Check firewall rules
- Verify service is running: `coolify logs [service-name]`

## Monitoring

Monitor your service in Coolify dashboard:
- **CPU/Memory Usage**: View in metrics
- **Logs**: Real-time log streaming
- **Auto-restart**: Enabled by default

## Rollback

To rollback to a previous version:
1. Go to Service → Deployments
2. Select previous deployment
3. Click "Activate"

---

**Need Help?** Check Coolify documentation: https://docs.coollify.io
