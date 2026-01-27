---
description: Deploy the frontend to Vercel
---

# Deploy Mine Safety Frontend to Vercel

We have configured your project to communicate with the deployed backend (`https://kavach-backend-clys.onrender.com`).

## Prerequisites
1. You must have a [Vercel account](https://vercel.com/signup).
2. You should have the Vercel CLI installed or use the GitHub integration.

## Option A: Deploy via GitHub (Recommended)
1. Push your latest code (including the new `.env.production` and `vercel.json` files) to your GitHub repository.
2. Go to your Vercel Dashboard and click **"Add New..."** -> **"Project"**.
3. Import your repository.
4. Vercel should automatically detect the settings:
   - Framework Preset: **Vite**
   - Root Directory: `mine-ui` (Important! Select the `mine-ui` folder, not the root if it's nested).
   - Build Command: `npm run build` (or `vite build`)
   - Output Directory: `dist`
5. Click **Deploy**.

## Option B: Deploy via Vercel CLI
If you want to deploy directly from your terminal:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to the frontend directory:
   ```bash
   cd mine-ui
   ```

3. Run the deploy command:
   ```bash
   vercel
   ```
   - Follow the prompts (Login, Setup project, etc.).
   - When asked "In which directory is your code located?", ensure it says `./`.
   - Use default settings for Build Command and Output Directory.

## Verification
- Once deployed, visit the URL provided by Vercel.
- Check the "Network" tab in Developer Tools to confirm that requests are going to `https://kavach-backend-clys.onrender.com` instead of `localhost`.
