---
name: railway-deploy
description: Use when reviewing or preparing Railway deployment, Vue Vite static hosting, SPA routing, environment variables, and release checks for Project AURA.
---
# Railway Deployment
1. Inspect repo, build scripts, existing backend and Railway settings before proposing changes.
2. For static Vue/Vite apps, prefer a production static server with SPA fallback (e.g., Caddy) rather than Vite dev server.
3. Respect Railway PORT, verify /health and deep-link routing, and use Railway's official Vue guide.
4. Never place secrets in VITE_ environment variables; VITE_ is public client-side configuration.
5. Never deploy, push, or change live environment without explicit approval.
6. Validate npm ci and npm run build (or actual scripts) before suggesting deployment.
