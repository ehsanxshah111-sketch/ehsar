# EHSAR — MERN Clothing Store

A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce website for a
men's & women's clothing brand called **Ehsar**, styled after brands like
Zara and H&M — clean, classic, minimal. Includes a hidden admin panel for
managing the whole store: products, banners, orders, payments, and customers.

## What's included

- **Storefront**: Home page with rotating banner carousel, shop page with
  men/women filtering and search, product detail page with size/color
  selection, and a shopping cart with checkout.
- **Payments**: customers pay via JazzCash, Easypaisa, or Bank Transfer —
  they send payment themselves and submit a transaction ID + required
  screenshot as proof; you verify it in the admin panel before the order
  is confirmed. Your account numbers are editable from the admin panel,
  no code changes needed.
- **Hidden Admin Panel**: not linked from the public site. Reachable only if
  you know the URL. Lets you:
  - Log in with a username/password (JWT-based auth)
  - Change the admin password
  - Add, edit, and delete products
  - Add, edit, and delete homepage banners
  - Manage orders and verify/reject submitted payments
  - Edit your JazzCash/Easypaisa/Bank Transfer account details shown at checkout
  - View a directory of registered customers (name, email, phone — never
    passwords, which are one-way hashed and can't be shown to anyone)
  - View an activity log of admin actions (logins, edits, payment verification, etc.)
- **8 sample products already seeded** (4 men's, 4 women's) using stock
  photography, plus 2 sample banners — so the site looks complete
  immediately. Replace these with your own product photos and copy at your
  leisure (that's exactly what the admin panel is for).

## Tech stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
  password hashing, Helmet, rate limiting on the login route
- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Axios

## Project structure

```
ehsar-mern/
  vercel.json              Vercel Services config (deploy as one project)
  backend/
    app.js                  Express app (routes, middleware - no listen)
    server.js                Local dev entry point (app.listen)
    config/db.js             Mongo connection
    models/                  Admin, User, Product, Banner, Order,
                              PaymentSettings, ActivityLog schemas
    middleware/               auth.js (admin JWT), userAuth.js (customer JWT)
    routes/                   auth, products, banners, users, orders,
                              paymentSettings, activityLogs
    utils/seed.js             Seeds sample data + default admin
  frontend/
    src/
      pages/                  Home, Shop, ProductDetail, Cart, MyOrders
      pages/admin/             AdminLogin, AdminLayout, ManageProducts,
                              ManageBanners, ManageOrders,
                              ManagePaymentSettings, Customers,
                              ActivityLog, ChangePassword, AdminOverview
      components/              Navbar, Footer, BannerCarousel, ProductCard
      context/                 CartContext, CustomerAuthContext, AuthContext
      adminConfig.js            Hidden admin URL path (change this!)
```

## Getting started (local development)

### 1. Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - Local: install MongoDB Community Server and run it locally, or
  - Free hosted: a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ehsar        # or your Atlas connection string
JWT_SECRET=replace_with_a_long_random_string
CLIENT_URL=http://localhost:5173
ADMIN_SEED_USERNAME=admin
ADMIN_SEED_PASSWORD=Ehsar@Admin123
```

Seed the database with sample products, banners, and the default admin
account:

```bash
npm run seed
```

This prints the admin username/password it created — **log in and change
it immediately** using the Account Settings page in the admin panel.

Start the backend:

```bash
npm run dev      # auto-restarts on changes (nodemon)
# or
npm start
```

The API runs at `http://localhost:5000`.

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your backend:

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Visit `http://localhost:5173` for the storefront.

### 4. Accessing the hidden admin panel

```
http://localhost:5173/ehsar-control-x7q9
```

**Before you deploy this for real:**

1. Open `frontend/src/adminConfig.js` and change `ADMIN_LOGIN_PATH` /
   `ADMIN_DASHBOARD_PATH` to something unpredictable and private.
2. Change the seeded admin password immediately via Account Settings.
3. Set a strong, random `JWT_SECRET` in the backend `.env`.
4. Never commit your real `.env` files (they're already git-ignored).

### 5. Adding your own products, banners & payment details

Everything is editable from the admin panel — no code changes needed:

- **Products** → Admin sidebar → Products → "+ Add Product". Fill in name,
  price, category (men/women), sub-category, sizes, colors, and image
  URLs (comma-separated). Host your product photos anywhere (e.g. imgur,
  Cloudinary, your own CDN) and paste the URLs in — a real link starting
  with `http://` or `https://`, not raw image file data.
- **Banners** → Admin sidebar → Banners → "+ Add Banner". Same image URL
  rule applies. Toggle banners active/hidden without deleting them.
- **Payment Settings** → Admin sidebar → Payment Settings → enter your
  real JazzCash, Easypaisa, and bank account details. These are exactly
  what customers see at checkout.
- **Orders** → Admin sidebar → Orders → check a customer's submitted
  transaction ID and screenshot against your own JazzCash/Easypaisa/bank
  account, then mark the payment Verified or Rejected.

The 8 seeded products and 2 seeded banners are placeholders using stock
photography so the site isn't empty on first run — replace them with your
real catalog whenever you're ready.

## Deploying

See [`DEPLOY.md`](./DEPLOY.md) for full step-by-step instructions to
deploy this as a single Vercel project (frontend + backend on one domain,
via [Vercel Services](https://vercel.com/docs/services)).

## Notes on what's a placeholder vs production-ready

- **Payments** use a manual verification flow (customer sends money
  directly to your JazzCash/Easypaisa/bank account and reports it) rather
  than a live payment gateway API — JazzCash/Easypaisa require a
  registered business merchant account to integrate directly, which isn't
  free for an individual. This manual flow is what most small stores in
  Pakistan actually use.
- **Product images** are hot-linked stock photos from Unsplash to seed the
  site — replace with your own hosted images.
- **Admin auth** uses JWT + bcrypt and is reasonably secure for a small
  store, but if this becomes a serious storefront, also add HTTPS
  (Vercel gives you this by default), 2FA on the admin login, and
  stricter rate limiting/logging.
