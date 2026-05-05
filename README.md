# 📖 BookMarket — Engineering Textbooks

A React SPA for engineering students to browse and purchase B.Tech textbooks with campus delivery.

**Tech stack:** Vite · React 19 · React Router v7 · React Hot Toast · React Icons · Vanilla CSS

---

## 🚀 Deploy to Vercel

### One-click (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Vercel auto-detects Vite — just click **Deploy**

No environment variables are required for the demo build.

### Manual deploy via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Running Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install chromium

# Run all tests
npx playwright test

# Run with interactive UI
npx playwright test --ui

# HTML report
npx playwright test --reporter=html
```

> The dev server (`npm run dev`) must be running before executing tests.

---

## 📂 Project Structure

```
book-market/
├── public/               Static assets
├── src/
│   ├── components/       Shared UI components (Navbar, BookCard, Sidebar …)
│   ├── context/          React context (Auth, Cart, Books)
│   ├── pages/            Route-level pages
│   ├── App.jsx           Router + layout setup
│   ├── main.jsx          Entry point
│   └── index.css         Global design system (CSS variables + components)
├── tests/                Playwright test suite
├── vercel.json           Vercel deployment config (SPA rewrites + cache headers)
└── vite.config.js        Vite + Tailwind build config
```

---

## 🔑 Demo Credentials

| Field    | Value                       |
|----------|-----------------------------|
| Email    | `student@bookmarket.com`    |
| Password | `password123`               |

---

## ✨ Features

- Branch & year-based book filtering (CSE, ECE, Mechanical, Civil, EEE …)
- Shopping cart with promo code support (`STUDENT10`, `BOOK20`)
- Real-time order tracking with 10-minute delivery simulation
- Order modify / cancel within 3-minute packing window
- Wishlist, dark / light theme, responsive design
