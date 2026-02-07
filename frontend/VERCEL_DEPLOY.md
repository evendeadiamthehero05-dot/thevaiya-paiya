# Vercel deployment notes for frontend

- Environment variables
  - Vite exposes only env vars prefixed with `VITE_`. Ensure any client-facing variables start with `VITE_`.
  - Example variable used by this app: `VITE_BACKEND_URL` (used in `src/App.jsx`).

- Recommended project settings
  - In the Vercel project settings, set the **Root Directory** to `frontend` so Vercel builds the frontend app.

- Set environment variables (two options)
  1. Dashboard: go to your Vercel Project > Settings > Environment Variables and add:
     - Name: `VITE_BACKEND_URL`
     - Value: `https://whos-the-real-backend.render.com` (or your production backend URL)
     - Environment: `Production`

  2. Vercel CLI (interactive):
     - Install/Sign in if needed: `npm i -g vercel` then `vercel login`
     - Add the variable: `vercel env add VITE_BACKEND_URL production` and paste the value when prompted.
     - (Optional) Pull variables locally: `vercel env pull .env.local` to create a `.env.local` file.

- After setting env vars
  - Trigger a redeploy by pushing to the repo branch connected to Vercel or use the Vercel dashboard to redeploy.

- Notes
  - Do not commit secret values into the repo. The `.env.production` file here is for convenience reference only; prefer setting values in Vercel settings.
  - Vite will expose `VITE_` variables at build time; changing them requires a rebuild/redeploy.