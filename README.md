# EHSAR — MERN Clothing Store

A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce website for a
men's & women's clothing brand called **Ehsar**, styled after brands like
Zara and H&M — clean, classic, minimal. Includes a hidden admin panel for
managing banners, promotions, and products.

## What's included

- **Storefront**: Home page with rotating banner carousel, shop page with
  men/women filtering and search, product detail page with size/color
  selection, and a shopping cart with checkout flow (demo — wire up a real
  payment provider before going live).
- **Hidden Admin Panel**: not linked from the public site. Reachable only if
  you know the URL. Lets you:
  - Log in with a username/password (JWT-based auth)
  - Change the admin password
  - Add, edit, and delete products
  - Add, edit, and delete homepage banners, including promotional text
    (e.g. "UP TO 50% OFF")
  - See a quick overview of your catalog
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
  backend/
    config/db.js         Mongo connection
    models/               Admin, Product, Banner schemas
    middleware/auth.js     JWT auth middleware
    routes/                auth, products, banners
    utils/seed.js          Seeds sample data + default admin
    server.js               Express app entry point
  frontend/
    src/
      pages/                Home, Shop, ProductDetail, Cart
      pages/admin/           AdminLogin, AdminLayout, ManageProducts,
                              ManageBanners, ChangePassword, AdminOverview
      components/            Navbar, Footer, BannerCarousel, ProductCard
      context/                CartContext, AuthContext
      adminConfig.js          Hidden admin URL path (change this!)
```

## Getting started

### 1. Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - Local: install MongoDB Community Server and run it locally, or
  - Free cloud option: create a free cluster at https://www.mongodb.com/cloud/atlas

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

The admin login is **not linked anywhere on the public site** — no button,
no footer link — by design, so casual visitors won't stumble onto it.

Default path:

```
http://localhost:5173/ehsar-control-x7q9
```

**Before you deploy this for real:**

1. Open `frontend/src/adminConfig.js` and change `ADMIN_LOGIN_PATH` /
   `ADMIN_DASHBOARD_PATH` to something unpredictable and private.
2. Change the seeded admin password immediately via Account Settings.
3. Set a strong, random `JWT_SECRET` in the backend `.env`.
4. Never commit your real `.env` files (they're already git-ignored).

Login credentials after seeding (from your `.env`):

```
Username: admin
Password: Ehsar@Admin123
```

### 5. Adding your own products & banners

Everything is editable from the admin panel — no code changes needed:

- **Products** → Admin sidebar → Products → "+ Add Product". Fill in name,
  price, category (men/women), sub-category, sizes, colors, and image
  URLs (comma-separated). Host your product photos anywhere (e.g. Cloudinary,
  imgur, your own CDN) and paste the URLs in.
- **Banners** → Admin sidebar → Banners → "+ Add Banner". Set the headline,
  promotion text (e.g. "UP TO 50% OFF"), image, and the link the "Shop Now"
  button goes to. Toggle banners active/hidden without deleting them.

The 8 seeded products and 2 seeded banners are placeholders using stock
photography so the site isn't empty on first run — replace them with your
real catalog whenever you're ready.

## Building for production

**Frontend:**
```bash
cd frontend
npm run build
```
This outputs static files to `frontend/dist` — deploy to Vercel, Netlify,
or any static host.

**Backend:**
Deploy the `backend/` folder to any Node host (Render, Railway, a VPS,
etc.), set the environment variables from `.env.example` there, and point
your frontend's `VITE_API_URL` at the deployed API URL.

## Notes on what's a placeholder vs production-ready

- **Checkout** is a demo flow (it clears the cart and shows a thank-you
  screen). Wire it to Stripe, PayPal, or another payment processor before
  accepting real orders.
- **Product images** are hot-linked stock photos from Unsplash to seed the
  site — replace with your own hosted images.
- **Admin auth** uses JWT + bcrypt and is reasonably secure for a small
  store, but if this becomes a serious storefront, also add HTTPS,
  2FA on the admin login, and stricter rate limiting/logging.
