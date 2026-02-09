# GitHub Pages Deployment Guide

## Setup Instructions

### 1. Update Your Repository Information
Edit `frontend/package.json` and replace `<username>` with your GitHub username:
```json
"homepage": "https://yourusername.github.io/thevaiya-paiya"
```

### 2. Configure GitHub Repository

#### Enable GitHub Pages:
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - Save

#### Set main branch (if needed):
1. Go to **Settings** → **Branches**
2. Ensure your default branch is set to `main` or `master`

### 3. Deploy

#### Option A: Automatic Deployment (Recommended)
Just push to your main/master branch:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Check out the code
- Install dependencies
- Build the Vite app
- Deploy to GitHub Pages

#### Option B: Manual Deployment
If you prefer local deployment with `gh-pages`:
```bash
cd frontend
npm install  # Install gh-pages package
npm run deploy
```

### 4. Verify Deployment

1. Check **Actions** tab on GitHub to see the workflow running
2. Once complete, visit: `https://yourusername.github.io/thevaiya-paiya`

## Important Notes

### Backend Integration
⚠️ **GitHub Pages only hosts static files**. This deployment is for the **frontend only**.

For full functionality, you'll need to:
- Deploy the backend separately (Render, Railway, Heroku, etc.)
- Update the API endpoint in your frontend code to point to the deployed backend
- Use environment variables to manage different API endpoints (dev/production)

### API Configuration
Update your frontend to use a deployed backend:
```javascript
// env.development.local (for local development)
VITE_API_URL=http://localhost:3001

// env.production.local (for production)
VITE_API_URL=https://your-backend.onrender.com
```

Then in your code:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

### Files Created
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `frontend/public/.nojekyll` - Disables Jekyll processing on GitHub Pages
- Updated `frontend/package.json` - Added gh-pages and deploy scripts
- Updated `frontend/vite.config.js` - Added base path configuration

## Troubleshooting

### 404 on assets
If assets return 404, ensure:
- `vite.config.js` has `base: '/thevaiya-paiya/'` set correctly
- The GitHub Actions workflow completed successfully
- Repository name matches in the homepage URL

### Deployment fails
Check the Actions tab for error logs. Common issues:
- Missing `gh-pages` package (only needed for manual deployment)
- Incorrect repository name in homepage URL
- Branch protection rules preventing deployment

### Custom domain
To use a custom domain:
1. Add a `CNAME` file in `frontend/public/` with your domain
2. Configure DNS records on your domain provider
3. Update GitHub Pages settings to use the custom domain
