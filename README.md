# Vulkanizer Željko — Tyre Webshop

A modern webshop and online presence for **Vulkanizer Željko**, a tyre and wheel service business
(tyre sales, mounting, balancing, wheel alignment, puncture repair, and seasonal tyre changes).

The site is built to immediately communicate one thing: **tyres, performance, and professional
automotive service** — not a generic e-commerce template.

🔗 **Live preview:** _add your Vercel URL here_
📦 **Repository:** https://github.com/Jaramb00/tyre-webshop

---

## What this application is for

It gives the business a professional storefront where customers can:

- Browse tyres by **brand** (Michelin, Continental, Pirelli, Goodyear, Bridgestone, Hankook,
  Yokohama, Dunlop) and **season** (summer / winter / all-season)
- See tyre **size, price, rating, and availability** on clean, mobile-friendly product cards
- Learn about the shop's **services** (mounting, balancing, alignment, repair, seasonal change)
- Register, sign in, add items to a cart, and place orders _(these use the backend API — see status below)_

The current catalogue uses clearly-marked **demo products** so the design can be reviewed before the
real product data is loaded.

## Why it was built this way

- **Automotive-first identity.** The palette (anthracite + steel + a single gold accent taken from
  the Željko logo), the display typography (Barlow Condensed), and a **3D interactive tyre** in the
  hero are all chosen to make the brand feel like a premium tyre company (Michelin / Pirelli / F1
  garage energy) rather than a fashion or generic shop.
- **Mobile-first.** Most customers searching for tyre repair or replacement are on their phones, so
  the whole site was audited and fixed for phones, tablets, laptops and large screens (no horizontal
  scrolling, touch-friendly buttons, and the heavy 3D effects degrade gracefully on weaker devices).
- **Real foundation, not a mock-up.** Behind the storefront is a full backend (auth, catalogue,
  cart, orders, payments) so this can grow into a fully working shop, not just a landing page.

---

## Tech stack

**Frontend**
- React 18 + TypeScript + Vite
- MUI (Material UI) v6 with a custom automotive theme
- React Three Fiber / Three.js — procedural 3D tyre hero (rubber tread, alloy rim, gold "Ž" cap,
  moulded "VULKANIZER ŽELJKO" sidewall text)
- Framer Motion — scroll reveals and motion
- Redux Toolkit + TanStack Query

**Backend**
- ASP.NET Core 7 (Clean Architecture: Domain / Application / Infrastructure / API)
- Entity Framework Core + PostgreSQL, Redis caching
- JWT auth with refresh tokens, SignalR real-time hubs
- Stripe (payments), SendGrid (email)

---

## Current status

| Area | Status |
|------|--------|
| Storefront, 3D hero, services, demo catalogue | ✅ Working (deployable as a static frontend) |
| Fully responsive / mobile | ✅ Audited & fixed |
| Sign in / register / cart / checkout | ⏳ Code complete — needs the backend deployed to work |
| Payments & emails | ⏳ Integrated in code — need Stripe/SendGrid keys + testing |

The frontend can be deployed on its own (with demo data) for a client preview. Authenticated
features (login, cart, checkout) start working once the backend API + database are deployed and the
frontend's `VITE_API_URL` points at them.

---

## Running locally

**Frontend**
```bash
cd SmartCommerce/src/SmartCommerce.Frontend
npm install
npm run dev        # http://localhost:3000
```

**Backend** (requires .NET 7 SDK + PostgreSQL, or use the provided docker-compose)
```bash
cd SmartCommerce
docker compose up      # brings up API + Postgres + Redis
```

### Environment

The frontend reads one variable (see `.env.example`):

```
VITE_API_URL=   # leave empty for a frontend-only preview (uses built-in demo tyres)
```

Backend secrets (database connection, JWT signing key, Stripe/SendGrid keys) are **not** committed —
they are provided via environment variables / local `appsettings.Development.json`, which is
git-ignored.

---

## Deployment

- **Frontend →** Vercel (or Netlify). Set the project root directory to
  `SmartCommerce/src/SmartCommerce.Frontend`; the included `vercel.json` / `netlify.toml` handle the
  Vite build and single-page-app routing.
- **Backend →** Render / Railway / Azure (ASP.NET + managed PostgreSQL) once the API goes live.

---

## Built with Claude

This project's frontend redesign, the 3D tyre hero, the full mobile-responsiveness audit, the
deployment configuration, and this documentation were built with **Claude (Anthropic)** using
**Claude Code**. Claude was used to:

- Redesign a generic e-commerce UI into a premium automotive brand experience
- Design and implement the interactive React Three Fiber 3D tyre (geometry, PBR materials, lighting,
  post-processing, and grab-to-spin interaction)
- Audit and fix responsiveness across all breakpoints with live in-browser measurements
- Prepare the project for deployment (build fixes, secret handling, `.gitignore`, hosting config)

Commits authored with assistance are marked with a `Co-Authored-By: Claude` trailer.

_Note: as with any AI-assisted project, the code should be reviewed and tested before production use —
especially the payment, authentication, and security paths._
