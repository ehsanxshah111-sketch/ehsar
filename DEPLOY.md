# Deploying Ehsar to Vercel (two separate projects)

The frontend and backend deploy as **two independent Vercel projects**,
each with its own URL. This is simpler and more reliable than trying to
serve both from one domain - each project is just a plain, standard
deployment Vercel already knows how to handle correctly with no custom
routing config to get wrong.

```
ehsar-mern/
  backend/
    api/index.js     <- Vercel auto-detects this as the serverless function
    vercel.json       <- routes every path to that one function
    app.js            <- your actual Express app, unchanged
  frontend/
    (plain Vite app - Vercel's zero-config Vite handling
     already does SPA routing correctly, no vercel.json needed here)
```

You'll deploy these as **two separate "Add New Project" imports** in
Vercel, both pointing at the same GitHub repo but with a different **Root
Directory** each.

---

## 1. MongoDB Atlas (same as before, if you've already done this, skip)

1. Free cluster at mongodb.com/cloud/atlas.
2. **Network Access** → allow `0.0.0.0/0` (Vercel has no fixed IP).
3. **Database Access** → create a user + password.
4. Copy the connection string from **Connect → Drivers**, and make sure it
   has a database name in it: `.../ehsar?retryWrites=true&w=majority`.

---

## 2. Deploy the backend first

1. Vercel → **Add New Project** → import your repo.
2. **Root Directory: `backend`** (click Edit next to it, select the
   `backend` folder specifically).
3. Framework Preset: it should auto-detect as "Other" / Node - that's
   correct, leave it.
4. Add these Environment Variables (Production checked for all):

   | Variable | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string - generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `CLIENT_URL` | leave blank for now - you'll add this after step 3, once you know the frontend's URL |
   | `ADMIN_SEED_USERNAME` | your choice, e.g. `admin` |
   | `ADMIN_SEED_PASSWORD` | your choice, a strong password |

5. Deploy. Once it finishes, **copy the URL it gives you** (something like
   `https://ehsar-backend-xyz.vercel.app`). Visit it in a browser - you
   should see the plain text "Ehsar API is running". That confirms the
   function itself works, before you even touch the frontend.

---

## 3. Deploy the frontend

1. Vercel → **Add New Project** → import the **same repo** again.
2. **Root Directory: `frontend`**.
3. Framework Preset should auto-detect as **Vite** - leave it as-is,
   don't override it.
4. Add this Environment Variable:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://ehsar-backend-xyz.vercel.app/api` (your actual backend URL from step 2, with `/api` on the end) |

5. Deploy. Copy this URL too (something like `https://ehsar-pearl.vercel.app`).

---

## 4. Connect the two: update the backend's CORS setting

1. Go back to the **backend** project → Settings → Environment Variables.
2. Edit `CLIENT_URL` and set it to your actual frontend URL from step 3,
   e.g. `https://ehsar-pearl.vercel.app` (no trailing slash).
3. **Redeploy the backend** (Deployments tab → ⋯ on the latest one →
   Redeploy) - environment variable changes don't apply until you redeploy.

---

## 5. Create your admin account

Run this locally, pointed at your Atlas database (same one the backend
uses in production):

```powershell
cd backend
$env:MONGO_URI="your-atlas-connection-string"
$env:ADMIN_SEED_USERNAME="admin"
$env:ADMIN_SEED_PASSWORD="YourStrongPassword123"
node utils/createAdmin.js
```

It prints the username/password to confirm, and is safe to run again
later to reset your password - it never touches products, orders, or
anything else.

---

## 6. Test it end to end

1. Visit your frontend URL → confirm products/banners load (this proves
   `VITE_API_URL` is correct and CORS is happy).
2. Visit `https://your-frontend-url/ehsar-control-x7q9` directly (typed
   straight into the address bar, not clicked from within the site) - it
   should load the login form, not a 404. Vite's zero-config SPA handling
   takes care of this automatically now.
3. Log in with the account from step 5.
4. Open DevTools → Network tab if anything fails - the exact status code
   and response body tells us precisely what's wrong instead of guessing:
   - **CORS error in the console** → `CLIENT_URL` on the backend doesn't
     exactly match your frontend's real URL, or you forgot to redeploy
     the backend after changing it.
   - **404 on the login request** → `VITE_API_URL` is wrong, or you
     forgot to redeploy the *frontend* after setting/changing it (Vite
     bakes env vars in at build time, so this one especially needs a
     fresh deploy to take effect).
   - **401 with "Invalid credentials"** → this one's real - the username/
     password genuinely don't match. Re-run `createAdmin.js`.
   - **500 error** → check the backend project's Function Logs in the
     Vercel dashboard for the actual error, usually a `MONGO_URI` problem.

---

## Local development is unchanged

Nothing about `npm run dev` in either folder changes - this only affects
how the two are deployed to Vercel, not how you develop locally.
