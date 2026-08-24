# Deploying Ehsar to Vercel

Vercel doesn't run a long-lived Node server, so this project deploys as
**two separate Vercel projects**:

1. **Backend** (`/backend`) — runs as a Vercel serverless function
2. **Frontend** (`/frontend`) — a static Vite build

You'll also need a MongoDB database that's reachable from the internet.
Vercel can't host MongoDB itself — use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (the free M0 tier is enough to start).

---

## 1. Set up MongoDB Atlas (if you haven't already)

1. Create a free cluster at mongodb.com/cloud/atlas.
2. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) —
   Vercel's serverless functions don't have fixed IPs, so you can't
   allowlist a specific one.
3. Under **Database Access**, create a database user with a password.
4. Get your connection string from **Connect → Drivers** — it looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ehsar?retryWrites=true&w=majority`

---

## 2. Deploy the backend

1. Push this repo to GitHub (or push `/backend` as its own repo).
2. In Vercel: **Add New → Project**, import the repo, and set the
   **Root Directory** to `backend`.
3. Framework preset: **Other**. Build command and output directory can be
   left blank — Vercel auto-detects the `/api` folder as serverless functions.
4. Add the environment variables below, then deploy.
5. Once deployed, note the URL Vercel gives you, e.g.
   `https://ehsar-backend.vercel.app` — the API lives at
   `https://ehsar-backend.vercel.app/api`.

### Backend environment variables (set in Vercel → Project → Settings → Environment Variables)

| Variable | Value | Notes |
|---|---|---|
| `MONGO_URI` | your Atlas connection string | include the database name, e.g. `/ehsar` before the `?` |
| `JWT_SECRET` | a long random string | generate your own — do not reuse an example value in production |
| `CLIENT_URL` | your frontend's Vercel URL, e.g. `https://ehsar.vercel.app` | comma-separate multiple origins if needed |
| `ADMIN_SEED_USERNAME` | your choice, e.g. `admin` | only used by the one-time seed script |
| `ADMIN_SEED_PASSWORD` | your choice, a strong password | only used by the one-time seed script |

`PORT` is **not** needed on Vercel (serverless functions don't listen on a port) — it's only used by `server.js` for local development.

### Creating your admin account

The seed script (`npm run seed`) creates the first admin account. Run it
**locally**, pointed at your production database, once:

```bash
cd backend
MONGO_URI="your-atlas-connection-string" ADMIN_SEED_USERNAME=admin ADMIN_SEED_PASSWORD="your-strong-password" npm run seed
```

---

## 3. Deploy the frontend

1. In Vercel: **Add New → Project**, import the same repo, set **Root
   Directory** to `frontend`.
2. Framework preset: Vercel should auto-detect **Vite**. Build command
   `npm run build`, output directory `dist` (these are the Vite defaults —
   confirm they're filled in).
3. Add the environment variable below, then deploy.

### Frontend environment variable

| Variable | Value |
|---|---|
| `VITE_API_URL` | your backend's API base URL, e.g. `https://ehsar-backend.vercel.app/api` |

**Important:** Vite bakes environment variables into the build at build
time. If you change `VITE_API_URL` later, you must redeploy the frontend
for the change to take effect.

---

## 4. After both are deployed

- Visit your frontend URL and confirm products/banners load (this proves
  the frontend can reach the backend and CORS is configured correctly).
- Log into the admin panel at `/ehsar-control-x7q9` with the account you
  seeded, then set your JazzCash/Easypaisa/Bank Transfer numbers under
  **Payment Settings**.
- If you see CORS errors in the browser console, double check `CLIENT_URL`
  on the backend exactly matches your frontend's URL (no trailing slash).

## Local development still works as before

Nothing about `npm run dev` in either folder has changed — `server.js`
still starts a normal local server on `PORT` (default 5000), and the
frontend still proxies to `http://localhost:5000/api` unless
`VITE_API_URL` is set in a local `.env` file.
