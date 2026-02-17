# 🚨 Deployment Critical Fix

You are seeing "This function has crashed" on Netlify because **Netlify does not support this application architecture.**

## ❌ Why Netlify Failed
1.  **Custom Server**: This app uses a custom Node.js server (`server.ts`) for Socket.IO. Netlify handles apps as *Serverless Functions*, which cannot run custom servers or long-lived WebSocket connections.
2.  **SQLite Database**: This app uses `dev.db` (a file). Netlify's file system is **Read-Only** and **Ephemeral** (resets after every request). You cannot save votes to a file on Netlify.

## ✅ The Solution: Deploy to Render or Railway
You must use a hosting provider that supports **Persistent Node.js Servers**.

### Option A: Deploy on Render (Recommended/Free)
1.  Push your latest code to GitHub.
2.  Go to [dashboard.render.com](https://dashboard.render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Configure:**
    *   **Runtime**: Node
    *   **Build Command**: `npm install && npx prisma generate && npm run build`
    *   **Start Command**: `npm start`
6.  Click **Deploy Web Service**.

### Option B: Deploy on Railway
1.  Go to [railway.app](https://railway.app/).
2.  "Start a New Project" -> "Deploy from GitHub repo".
3.  Railway will auto-detect the app.
4.  Go to **Settings** -> **Generate Domain** to get a URL.
5.  *Note: For SQLite data to persist across deployments on Railway, you'd need a Volume, but for a demo, standard deployment works (data resets on new deploy).*

## ⚠️ Important Database Note for Production
Running SQLite (`dev.db`) on any cloud hosting means your database **might reset** when the server restarts or redeploys.
For a true production app, you would switch `provider = "sqlite"` to `provider = "postgresql"` in `schema.prisma` and perform a migration.

**For this assignment, deploying to Render/Railway is sufficient to make the app "work" end-to-end.**
