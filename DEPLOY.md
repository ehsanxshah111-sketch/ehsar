# Deploying Ehsar to Vercel

This project deploys as **one Vercel project** using [Vercel Services](https://vercel.com/docs/services) —
your frontend and backend both run under a single domain, so there's no
CORS setup to worry about in production.

```
ehsar-mern/
  vercel.json        <- defines both services and how traffic is routed
  frontend/          <- Vite React app, served at /
  backend/           <- Express API, served at /api/*
```

You'll also need a MongoDB database reachable from the internet — Vercel
doesn't host databases. Use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (M0 tier is enough to start).

---

## 1. Set up MongoDB Atlas

1. Create a free cluster at mongodb.com/cloud/atlas.
2. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) —
   Vercel doesn't have fixed outbound IPs, so you can't allowlist a
   specific one.
3. Under **Database Access**, create a database user with a password.
4. Get your connection string from **Connect → Drivers**:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ehsar?retryWrites=true&w=majority`

---

## 2. Push to GitHub

Commit and push this whole `ehsar-mern` folder (including the root
`vercel.json`) to a GitHub repo.

---

## 3. Import into Vercel

1. **Add New → Project**, import your repo.
2. Vercel should detect `vercel.json` at the repo root and show both
   `frontend` and `backend` as services automatically — this is the
   screen where it lists them as "Web Service" / Vite and Express.
3. Leave **Root Directory** as `./` (the root `vercel.json` handles
   routing to each service's own folder — don't point Root Directory at
   `frontend` or `backend` individually).
4. Open **Environment Variables** and add everything from the table
   below.
5. Click **Deploy**.

### Environment variables (set once, shared across both services)

| Variable | Value | Notes |
|---|---|---|
| `MONGO_URI` | your Atlas connection string | include the database name, e.g. `/ehsar` before the `?` |
| `JWT_SECRET` | a long random string | generate your own — don't reuse an example value in production |
| `ADMIN_SEED_USERNAME` | your choice, e.g. `admin` | only used by the one-time seed script |
| `ADMIN_SEED_PASSWORD` | your choice, a strong password | only used by the one-time seed script |
| `VITE_API_URL` | `/api` | relative path — works because frontend and backend now share one domain |

`PORT` and `CLIENT_URL` are **not needed** for this setup — Vercel sets
`PORT` itself for the backend service, and CORS doesn't come into play
since requests are same-origin in production.

---

## 4. Creating your admin account

The seed script (`npm run seed`) creates the first admin account. Run it
**locally**, pointed at your production database, once:

```bash
cd backend
MONGO_URI="your-atlas-connection-string" ADMIN_SEED_USERNAME=admin ADMIN_SEED_PASSWORD="your-strong-password" npm run seed
```

---

## 5. After deploying

- Visit your Vercel domain and confirm products/banners load.
- Log into the admin panel at `/ehsar-control-x7q9` with the account you
  seeded, then set your JazzCash/Easypaisa/Bank Transfer numbers under
  **Payment Settings**.
- If the API doesn't respond, check the backend service's logs in the
  Vercel dashboard for a `MONGO_URI` connection error first — that's the
  most common cause.

---

## Local development is unchanged

`npm run dev` in each folder still works exactly as before — the backend
listens on `PORT` (default 5000) via `server.js`, and the frontend talks
to `http://localhost:5000/api` unless you set `VITE_API_URL` in a local
`.env` file (leave it unset locally, or set it to
`http://localhost:5000/api`).
